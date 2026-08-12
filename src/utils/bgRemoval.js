// =============================================================================
// KALPAGRÁFICA — Borrador de Fondo (segmentación IA 100% en el navegador)
// Usa @mediapipe/tasks-vision (Google), licencia Apache 2.0 — libre para uso
// comercial y para proyectos de código cerrado, sin las obligaciones de
// "copyleft de red" de la AGPL. Corre con WASM en el dispositivo del usuario:
// la imagen nunca se sube a un servidor.
// Repo: https://github.com/google-ai-edge/mediapipe
// Modelo: selfie_segmenter (Google, Apache 2.0) — optimizado para personas /
// retratos / fotos de producto con un sujeto principal en primer plano. Para
// fondos muy complejos o múltiples sujetos, el resultado puede requerir un
// retoque manual con el Borrador Mágico.
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
    el.onerror = (e) => reject(e);
    el.src = typeof input === 'string' ? input : URL.createObjectURL(input);
  });
}

/**
 * Quita el fondo de una imagen y devuelve un Blob PNG con canal alfa.
 * @param {File|Blob|string} input - archivo, blob o URL de la imagen
 * @param {Object} opts
 * @param {(progress: {key: string, current: number, total: number}) => void} [opts.onProgress]
 * @returns {Promise<Blob>}
 */
export async function removeImageBackground(input, opts = {}) {
  const notify = (key, current, total) => opts.onProgress && opts.onProgress({ key, current, total });

  notify('Cargando modelo de segmentación', 0, 1);
  const segmenter = await getSegmenter();
  notify('Cargando modelo de segmentación', 1, 1);

  notify('Analizando imagen', 0, 1);
  const imgEl = await loadImageElement(input);
  const w = imgEl.naturalWidth;
  const h = imgEl.naturalHeight;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imgEl, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);

  const segResult = segmenter.segment(imgEl);
  const mask = segResult.categoryMask;
  const maskArr = mask.getAsUint8Array(); // 0 = fondo, 1 = sujeto en primer plano
  const mw = mask.width;
  const mh = mask.height;

  const data = imageData.data;
  for (let y = 0; y < h; y++) {
    const my = Math.min(mh - 1, (y / h) * mh | 0);
    for (let x = 0; x < w; x++) {
      const mx = Math.min(mw - 1, (x / w) * mw | 0);
      if (maskArr[my * mw + mx] === 0) {
        data[(y * w + x) * 4 + 3] = 0; // vuelve transparente el fondo
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
  mask.close?.();
  segResult.close?.();
  notify('Analizando imagen', 1, 1);

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'));
}
