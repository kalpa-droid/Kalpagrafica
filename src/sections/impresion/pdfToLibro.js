import { PDFDocument, PageSizes } from 'pdf-lib';

export async function inyectarPDFjs() {
  if (window.pdfjsLib) return;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export async function crearCanvasTapaCustom(coverConfig) {
  if (!coverConfig) return null;
  const width = 1748;
  const height = 2480;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (coverConfig.type === 'upload' && coverConfig.imageUri) {
    const img = new Image();
    img.src = coverConfig.imageUri;
    await new Promise((res) => { img.onload = res; img.onerror = res; });
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    const scale = Math.min(width / (img.width || width), height / (img.height || height));
    const w = (img.width || width) * scale;
    const h = (img.height || height) * scale;
    ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
  } else if (coverConfig.type === 'template') {
    const { title = '', author = '', publisher = '', bgColor = '#1a1a2e', textColor = '#bafdc1', bgImageUri } = coverConfig;
    ctx.fillStyle = bgColor || '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    if (bgImageUri) {
      const img = new Image();
      img.src = bgImageUri;
      await new Promise((res) => { img.onload = res; img.onerror = res; });
      ctx.globalAlpha = 0.35;
      ctx.drawImage(img, 0, 0, width, height);
      ctx.globalAlpha = 1.0;
    }

    ctx.strokeStyle = textColor || '#bafdc1';
    ctx.lineWidth = 12;
    ctx.strokeRect(80, 80, width - 160, height - 160);

    ctx.fillStyle = textColor || '#bafdc1';
    ctx.textAlign = 'center';

    if (title) {
      ctx.font = 'bold 110px Georgia, serif';
      ctx.fillText(title.toUpperCase(), width / 2, height * 0.4, width - 240);
    }

    if (author) {
      ctx.font = '500 65px sans-serif';
      ctx.fillText(author, width / 2, height * 0.52);
    }

    if (publisher) {
      ctx.font = '400 45px sans-serif';
      ctx.fillText(publisher.toUpperCase(), width / 2, height * 0.88);
    }
  }

  return canvas;
}

async function procesarComoImagenes(file, mode, options = {}, onProgress) {
  const {
    fotocopiaStart = 'derecha',
    hasCover = false,
    coverSide = 'derecha',
    refPdfPage = 0,
    refBookPage = 0,
    refPageSide = 'derecha',
    pageRotations = {},
    pageSplitOffsets = {},
    customCover = null
  } = options;

  const newPdf = await PDFDocument.create();
  const arrayBuffer = await file.arrayBuffer();

  const pdf = await window.pdfjsLib.getDocument({
    data: arrayBuffer,
    cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
    cMapPacked: true,
  }).promise;

  let isFirstProcessedSheet = true;

  // Si se generó o subió una Tapa Custom, se inserta en la Página 1
  let effectiveRefPdfPage = refPdfPage;
  if (!hasCover && customCover && (customCover.type === 'upload' || customCover.type === 'template')) {
    const coverCanvas = await crearCanvasTapaCustom(customCover);
    if (coverCanvas) {
      const coverImg = await newPdf.embedJpg(coverCanvas.toDataURL('image/jpeg', 0.92));
      const pageC = newPdf.addPage([coverCanvas.width, coverCanvas.height]);
      pageC.drawImage(coverImg, { x: 0, y: 0, width: coverCanvas.width, height: coverCanvas.height });
      coverCanvas.width = 0; coverCanvas.height = 0;

      // Al haber agregado la tapa al inicio, la página del PDF desplaza su índice +1
      if (effectiveRefPdfPage > 0) {
        effectiveRefPdfPage += 1;
      }
    }
  }

  // Evaluar si se requiere una página en blanco de ajuste justo detrás de la tapa
  let needBlankPageBehindCover = false;
  if (effectiveRefPdfPage > 0 && refBookPage > 0) {
    const isBookPageOdd = refBookPage % 2 !== 0;
    const expectedSide = isBookPageOdd ? 'derecha' : 'izquierda';
    if (refPageSide !== expectedSide) {
      needBlankPageBehindCover = true;
    }
  }

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    if (onProgress) {
      const avance = 10 + Math.floor((pageNum / pdf.numPages) * 45);
      onProgress(`Procesando página ${pageNum} de ${pdf.numPages}...`, avance);
    }

    const page = await pdf.getPage(pageNum);
    const userRotation = pageRotations[pageNum] || 0;
    const viewport = page.getViewport({ scale: 300 / 72, rotation: userRotation });

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = viewport.width;
    tempCanvas.height = viewport.height;
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    await page.render({ canvasContext: tempCtx, viewport }).promise;

    const isFotocopia = mode === 'fotocopia';

    if (isFotocopia) {
      let finalCanvas = tempCanvas;
      const isVertical = tempCanvas.height > tempCanvas.width;

      if (isVertical) {
        finalCanvas = document.createElement('canvas');
        finalCanvas.width = tempCanvas.height;
        finalCanvas.height = tempCanvas.width;
        const finalCtx = finalCanvas.getContext('2d');

        finalCtx.translate(finalCanvas.width / 2, finalCanvas.height / 2);
        finalCtx.rotate(Math.PI / 2);
        finalCtx.drawImage(tempCanvas, -tempCanvas.width / 2, -tempCanvas.height / 2);
      }

      const splitPct = ((pageSplitOffsets[pageNum] !== undefined) ? pageSplitOffsets[pageNum] : 50) / 100;
      const fullW = finalCanvas.width;
      const fullH = finalCanvas.height;
      const splitX = Math.round(fullW * splitPct);
      const leftW = splitX;
      const rightW = fullW - splitX;

      if (isFirstProcessedSheet && (fotocopiaStart === 'derecha' || (hasCover && coverSide === 'derecha'))) {
        const rightCanvas = document.createElement('canvas');
        rightCanvas.width = rightW; rightCanvas.height = fullH;
        rightCanvas.getContext('2d').drawImage(finalCanvas, splitX, 0, rightW, fullH, 0, 0, rightW, fullH);

        const rightImg = await newPdf.embedJpg(rightCanvas.toDataURL('image/jpeg', 0.92));
        const pageR = newPdf.addPage([rightW, fullH]);
        pageR.drawImage(rightImg, { x: 0, y: 0, width: rightW, height: fullH });

        rightCanvas.width = 0; rightCanvas.height = 0;

        // Si se requiere ajuste detrás de la tapa, se inserta 1 hoja A5 en blanco inmediatamente
        if (needBlankPageBehindCover) {
          const blankPage = newPdf.addPage([rightW, fullH]);
          blankPage.drawRectangle({ x: 0, y: 0, width: 0, height: 0 });
        }
      } else {
        const leftCanvas = document.createElement('canvas');
        leftCanvas.width = leftW; leftCanvas.height = fullH;
        leftCanvas.getContext('2d').drawImage(finalCanvas, 0, 0, leftW, fullH, 0, 0, leftW, fullH);

        const rightCanvas = document.createElement('canvas');
        rightCanvas.width = rightW; rightCanvas.height = fullH;
        rightCanvas.getContext('2d').drawImage(finalCanvas, splitX, 0, rightW, fullH, 0, 0, rightW, fullH);

        const leftImg = await newPdf.embedJpg(leftCanvas.toDataURL('image/jpeg', 0.92));
        const rightImg = await newPdf.embedJpg(rightCanvas.toDataURL('image/jpeg', 0.92));

        const pageL = newPdf.addPage([leftW, fullH]);
        pageL.drawImage(leftImg, { x: 0, y: 0, width: leftW, height: fullH });

        const pageR = newPdf.addPage([rightW, fullH]);
        pageR.drawImage(rightImg, { x: 0, y: 0, width: rightW, height: fullH });

        leftCanvas.width = 0; leftCanvas.height = 0;
        rightCanvas.width = 0; rightCanvas.height = 0;
      }

      if (finalCanvas !== tempCanvas) { finalCanvas.width = 0; finalCanvas.height = 0; }
      isFirstProcessedSheet = false;
    } else {
      const imgData = tempCanvas.toDataURL('image/jpeg', 0.92);
      const jpgImage = await newPdf.embedJpg(imgData);
      const newPage = newPdf.addPage([tempCanvas.width, tempCanvas.height]);
      newPage.drawImage(jpgImage, { x: 0, y: 0, width: tempCanvas.width, height: tempCanvas.height });

      // Si es la 1ª página y es la tapa con ajuste necesario detrás de la tapa
      if (pageNum === 1 && hasCover && needBlankPageBehindCover) {
        const blankPage = newPdf.addPage([tempCanvas.width, tempCanvas.height]);
        blankPage.drawRectangle({ x: 0, y: 0, width: 0, height: 0 });
      }
    }

    tempCanvas.width = 0;
    tempCanvas.height = 0;
    page.cleanup();

    if (pageNum % 2 === 0) {
      await new Promise(resolve => setTimeout(resolve, 15));
    }
  }

  try {
    pdf.destroy();
  } catch (e) {
    // ignore
  }

  return newPdf;
}

export async function pdfToLibro(file, mode, options = {}, onProgress) {
  if (onProgress) onProgress('Iniciando motor PDF.js...', 5);
  await inyectarPDFjs();

  const pagesDoc = await procesarComoImagenes(file, mode, options, onProgress);

  const count = pagesDoc.getPageCount();
  if (count === 0) {
    throw new Error('No quedan páginas activas después de aplicar la exclusión.');
  }

  const remainder = (4 - (count % 4)) % 4;
  for (let i = 0; i < remainder; i++) {
    const blank = pagesDoc.addPage(PageSizes.A4);
    blank.drawRectangle({ x: 0, y: 0, width: 0, height: 0 });
  }

  const bookletDoc = await PDFDocument.create();
  const totalPages = pagesDoc.getPageCount();
  const pages = pagesDoc.getPages();
  const totalHojasImpresas = totalPages / 2;

  for (let i = 0; i < totalHojasImpresas; i++) {
    if (onProgress) {
      const avance = 60 + Math.floor((i / totalHojasImpresas) * 35);
      onProgress(`Armando hoja de imposición ${i + 1} de ${totalHojasImpresas}...`, avance);
    }
    if (i % 5 === 0) await new Promise(r => setTimeout(r, 15));

    const isFront = i % 2 === 0;
    const leftIndex = isFront ? totalPages - 1 - i : i;
    const rightIndex = isFront ? i : totalPages - 1 - i;

    const [leftPage] = await bookletDoc.copyPages(pagesDoc, [leftIndex]);
    const [rightPage] = await bookletDoc.copyPages(pagesDoc, [rightIndex]);

    const sheetWidth = PageSizes.A4[1]; // 842 pt
    const sheetHeight = PageSizes.A4[0]; // 595 pt
    const sheet = bookletDoc.addPage([sheetWidth, sheetHeight]);

    const embedL = await bookletDoc.embedPage(leftPage);
    const embedR = await bookletDoc.embedPage(rightPage);

    const halfWidth = sheetWidth / 2;

    const scaleL = Math.min(halfWidth / embedL.width, sheetHeight / embedL.height) * 0.95;
    const scaledWidthL = embedL.width * scaleL;
    const scaledHeightL = embedL.height * scaleL;

    const scaleR = Math.min(halfWidth / embedR.width, sheetHeight / embedR.height) * 0.95;
    const scaledWidthR = embedR.width * scaleR;
    const scaledHeightR = embedR.height * scaleR;

    sheet.drawPage(embedL, {
      x: (halfWidth - scaledWidthL) / 2,
      y: (sheetHeight - scaledHeightL) / 2,
      width: scaledWidthL,
      height: scaledHeightL,
    });

    sheet.drawPage(embedR, {
      x: halfWidth + (halfWidth - scaledWidthR) / 2,
      y: (sheetHeight - scaledHeightR) / 2,
      width: scaledWidthR,
      height: scaledHeightR,
    });
  }

  return await bookletDoc.save();
}
