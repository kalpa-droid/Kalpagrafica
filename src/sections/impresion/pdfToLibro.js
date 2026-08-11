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

async function procesarComoImagenes(file, mode, options = {}, onProgress) {
  const {
    fotocopiaStart = 'derecha',
    hasCover = false,
    coverSide = 'derecha',
    refPdfPage = 0,
    refBookPage = 0,
    refPageSide = 'derecha'
  } = options;

  const newPdf = await PDFDocument.create();
  const arrayBuffer = await file.arrayBuffer();

  const pdf = await window.pdfjsLib.getDocument({
    data: arrayBuffer,
    cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
    cMapPacked: true,
  }).promise;

  let isFirstProcessedSheet = true;

  // Evaluar si se requiere una página en blanco de ajuste justo detrás de la tapa
  let needBlankPageBehindCover = false;
  if (refPdfPage > 0 && refBookPage > 0) {
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
    const viewport = page.getViewport({ scale: 300 / 72 });

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

      const halfW = finalCanvas.width / 2;
      const fullH = finalCanvas.height;

      if (isFirstProcessedSheet && (fotocopiaStart === 'derecha' || (hasCover && coverSide === 'derecha'))) {
        const rightCanvas = document.createElement('canvas');
        rightCanvas.width = halfW; rightCanvas.height = fullH;
        rightCanvas.getContext('2d').drawImage(finalCanvas, halfW, 0, halfW, fullH, 0, 0, halfW, fullH);

        const rightImg = await newPdf.embedJpg(rightCanvas.toDataURL('image/jpeg', 0.92));
        const pageR = newPdf.addPage([halfW, fullH]);
        pageR.drawImage(rightImg, { x: 0, y: 0, width: halfW, height: fullH });

        rightCanvas.width = 0; rightCanvas.height = 0;

        // Si se requiere ajuste detrás de la tapa, se inserta 1 hoja A5 en blanco inmediatamente
        if (needBlankPageBehindCover) {
          const blankPage = newPdf.addPage([halfW, fullH]);
          blankPage.drawRectangle({ x: 0, y: 0, width: 0, height: 0 });
        }
      } else {
        const leftCanvas = document.createElement('canvas');
        leftCanvas.width = halfW; leftCanvas.height = fullH;
        leftCanvas.getContext('2d').drawImage(finalCanvas, 0, 0, halfW, fullH, 0, 0, halfW, fullH);

        const rightCanvas = document.createElement('canvas');
        rightCanvas.width = halfW; rightCanvas.height = fullH;
        rightCanvas.getContext('2d').drawImage(finalCanvas, halfW, 0, halfW, fullH, 0, 0, halfW, fullH);

        const leftImg = await newPdf.embedJpg(leftCanvas.toDataURL('image/jpeg', 0.92));
        const rightImg = await newPdf.embedJpg(rightCanvas.toDataURL('image/jpeg', 0.92));

        const pageL = newPdf.addPage([halfW, fullH]);
        pageL.drawImage(leftImg, { x: 0, y: 0, width: halfW, height: fullH });

        const pageR = newPdf.addPage([halfW, fullH]);
        pageR.drawImage(rightImg, { x: 0, y: 0, width: halfW, height: fullH });

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
