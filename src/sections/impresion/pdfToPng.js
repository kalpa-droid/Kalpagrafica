async function inyectarPDFjs() {
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

export async function pdfToPng(file, config, onProgress) {
  await inyectarPDFjs();
  const { rangeMode, range, dpi } = config;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;

  let pagesToRender = [];
  if (rangeMode === 'todas') {
    pagesToRender = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    const parts = range.split('-').map(Number);
    if (parts.length === 2) {
      for (let p = parts[0]; p <= parts[1]; p++) {
        if (p >= 1 && p <= totalPages) pagesToRender.push(p);
      }
    } else if (parts.length === 1) {
      if (parts[0] >= 1 && parts[0] <= totalPages) pagesToRender.push(parts[0]);
    }
  }

  const scale = dpi / 72;
  const blobs = [];

  for (let i = 0; i < pagesToRender.length; i++) {
    const pageNum = pagesToRender[i];
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    blobs.push({ pageNum, blob, width: canvas.width, height: canvas.height });
    if (onProgress) onProgress((i + 1) / pagesToRender.length);
  }
  return blobs;
}
