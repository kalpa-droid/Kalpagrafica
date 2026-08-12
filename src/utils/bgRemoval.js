// =============================================================================
// KALPAGRÁFICA — Borrador de Fondo (segmentación IA 100% en el navegador)
// Usa @imgly/background-removal (ONNX + WASM), corre en el dispositivo del
// usuario: no se sube ninguna imagen a un servidor. Carga perezosa (dynamic
// import) para no afectar el peso del bundle principal del sitio.
// Librería: https://github.com/imgly/background-removal-js (licencia AGPL,
// gratuita para uso propio / código abierto — ver LICENSE del paquete si el
// proyecto se despliega comercialmente).
// =============================================================================

let _removeBgFn = null;

async function getRemoveBg() {
  if (_removeBgFn) return _removeBgFn;
  const mod = await import('@imgly/background-removal');
  _removeBgFn = mod.removeBackground || mod.default;
  return _removeBgFn;
}

/**
 * Quita el fondo de una imagen y devuelve un Blob PNG con canal alfa.
 * @param {File|Blob|string} input - archivo, blob o URL de la imagen
 * @param {Object} opts
 * @param {(progress: {key: string, current: number, total: number}) => void} [opts.onProgress]
 * @returns {Promise<Blob>}
 */
export async function removeImageBackground(input, opts = {}) {
  const removeBackground = await getRemoveBg();
  return removeBackground(input, {
    progress: (key, current, total) => {
      if (opts.onProgress) opts.onProgress({ key, current, total });
    }
  });
}
