import { PDFDocument, degrees } from 'pdf-lib';

export async function generarMosaico(files, config, onProgress) {
  if (onProgress) onProgress('Iniciando motor de maquetación...', 5);

  const { orientation, imagesPerSheet, copies, margin, ajuste, sequence } = config;
  const marginPt = margin * 2.83465; // mm -> pt

  const pageW = orientation === 'vertical' ? 595.28 : 841.89;
  const pageH = orientation === 'vertical' ? 841.89 : 595.28;

  let rows, cols;
  if (imagesPerSheet === 2) {
    if (orientation === 'vertical') { rows = 2; cols = 1; }
    else { rows = 1; cols = 2; }
  } else if (imagesPerSheet === 4) {
    rows = 2; cols = 2;
  } else if (imagesPerSheet === 8) {
    if (orientation === 'vertical') { rows = 4; cols = 2; }
    else { rows = 2; cols = 4; }
  } else {
    rows = 1; cols = 1;
  }

  const cellW = (pageW - marginPt * (cols + 1)) / cols;
  const cellH = (pageH - marginPt * (rows + 1)) / rows;

  let imageSequence = [];
  if (sequence === 'agrupadas') {
    files.forEach(file => {
      for (let c = 0; c < copies; c++) imageSequence.push(file);
    });
  } else {
    for (let c = 0; c < copies; c++) {
      files.forEach(file => imageSequence.push(file));
    }
  }

  const imagesPerPage = rows * cols;
  const totalPages = Math.ceil(imageSequence.length / imagesPerPage);
  const doc = await PDFDocument.create();

  const cargarImagenSegura = async (file) => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();

      img.onload = async () => {
        URL.revokeObjectURL(url);
        try {
          const MAX_SIZE = 3508;
          let w = img.width;
          let h = img.height;
          if (w > MAX_SIZE || h > MAX_SIZE) {
            const ratio = Math.min(MAX_SIZE / w, MAX_SIZE / h);
            w *= ratio;
            h *= ratio;
          }

          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);

          const base64 = canvas.toDataURL('image/jpeg', 0.95);
          canvas.width = 0; canvas.height = 0;

          const pdfImg = await doc.embedJpg(base64);
          resolve({ img: pdfImg, originalW: w, originalH: h });
        } catch (e) {
          reject(e);
        }
      };

      img.onerror = async () => {
        URL.revokeObjectURL(url);
        try {
          const bytes = await file.arrayBuffer();
          let pdfImg;
          if (file.type === 'image/png') {
            pdfImg = await doc.embedPng(bytes);
          } else {
            pdfImg = await doc.embedJpg(bytes);
          }
          resolve({ img: pdfImg, originalW: pdfImg.width, originalH: pdfImg.height });
        } catch (error) {
          reject(new Error(`Formato no compatible: ${file.name}`));
        }
      };

      img.src = url;
    });
  };

  for (let p = 0; p < totalPages; p++) {
    const page = doc.addPage([pageW, pageH]);

    if (onProgress) {
      const avance = 10 + Math.floor((p / totalPages) * 80);
      onProgress(`Maquetando página ${p + 1} de ${totalPages}...`, avance);
    }
    await new Promise(r => setTimeout(r, 15));

    for (let i = 0; i < imagesPerPage; i++) {
      const globalIdx = p * imagesPerPage + i;
      if (globalIdx >= imageSequence.length) break;

      const file = imageSequence[globalIdx];
      const col = i % cols;
      const row = Math.floor(i / cols);

      const xBase = marginPt + col * (cellW + marginPt);
      const yBase = pageH - marginPt - row * (cellH + marginPt);

      const { img, originalW, originalH } = await cargarImagenSegura(file);

      let imgW = originalW;
      let imgH = originalH;
      let rot = 0;

      const cellIsPortrait = cellH > cellW;
      const imgIsPortrait = imgH > imgW;

      if (cellIsPortrait !== imgIsPortrait) {
        rot = 90;
        [imgW, imgH] = [imgH, imgW];
      }

      let drawW, drawH;

      if (ajuste === 'estirar') {
        drawW = cellW;
        drawH = cellH;
      } else {
        const scale = Math.min(cellW / imgW, cellH / imgH);
        drawW = imgW * scale;
        drawH = imgH * scale;
      }

      const offsetX = (cellW - drawW) / 2;
      const offsetY = (cellH - drawH) / 2;

      const finalX = xBase + offsetX + (rot === 90 ? drawW : 0);
      const finalY = yBase - cellH + offsetY;

      page.drawImage(img, {
        x: finalX,
        y: finalY,
        width: rot === 90 ? drawH : drawW,
        height: rot === 90 ? drawW : drawH,
        rotate: rot ? degrees(rot) : undefined,
      });
    }
  }

  if (onProgress) onProgress('Finalizando PDF Mosaico...', 95);
  return await doc.save();
}
