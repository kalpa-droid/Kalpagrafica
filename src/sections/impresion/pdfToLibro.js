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

// Tamaño (en px a 300dpi) de la página final del libro, según el papel donde se va a imprimir:
// Papel A4 doblado al medio -> páginas de libro A5. Papel A3 doblado al medio -> páginas de libro A4.
export function getCoverCanvasSize(paperSize) {
  return paperSize === 'A3' ? { width: 2480, height: 3508 } : { width: 1748, height: 2480 };
}

export async function crearCanvasTapaCustom(coverConfig, canvasSize = { width: 1748, height: 2480 }) {
  if (!coverConfig) return null;
  const width = canvasSize.width;
  const height = canvasSize.height;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (coverConfig.type === 'upload' && coverConfig.imageUri) {
    const img = new Image();
    img.src = coverConfig.imageUri;
    await new Promise((res) => { img.onload = res; img.onerror = res; });
    
    // Llenado al 100% de la hoja sin ningún margen blanco (object-fit: cover)
    const scale = Math.max(width / (img.width || width), height / (img.height || height));
    const w = (img.width || width) * scale;
    const h = (img.height || height) * scale;
    ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
  } else if (coverConfig.type === 'template') {
    const { 
      title = '', 
      author = '', 
      publisher = '', 
      bgColor = '#1a1a2e', 
      textColor = '#bafdc1', 
      bgImageUri,
      fontFamily = 'Georgia, serif',
      fontSize = 95,
      lineHeightMultiplier = 1.25
    } = coverConfig;

    // Fondo al 100% sin bordes interiores
    ctx.fillStyle = bgColor || '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    if (bgImageUri) {
      const img = new Image();
      img.src = bgImageUri;
      await new Promise((res) => { img.onload = res; img.onerror = res; });
      const scale = Math.max(width / (img.width || width), height / (img.height || height));
      const w = (img.width || width) * scale;
      const h = (img.height || height) * scale;
      ctx.globalAlpha = 0.35;
      ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
      ctx.globalAlpha = 1.0;
    }

    ctx.fillStyle = textColor || '#bafdc1';
    ctx.textAlign = 'center';

    // Margen seguro de 2 cm a cada lado (~236px a 300 DPI)
    const sideMargin = Math.round(width * 0.135);
    const maxWidth = width - (sideMargin * 2);

    let currentY = Math.round(height * 0.28);

    if (title) {
      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      const words = title.split(' ');
      let currentLine = '';
      const titleLines = [];

      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
          titleLines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) titleLines.push(currentLine);

      const lineStep = Math.round(fontSize * lineHeightMultiplier);
      titleLines.forEach((l) => {
        ctx.fillText(l, width / 2, currentY);
        currentY += lineStep;
      });
    }

    // El nombre del autor se ubica dinámicamente debajo del título multilinea
    if (author) {
      const authorFontSize = Math.round(fontSize * 0.55);
      ctx.font = `500 ${authorFontSize}px ${fontFamily}`;
      const authorY = currentY + Math.round(fontSize * 0.4);
      ctx.fillText(author, width / 2, authorY);
    }

    if (publisher) {
      const publisherFontSize = Math.round(fontSize * 0.4);
      ctx.font = `400 ${publisherFontSize}px ${fontFamily}`;
      ctx.fillText(publisher.toUpperCase(), width / 2, height * 0.90);
    }
  }

  return canvas;
}

export async function crearCanvasContratapaCustom(backCoverConfig, canvasSize = { width: 1748, height: 2480 }) {
  if (!backCoverConfig) return null;
  const width = canvasSize.width;
  const height = canvasSize.height;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (backCoverConfig.type === 'upload' && backCoverConfig.imageUri) {
    const img = new Image();
    img.src = backCoverConfig.imageUri;
    await new Promise((res) => { img.onload = res; img.onerror = res; });
    
    // Llenado al 100% de la hoja sin ningún margen blanco
    const scale = Math.max(width / (img.width || width), height / (img.height || height));
    const w = (img.width || width) * scale;
    const h = (img.height || height) * scale;
    ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
  } else if (backCoverConfig.type === 'template') {
    const { 
      synopsis = '', 
      publisher = '', 
      isbn = '', 
      bgColor = '#1a1a2e', 
      textColor = '#bafdc1', 
      bgImageUri,
      fontFamily = 'Georgia, serif',
      fontSize = 50
    } = backCoverConfig;

    ctx.fillStyle = bgColor || '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    if (bgImageUri) {
      const img = new Image();
      img.src = bgImageUri;
      await new Promise((res) => { img.onload = res; img.onerror = res; });
      const scale = Math.max(width / (img.width || width), height / (img.height || height));
      const w = (img.width || width) * scale;
      const h = (img.height || height) * scale;
      ctx.globalAlpha = 0.35;
      ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
      ctx.globalAlpha = 1.0;
    }

    ctx.fillStyle = textColor || '#bafdc1';
    ctx.textAlign = 'center';

    const sideMargin = Math.round(width * 0.135);
    const maxWidth = width - (sideMargin * 2);

    if (synopsis) {
      ctx.font = `500 ${fontSize}px ${fontFamily}`;
      const words = synopsis.split(' ');
      let line = '';
      let y = Math.round(height * 0.30);
      const lineStep = Math.round(fontSize * 1.4);

      for (let n = 0; n < words.length; n++) {
        const testLine = line ? `${line} ${words[n]}` : words[n];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line) {
          ctx.fillText(line, width / 2, y);
          line = words[n];
          y += lineStep;
        } else {
          line = testLine;
        }
      }
      if (line) ctx.fillText(line, width / 2, y);
    }

    if (isbn) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(width / 2 - 200, height * 0.80 - 45, 400, 90);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 36px monospace';
      ctx.fillText(`ISBN ${isbn}`, width / 2, height * 0.80 + 10);
    }

    if (publisher) {
      ctx.fillStyle = textColor || '#bafdc1';
      ctx.font = `400 38px ${fontFamily}`;
      ctx.fillText(publisher.toUpperCase(), width / 2, height * 0.92);
    }
  }

  return canvas;
}

// Cuenta cuántas hojas en blanco deben ir inmediatamente detrás de la tapa, combinando en UN SOLO
// cálculo dos necesidades que antes se resolvían por separado y podían pisarse entre sí:
//  1) la elección estética del usuario ("Retiro de Tapa": dejar la vuelta de la tapa en blanco), y
//  2) la corrección automática de alineación de foliado (que el N° de página referenciado caiga
//     del lado correcto: impar=derecha, par=izquierda), si el usuario cargó esa sincronización.
// Cada hoja en blanco insertada ANTES de la página de referencia invierte el lado en el que termina
// cayendo esa página, así que hay que sumar ambos efectos antes de decidir si hace falta 1 hoja más.
function contarBlancosDetrasDeTapa(blankBehindCoverChecked, refPdfPage, refBookPage, refPageSide) {
  let count = blankBehindCoverChecked ? 1 : 0;
  if (refPdfPage > 0 && refBookPage > 0) {
    const isBookPageOdd = refBookPage % 2 !== 0;
    const expectedSide = isBookPageOdd ? 'derecha' : 'izquierda';
    const flipped = count % 2 === 1;
    const sideAfterBase = flipped ? (refPageSide === 'derecha' ? 'izquierda' : 'derecha') : refPageSide;
    if (sideAfterBase !== expectedSide) {
      count += 1;
    }
  }
  return count;
}

async function procesarComoImagenes(file, mode, options = {}, onProgress) {
  const {
    hasCover = false,
    coverSide = 'derecha',
    hasBackCover = false,
    backCoverSide = 'izquierda',
    refPdfPage = 0,
    refBookPage = 0,
    refPageSide = 'derecha',
    pageRotations = {},
    pageSplitOffsets = {},
    customCover = null,
    customBackCover = null,
    paperSize = 'A4',
    deletedPages = [],
    pageOrder = [],
    blankBehindCover = true
  } = options;

  const coverCanvasSize = getCoverCanvasSize(paperSize);

  const newPdf = await PDFDocument.create();
  const arrayBuffer = await file.arrayBuffer();

  const pdf = await window.pdfjsLib.getDocument({
    data: arrayBuffer,
    cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
    cMapPacked: true,
  }).promise;

  let isFirstProcessedSheet = true;

  const insertarBlancosDetrasDeTapa = (count, width, height) => {
    for (let i = 0; i < count; i++) {
      const blankPage = newPdf.addPage([width, height]);
      blankPage.drawRectangle({ x: 0, y: 0, width: 0, height: 0 });
    }
  };

  // Si se generó o subió una Tapa Custom, se inserta en la Página 1
  let effectiveRefPdfPage = refPdfPage;
  if (!hasCover && customCover && (customCover.type === 'upload' || customCover.type === 'template')) {
    const coverCanvas = await crearCanvasTapaCustom(customCover, coverCanvasSize);
    if (coverCanvas) {
      const coverImg = await newPdf.embedJpg(coverCanvas.toDataURL('image/jpeg', 0.92));
      const pageC = newPdf.addPage([coverCanvas.width, coverCanvas.height]);
      pageC.drawImage(coverImg, { x: 0, y: 0, width: coverCanvas.width, height: coverCanvas.height });

      // Al haber agregado la tapa al inicio, la página del PDF desplaza su índice +1
      if (effectiveRefPdfPage > 0) {
        effectiveRefPdfPage += 1;
      }

      const blanksNeeded = contarBlancosDetrasDeTapa(blankBehindCover, effectiveRefPdfPage, refBookPage, refPageSide);
      insertarBlancosDetrasDeTapa(blanksNeeded, coverCanvas.width, coverCanvas.height);

      coverCanvas.width = 0; coverCanvas.height = 0;
    }
  }

  // Cantidad unificada de hojas en blanco a insertar detrás de la tapa cuando la tapa proviene
  // del propio PDF fuente (hasCover=true); se calcula una sola vez y se usa en los 3 puntos de
  // inserción posibles (fotocopia lado derecho, fotocopia lado izquierdo, PDF normal).
  const blanksBehindSourceCover = hasCover
    ? contarBlancosDetrasDeTapa(blankBehindCover, effectiveRefPdfPage, refBookPage, refPageSide)
    : 0;

  const hasSplitIds = mode === 'fotocopia' && pageOrder && pageOrder.length > 0 && String(pageOrder[0]).includes('_');

  if (hasSplitIds) {
    const cachedSheetCanvases = {};

    for (let idx = 0; idx < pageOrder.length; idx++) {
      const itemId = String(pageOrder[idx]);
      const parts = itemId.split('_');
      const sheetNum = parseInt(parts[0], 10);
      const side = parts[1]; // 'L' | 'R'

      // deletedPages puede contener tanto números de hoja completa (eliminación desde el Paso 2,
      // antes de dividir en mitades) como IDs de mitad individual tipo "3_L"/"3_R" (eliminación
      // de una sola mitad desde el Paso 3 Foliado). Antes solo se comparaba contra sheetNum, así que
      // borrar una sola mitad en el Paso 3 se veía tachado en pantalla pero igual salía en el PDF final.
      if (deletedPages && (deletedPages.includes(sheetNum) || deletedPages.includes(itemId))) continue;

      if (onProgress) {
        const avance = 10 + Math.floor(((idx + 1) / pageOrder.length) * 45);
        onProgress(`Procesando página individual ${idx + 1} de ${pageOrder.length}...`, avance);
      }

      let finalCanvas = cachedSheetCanvases[sheetNum];
      if (!finalCanvas) {
        const page = await pdf.getPage(sheetNum);
        const userRotation = pageRotations[sheetNum] || 0;
        const viewport = page.getViewport({ scale: 300 / 72, rotation: userRotation });

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = viewport.width; tempCanvas.height = viewport.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.fillStyle = '#ffffff'; tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        await page.render({ canvasContext: tempCtx, viewport }).promise;

        finalCanvas = tempCanvas;
        const isVertical = tempCanvas.height > tempCanvas.width;
        if (isVertical) {
          finalCanvas = document.createElement('canvas');
          finalCanvas.width = tempCanvas.height; finalCanvas.height = tempCanvas.width;
          const finalCtx = finalCanvas.getContext('2d');
          finalCtx.translate(finalCanvas.width / 2, finalCanvas.height / 2);
          finalCtx.rotate(Math.PI / 2);
          finalCtx.drawImage(tempCanvas, -tempCanvas.width / 2, -tempCanvas.height / 2);
          tempCanvas.width = 0; tempCanvas.height = 0;
        }
        cachedSheetCanvases[sheetNum] = finalCanvas;
        page.cleanup();
      }

      const splitPct = ((pageSplitOffsets[sheetNum] !== undefined) ? pageSplitOffsets[sheetNum] : 50) / 100;
      const fullW = finalCanvas.width;
      const fullH = finalCanvas.height;
      const splitX = Math.round(fullW * splitPct);
      const leftW = splitX;
      const rightW = fullW - splitX;

      if (side === 'L') {
        const leftCanvas = document.createElement('canvas');
        leftCanvas.width = leftW; leftCanvas.height = fullH;
        leftCanvas.getContext('2d').drawImage(finalCanvas, 0, 0, leftW, fullH, 0, 0, leftW, fullH);
        const leftImg = await newPdf.embedJpg(leftCanvas.toDataURL('image/jpeg', 0.92));
        const pageL = newPdf.addPage([leftW, fullH]);
        pageL.drawImage(leftImg, { x: 0, y: 0, width: leftW, height: fullH });
        leftCanvas.width = 0; leftCanvas.height = 0;
      } else {
        const rightCanvas = document.createElement('canvas');
        rightCanvas.width = rightW; rightCanvas.height = fullH;
        rightCanvas.getContext('2d').drawImage(finalCanvas, splitX, 0, rightW, fullH, 0, 0, rightW, fullH);
        const rightImg = await newPdf.embedJpg(rightCanvas.toDataURL('image/jpeg', 0.92));
        const pageR = newPdf.addPage([rightW, fullH]);
        pageR.drawImage(rightImg, { x: 0, y: 0, width: rightW, height: fullH });
        rightCanvas.width = 0; rightCanvas.height = 0;
      }
    }

    Object.values(cachedSheetCanvases).forEach(c => { if (c) { c.width = 0; c.height = 0; } });
    return newPdf;
  }

  // Orden efectivo de iteración (reordenamiento manual si fue modificado)
  const effectivePageOrder = (pageOrder && pageOrder.length > 0)
    ? pageOrder.map(x => Number(String(x).split('_')[0])).filter(n => !isNaN(n))
    : Array.from({ length: pdf.numPages }, (_, i) => i + 1);

  for (let idx = 0; idx < effectivePageOrder.length; idx++) {
    const pageNum = effectivePageOrder[idx];

    // Si la página fue eliminada por el usuario desde el visor, la omitimos
    if (deletedPages && deletedPages.includes(pageNum)) {
      continue;
    }
    if (onProgress) {
      const avance = 10 + Math.floor(((idx + 1) / effectivePageOrder.length) * 45);
      onProgress(`Procesando página ${idx + 1} de ${effectivePageOrder.length}...`, avance);
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

      // Solo se descarta la mitad izquierda de la PRIMERA hoja escaneada cuando esa hoja
      // es específicamente la tapa y está del lado derecho (la mitad izquierda sería
      // la contratapa interior/reverso, no una página de contenido real).
      // Antes esto se activaba siempre por un valor fijo no configurable ("fotocopiaStart"),
      // lo que hacía desaparecer la página física N° 1 aunque no hubiera tapa.
      if (isFirstProcessedSheet && hasCover && coverSide === 'derecha') {
        const rightCanvas = document.createElement('canvas');
        rightCanvas.width = rightW; rightCanvas.height = fullH;
        rightCanvas.getContext('2d').drawImage(finalCanvas, splitX, 0, rightW, fullH, 0, 0, rightW, fullH);

        const rightImg = await newPdf.embedJpg(rightCanvas.toDataURL('image/jpeg', 0.92));
        const pageR = newPdf.addPage([rightW, fullH]);
        pageR.drawImage(rightImg, { x: 0, y: 0, width: rightW, height: fullH });

        rightCanvas.width = 0; rightCanvas.height = 0;

        // Hojas en blanco unificadas (checkbox "Retiro de Tapa" + corrección de alineación si hace falta)
        insertarBlancosDetrasDeTapa(blanksBehindSourceCover, rightW, fullH);
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

        // Si esta primera hoja YA incluye la tapa (del lado izquierdo, caso menos común),
        // las hojas en blanco van después del par completo (tapa + su página compañera).
        if (isFirstProcessedSheet && hasCover) {
          insertarBlancosDetrasDeTapa(blanksBehindSourceCover, rightW, fullH);
        }
      }

      if (finalCanvas !== tempCanvas) { finalCanvas.width = 0; finalCanvas.height = 0; }
      isFirstProcessedSheet = false;
    } else {
      const imgData = tempCanvas.toDataURL('image/jpeg', 0.92);
      const jpgImage = await newPdf.embedJpg(imgData);
      const newPage = newPdf.addPage([tempCanvas.width, tempCanvas.height]);
      newPage.drawImage(jpgImage, { x: 0, y: 0, width: tempCanvas.width, height: tempCanvas.height });

      // Si es la 1ª página y es la tapa: se insertan las hojas en blanco unificadas
      // (checkbox "Retiro de Tapa" + corrección de alineación de foliado si hace falta)
      if (pageNum === 1 && hasCover) {
        insertarBlancosDetrasDeTapa(blanksBehindSourceCover, tempCanvas.width, tempCanvas.height);
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

  const { 
    hasBackCover = false, 
    customBackCover = null, 
    paperSize = 'A4',
    blankInFrontBackCover = true
  } = options;

  const pagesDoc = await procesarComoImagenes(file, mode, options, onProgress);
  const coverCanvasSize = getCoverCanvasSize(paperSize);

  // (La hoja en blanco detrás de la tapa ya se resuelve dentro de procesarComoImagenes(),
  // en un único cálculo unificado que evita insertarla dos veces o pisar la corrección
  // automática de alineación de foliado — ver contarBlancosDetrasDeTapa)

  // 2. Manejo de Contratapa y Retiro de Contratapa
  let backCoverCanvas = null;
  if (!hasBackCover && customBackCover && (customBackCover.type === 'upload' || customBackCover.type === 'template')) {
    backCoverCanvas = await crearCanvasContratapaCustom(customBackCover, coverCanvasSize);
  }

  if (hasBackCover && pagesDoc.getPageCount() > 1) {
    // Si el PDF ya incluye la contratapa como su última página:
    // Extraemos la última página temporalmente para colocar la hoja en blanco e hiper-emparejar a múltiplos de 4.
    const lastIdx = pagesDoc.getPageCount() - 1;
    const tempBCDoc = await PDFDocument.create();
    const [extractedBC] = await tempBCDoc.copyPages(pagesDoc, [lastIdx]);
    tempBCDoc.addPage(extractedBC);
    pagesDoc.removePage(lastIdx);

    // Retiro de contratapa en blanco
    if (blankInFrontBackCover) {
      const blankInFront = pagesDoc.addPage([coverCanvasSize.width, coverCanvasSize.height]);
      blankInFront.drawRectangle({ x: 0, y: 0, width: 0, height: 0 });
    }

    // Resto de páginas de cortesía para completar múltiplo de 4
    const totalWithBC = pagesDoc.getPageCount() + 1;
    const remainder = (4 - (totalWithBC % 4)) % 4;
    for (let i = 0; i < remainder; i++) {
      const blank = pagesDoc.addPage([coverCanvasSize.width, coverCanvasSize.height]);
      blank.drawRectangle({ x: 0, y: 0, width: 0, height: 0 });
    }

    // Devolvemos la contratapa original al final absoluto del documento
    const [bcBack] = await pagesDoc.copyPages(tempBCDoc, [0]);
    pagesDoc.addPage(bcBack);

  } else {
    // Si la contratapa es custom (creada o subida)
    if (blankInFrontBackCover) {
      const blankInFront = pagesDoc.addPage([coverCanvasSize.width, coverCanvasSize.height]);
      blankInFront.drawRectangle({ x: 0, y: 0, width: 0, height: 0 });
    }

    const currentCount = pagesDoc.getPageCount();
    const targetCount = backCoverCanvas ? currentCount + 1 : currentCount;
    const remainder = (4 - (targetCount % 4)) % 4;

    for (let i = 0; i < remainder; i++) {
      const blank = pagesDoc.addPage([coverCanvasSize.width, coverCanvasSize.height]);
      blank.drawRectangle({ x: 0, y: 0, width: 0, height: 0 });
    }

    if (backCoverCanvas) {
      const backCoverImg = await pagesDoc.embedJpg(backCoverCanvas.toDataURL('image/jpeg', 0.92));
      const pageBC = pagesDoc.addPage([backCoverCanvas.width, backCoverCanvas.height]);
      pageBC.drawImage(backCoverImg, { x: 0, y: 0, width: backCoverCanvas.width, height: backCoverCanvas.height });
      backCoverCanvas.width = 0; backCoverCanvas.height = 0;
    }
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

    // Tamaño físico de la HOJA DE PAPEL donde se imprime (A4 o A3, elegido por el usuario) —
    // no confundir con el tamaño de la página final del libro (A5 o A4), que es la mitad de esto doblada.
    const paperPageSize = PageSizes[paperSize] || PageSizes.A4;
    const sheetWidth = paperPageSize[1];
    const sheetHeight = paperPageSize[0];
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
