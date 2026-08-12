// =============================================================================
// KALPAGRÁFICA — Borrador de Fondo (segmentación IA 100% en el navegador)
// Usa @mediapipe/tasks-vision (Google), licencia Apache 2.0.
// Optimizado para rendimiento ultrarrápido sin saturar la memoria del navegador.
// =============================================================================

const WASM_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite';

let _segmenterPromise = null;

async function getSegmenter() {
  if (_segmenterPromise) return _segmenterPromise;
  _segmenterPromise = (async () => {
    const { ImageSegmenter, FilesetResolver } = await import('@mediapipe/tasks-vision');
    const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
    return ImageSegmenter.createFromOptions(vision, {
      baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
      outputCategoryMask: true,
      outputConfidenceMasks: false,
      runningMode: 'IMAGE'
    });
  })();
  return _segmenterPromise;
}

function loadImageElement(input) {
  return new Promise((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = 'anonymous';
    el.onload = () => resolve(el);
    el.onerror = (e) => reject(new Error('No se pudo cargar la imagen para segmentar.'));
    el.src = typeof input === 'string' ? input : URL.createObjectURL(input);
  });
}

/**
 * Quita el fondo de una imagen ajustando la resolución a un máximo seguro (1200px)
 * para garantizar fluidez y prevenir problemas de memoria en el navegador.
 * Devuelve un Blob PNG con canal alfa (transparencia limpia).
 */
export async function removeImageBackground(input, opts = {}) {
  const notify = (key, current, total) => opts.onProgress && opts.onProgress({ key, current, total });

  notify('Cargando modelo IA MediaPipe', 0, 1);
  const segmenter = await getSegmenter();
  notify('Cargando modelo IA MediaPipe', 1, 1);

  notify('Procesando imagen', 0, 1);
  const imgEl = await loadImageElement(input);
  
  // Escalar inteligentemente si la imagen supera los 1200px
  const maxDim = opts.maxDim || 1200;
  let w = imgEl.naturalWidth || imgEl.width;
  let h = imgEl.naturalHeight || imgEl.height;

  if (w > maxDim || h > maxDim) {
    if (w > h) {
      h = Math.round((h * maxDim) / w);
      w = maxDim;
    } else {
      w = Math.round((w * maxDim) / h);
      h = maxDim;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imgEl, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);

  // Ejecutar segmentación IA
  const segResult = segmenter.segment(canvas);
  const mask = segResult.categoryMask;
  const maskArr = mask.getAsUint8Array(); // 0 = fondo, 1 = sujeto
  const mw = mask.width;
  const mh = mask.height;

  const data = imageData.data;
  for (let y = 0; y < h; y++) {
    const my = Math.min(mh - 1, (y / h) * mh | 0);
    for (let x = 0; x < w; x++) {
      const mx = Math.min(mw - 1, (x / w) * mw | 0);
      if (maskArr[my * mw + mx] === 0) {
        data[(y * w + x) * 4 + 3] = 0; // Transparencia total para el fondo
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
  mask.close?.();
  segResult.close?.();
  notify('Procesando imagen', 1, 1);

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'));
}
