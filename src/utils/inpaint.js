// =============================================================================
// KALPAGRÁFICA — Borrador Mágico (Content-Aware Fill / Heal Selection)
// Implementación propia inspirada en el enfoque de "Resynthesizer" de GIMP y en
// el algoritmo PatchMatch (Barnes et al.) para relleno consciente del contenido.
// 100% cliente, sin dependencias ni modelos: busca, para cada píxel enmascarado,
// el parche más parecido fuera de la máscara y lo usa para reconstruir la zona.
// =============================================================================

// Convierte un ImageData (RGBA) en un array plano de luminancia+color para
// comparar parches rápido.
function buildSampleGrid(data, width, height, cell = 2) {
  // downsample liviano solo para acelerar la búsqueda de candidatos
  return { data, width, height, cell };
}

function clampInt(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

// Distancia SSD entre dos parches de tamaño (2*radius+1)^2, saltando píxeles
// que también estén enmascarados (para no comparar contra "agujeros").
function patchDistance(data, mask, width, height, ax, ay, bx, by, radius) {
  let sum = 0;
  let count = 0;
  for (let dy = -radius; dy <= radius; dy++) {
    const ay2 = ay + dy;
    const by2 = by + dy;
    if (ay2 < 0 || ay2 >= height || by2 < 0 || by2 >= height) { sum += 1e6; continue; }
    for (let dx = -radius; dx <= radius; dx++) {
      const ax2 = ax + dx;
      const bx2 = bx + dx;
      if (ax2 < 0 || ax2 >= width || bx2 < 0 || bx2 >= width) { sum += 1e6; continue; }
      const ai = ay2 * width + ax2;
      if (mask[ai]) continue; // no comparamos contra el propio agujero
      const bi = by2 * width + bx2;
      if (mask[bi]) { sum += 1e6; count++; continue; }
      const ao = ai * 4, bo = bi * 4;
      const dr = data[ao] - data[bo];
      const dg = data[ao + 1] - data[bo + 1];
      const db = data[ao + 2] - data[bo + 2];
      sum += dr * dr + dg * dg + db * db;
      count++;
    }
  }
  return count === 0 ? Infinity : sum / count;
}

/**
 * Rellena de forma consciente del contenido la zona marcada por `maskData`.
 * @param {ImageData} imageData - imagen original (se clona, no se muta)
 * @param {Uint8Array|Uint8ClampedArray} maskData - 1 byte por píxel, !=0 = "borrar y rellenar"
 * @param {Object} opts
 * @param {number} opts.patchRadius - radio del parche de comparación (por defecto 4 → parches de 9x9)
 * @param {number} opts.iterations - iteraciones de propagación PatchMatch (por defecto 5)
 * @param {function} opts.onProgress - callback(0..1) opcional para barra de progreso
 * @returns {Promise<ImageData>} - async: cede el hilo periódicamente para no congelar la UI
 */
export async function contentAwareFill(imageData, maskData, opts = {}) {
  const { patchRadius = 4, iterations = 5, onProgress } = opts;
  const { width, height } = imageData;
  const src = new Uint8ClampedArray(imageData.data); // copia de trabajo
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < mask.length; i++) mask[i] = maskData[i] ? 1 : 0;

  // 1. Recolectar coordenadas a rellenar
  const holes = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (mask[y * width + x]) holes.push([x, y]);
    }
  }
  if (holes.length === 0) return imageData;

  // 2. Inicialización: cada píxel del agujero apunta a un candidato aleatorio
  //    válido (fuera de máscara) — arranque tipo PatchMatch.
  const nnfX = new Int32Array(width * height).fill(-1);
  const nnfY = new Int32Array(width * height).fill(-1);

  const randomValidPixel = () => {
    for (let tries = 0; tries < 50; tries++) {
      const rx = (Math.random() * width) | 0;
      const ry = (Math.random() * height) | 0;
      if (!mask[ry * width + rx]) return [rx, ry];
    }
    return [(Math.random() * width) | 0, (Math.random() * height) | 0];
  };

  for (const [x, y] of holes) {
    const [rx, ry] = randomValidPixel();
    nnfX[y * width + x] = rx;
    nnfY[y * width + x] = ry;
  }

  // 3. Propagación + búsqueda aleatoria (núcleo de PatchMatch), alternando
  //    el sentido de barrido en cada iteración para que la información viaje
  //    en todas direcciones.
  const total = iterations * holes.length;
  let done = 0;

  for (let it = 0; it < iterations; it++) {
    const order = it % 2 === 0 ? holes : [...holes].reverse();
    for (const [x, y] of order) {
      const idx = y * width + x;
      let bestX = nnfX[idx];
      let bestY = nnfY[idx];
      let bestD = patchDistance(src, mask, width, height, x, y, bestX, bestY, patchRadius);

      // Propagación desde vecino izquierdo/arriba (o derecho/abajo si va al revés)
      const neighborOffsets = it % 2 === 0 ? [[-1, 0], [0, -1]] : [[1, 0], [0, 1]];
      for (const [ox, oy] of neighborOffsets) {
        const nx = x + ox, ny = y + oy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const nIdx = ny * width + nx;
        if (nnfX[nIdx] < 0) continue;
        const candX = clampInt(nnfX[nIdx] - ox, 0, width - 1);
        const candY = clampInt(nnfY[nIdx] - oy, 0, height - 1);
        if (mask[candY * width + candX]) continue;
        const d = patchDistance(src, mask, width, height, x, y, candX, candY, patchRadius);
        if (d < bestD) { bestD = d; bestX = candX; bestY = candY; }
      }

      // Búsqueda aleatoria en radio decreciente alrededor del mejor candidato
      let searchRadius = Math.max(width, height);
      while (searchRadius >= 1) {
        const rx = clampInt(bestX + ((Math.random() * 2 - 1) * searchRadius) | 0, 0, width - 1);
        const ry = clampInt(bestY + ((Math.random() * 2 - 1) * searchRadius) | 0, 0, height - 1);
        if (!mask[ry * width + rx]) {
          const d = patchDistance(src, mask, width, height, x, y, rx, ry, patchRadius);
          if (d < bestD) { bestD = d; bestX = rx; bestY = ry; }
        }
        searchRadius = searchRadius >> 1;
      }

      nnfX[idx] = bestX;
      nnfY[idx] = bestY;

      done++;
      if (done % 250 === 0) {
        if (onProgress) onProgress(done / total);
        // cede el hilo principal para que la interfaz no se congele
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
  }

  // 4. Reconstrucción: cada agujero toma el color del píxel al que apunta su NNF.
  const out = new Uint8ClampedArray(src);
  for (const [x, y] of holes) {
    const idx = y * width + x;
    const sx = nnfX[idx], sy = nnfY[idx];
    if (sx < 0) continue;
    const so = (sy * width + sx) * 4;
    const doi = idx * 4;
    out[doi] = src[so];
    out[doi + 1] = src[so + 1];
    out[doi + 2] = src[so + 2];
    out[doi + 3] = 255;
  }

  if (onProgress) onProgress(1);
  return new ImageData(out, width, height);
}

// Suavizado leve de los bordes del parche reconstruido para disimular la costura
// entre lo original y lo sintetizado (blending tipo "feather").
export function featherMaskEdges(imageData, maskData, radius = 2) {
  const { width, height, data } = imageData;
  const out = new Uint8ClampedArray(data);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (!maskData[idx]) continue;
      // ¿está cerca de un borde de máscara?
      let nearEdge = false;
      for (let dy = -radius; dy <= radius && !nearEdge; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          if (!maskData[ny * width + nx]) { nearEdge = true; break; }
        }
      }
      if (!nearEdge) continue;
      let r = 0, g = 0, b = 0, n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          const o = (ny * width + nx) * 4;
          r += data[o]; g += data[o + 1]; b += data[o + 2]; n++;
        }
      }
      const o = idx * 4;
      out[o] = (r / n + data[o]) / 2;
      out[o + 1] = (g / n + data[o + 1]) / 2;
      out[o + 2] = (b / n + data[o + 2]) / 2;
    }
  }
  return new ImageData(out, width, height);
}
