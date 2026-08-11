import React, { useState, useMemo } from 'react';
import { Palette, Printer, Layers, Droplet, ScanEye, Check, Copy } from 'lucide-react';
import { ToolCard } from './CommonComponents';
import {
  parseAnyColorInput, rgbToHex, rgbToHsl, rgbToCmyk, approxOklch,
  findClosestPantone, generateTailwindShades, generateHarmonies,
  contrastRatio, COLORBLIND_TYPES, simulateColorblind
} from '../../utils/color';

const BG_DARK_RGB = { r: 17, g: 17, b: 20 };

export default function ColourTab({ copiedCode, copyToClipboard }) {
  const [colorInput, setColorInput] = useState('#BAFDC1');

  const colorData = useMemo(() => {
    const parsed = parseAnyColorInput(colorInput) || { r: 186, g: 253, b: 193, a: 1 };
    const { r, g, b, a } = parsed;
    const { h, s, l } = rgbToHsl(r, g, b);
    const { c, m, y, k } = rgbToCmyk(r, g, b);
    const pantoneMatch = findClosestPantone(r, g, b);
    const hex = rgbToHex(r, g, b);
    const alphaHex = Math.round((a !== undefined ? a : 1) * 255).toString(16).padStart(2, '0').toUpperCase();
    const hex8 = `${hex}${alphaHex}`;

    return {
      hex,
      hex8,
      rgb: `rgb(${r}, ${g}, ${b})`,
      rgba: `rgba(${r}, ${g}, ${b}, ${a !== undefined ? a : 1})`,
      hsl: `hsl(${h}, ${s}%, ${l}%)`,
      cmyk: `cmyk(${c}%, ${m}%, ${y}%, ${k}%)`,
      oklch: approxOklch(r, g, b),
      pantone: pantoneMatch,
      r, g, b, a: a !== undefined ? a : 1, h, s, l, c, m, y, k
    };
  }, [colorInput]);

  const tailwindShades = useMemo(() => generateTailwindShades(colorData.r, colorData.g, colorData.b), [colorData]);
  const harmonies = useMemo(() => generateHarmonies(colorData.hex), [colorData]);
  const contrastVsDark = useMemo(
    () => contrastRatio({ r: colorData.r, g: colorData.g, b: colorData.b }, BG_DARK_RGB).toFixed(2),
    [colorData]
  );
  const colorblindSwatches = useMemo(
    () => COLORBLIND_TYPES.map((t) => ({
      ...t,
      hex: (() => {
        const { r, g, b } = simulateColorblind(colorData.r, colorData.g, colorData.b, t.id);
        return `#${(('000000' + ((Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)).toString(16)).slice(-6)).toUpperCase()}`;
      })()
    })),
    [colorData]
  );

  const bulkFormatsStr = useMemo(() => {
    return `HEX: ${colorData.hex} | HEX8: ${colorData.hex8} | RGB: ${colorData.rgb} | HSL: ${colorData.hsl} | CMYK: ${colorData.cmyk} | OKLCH: ${colorData.oklch}`;
  }, [colorData]);

  const bulkPantoneStr = useMemo(() => {
    return `Coated: ${colorData.pantone.coated.code} (${colorData.pantone.coated.hex}) | Uncoated: ${colorData.pantone.uncoated.code} (${colorData.pantone.uncoated.hex})`;
  }, [colorData]);

  const bulkTailwindStr = useMemo(() => {
    return tailwindShades.map(s => `${s.weight}: ${s.hex}`).join(', ');
  }, [tailwindShades]);

  const bulkHarmoniesStr = useMemo(() => {
    return harmonies.map(h => `${h.label}: ${h.colors.join(', ')}`).join('\n');
  }, [harmonies]);

  const bulkColorblindStr = useMemo(() => {
    return colorblindSwatches.map(cb => `${cb.label}: ${cb.hex}`).join(', ');
  }, [colorblindSwatches]);

  const gridStyle3Col = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Row 1 — 3-Column Grid */}
      <div style={gridStyle3Col}>
        {/* COLUMN 1: Entrada Principal & Cuentagotas (Destacado) */}
        <ToolCard icon={Palette} title="Entrada de Color & Cuentagotas">
          <div style={{
            height: '110px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: colorData.hex,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.2rem',
            border: '2px solid var(--accent)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            position: 'relative'
          }}>
            <input
              type="color"
              value={colorData.hex}
              onChange={(e) => setColorInput(e.target.value)}
              style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
              title="Hacé clic en el cuadro para abrir el selector de color nativo / cuentagotas"
            />
            <span className="font-mono" style={{
              backgroundColor: 'rgba(8,8,10,0.85)', color: 'var(--accent)',
              padding: '0.35rem 0.8rem', borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem', fontWeight: 700, border: '1px solid rgba(186,253,193,0.3)', pointerEvents: 'none'
            }}>
              {colorData.hex} (Clic para Cuentagotas)
            </span>
          </div>

          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
              ¡PEGÁ O ESCRIBÍ TU CÓDIGO DE COLOR AQUÍ!
            </label>
            <input
              type="text"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              placeholder="ej: ffd42aff, #ffd42a, rgb(255,212,42), cmyk(0,17,84,0), Pantone 115 C..."
              className="input font-mono"
              style={{ width: '100%', fontSize: '1.05rem', fontWeight: 700, padding: '0.75rem 1rem', backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--accent)' }}
            />
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '1rem', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.3rem' }}>Formatos aceptados al pegar:</strong>
            <div className="font-mono" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.3rem', fontSize: '0.75rem' }}>
              <div>• <strong>HEX 6d</strong>: <code>#ffd42a</code> o <code>ffd42a</code></div>
              <div>• <strong>HEX 8d</strong>: <code>ffd42aff</code></div>
              <div>• <strong>RGB</strong>: <code>255, 212, 42</code></div>
              <div>• <strong>CMYK</strong>: <code>0, 17, 84, 0</code></div>
              <div>• <strong>HSL</strong>: <code>47, 100%, 58%</code></div>
              <div>• <strong>Pantone</strong>: <code>115 C</code> o <code>115 U</code></div>
            </div>
          </div>

          <div style={{ padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block' }}>Ratio de Contraste vs Fondo Oscuro (#111114)</span>
            <strong className="font-mono" style={{ fontSize: '1.1rem', color: Number(contrastVsDark) >= 4.5 ? 'var(--accent)' : '#F87171', display: 'block', margin: '0.2rem 0' }}>
              {contrastVsDark}:1 {Number(contrastVsDark) >= 4.5 ? '✓ (AA/AAA Pass)' : '⚠ (Bajo Contraste)'}
            </strong>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-disabled)', display: 'block', lineHeight: 1.35 }}>
              Indica la legibilidad según la norma internacional WCAG 2.1 sobre el fondo oscuro de la web.
            </span>
          </div>
        </ToolCard>

        {/* COLUMN 2: Conversión Multi-Espacio */}
        <ToolCard icon={Palette} title="Conversión Multi-Espacio">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {[
              { label: 'HEX (6 dígitos)', val: colorData.hex },
              { label: 'HEX (8 dígitos con Alfa)', val: colorData.hex8 },
              { label: 'RGB', val: colorData.rgb },
              { label: 'HSL', val: colorData.hsl },
              { label: 'CMYK', val: colorData.cmyk },
              { label: 'OKLCH', val: colorData.oklch }
            ].map((fmt) => (
              <div key={fmt.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                backgroundColor: 'var(--bg-surface-2)', padding: '0.6rem 0.8rem',
                borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                  <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-disabled)', display: 'block' }}>{fmt.label}</span>
                  <strong className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--accent)', wordBreak: 'break-all' }}>{fmt.val}</strong>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard(fmt.val, fmt.label)} title="Copiar este formato individual">
                  {copiedCode === fmt.label ? <Check size={14} color="var(--accent)" /> : <Copy size={14} />}
                </button>
              </div>
            ))}
          </div>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => copyToClipboard(bulkFormatsStr, 'bulk-formats')}
            style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', border: '1px dashed var(--border-strong)' }}
          >
            {copiedCode === 'bulk-formats' ? <Check size={14} color="var(--accent)" /> : <Copy size={14} />}
            <span>{copiedCode === 'bulk-formats' ? '¡Todos los Formatos Copiados!' : 'Copiar Todos los Formatos'}</span>
          </button>
        </ToolCard>

        {/* COLUMN 3: Coincidencia Pantone PMS Coated (C) & Uncoated (U) */}
        <ToolCard icon={Printer} title="Coincidencia Pantone PMS (Aproximación)" description="Comparativa del color activo según el soporte: Coated (brillante) vs Uncoated (mate). Algoritmo de aproximación no oficial.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {/* Coated C */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface-2)', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)', padding: '0.8rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.8rem'
              }}
            >
              <div
                onClick={() => setColorInput(colorData.pantone.coated.hex)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', flex: 1 }}
                title="Hacé clic para cargar este color Coated en la app"
              >
                <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', backgroundColor: colorData.pantone.coated.hex, border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0 }} />
                <div style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  <strong className="font-headline" style={{ fontSize: '0.95rem', color: 'var(--accent)', display: 'block' }}>{colorData.pantone.coated.code}</strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.1rem' }}>Papel Estucado / Brillante</span>
                  <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-disabled)' }}>HEX {colorData.pantone.coated.hex} | {colorData.pantone.coated.similarity}</span>
                </div>
              </div>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => copyToClipboard(`${colorData.pantone.coated.code} (${colorData.pantone.coated.hex})`, 'p-c-single')}
                title="Copiar Pantone Coated"
              >
                {copiedCode === 'p-c-single' ? <Check size={14} color="var(--accent)" /> : <Copy size={14} />}
              </button>
            </div>

            {/* Uncoated U */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface-2)', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)', padding: '0.8rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.8rem'
              }}
            >
              <div
                onClick={() => setColorInput(colorData.pantone.uncoated.hex)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', flex: 1 }}
                title="Hacé clic para cargar este color Uncoated en la app"
              >
                <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', backgroundColor: colorData.pantone.uncoated.hex, border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0 }} />
                <div style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  <strong className="font-headline" style={{ fontSize: '0.95rem', color: 'var(--accent)', display: 'block' }}>{colorData.pantone.uncoated.code}</strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.1rem' }}>Papel Obra / Mate</span>
                  <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-disabled)' }}>HEX {colorData.pantone.uncoated.hex} | {colorData.pantone.uncoated.similarity}</span>
                </div>
              </div>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => copyToClipboard(`${colorData.pantone.uncoated.code} (${colorData.pantone.uncoated.hex})`, 'p-u-single')}
                title="Copiar Pantone Uncoated"
              >
                {copiedCode === 'p-u-single' ? <Check size={14} color="var(--accent)" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => copyToClipboard(bulkPantoneStr, 'bulk-pantones')}
            style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', border: '1px dashed var(--border-strong)' }}
          >
            {copiedCode === 'bulk-pantones' ? <Check size={14} color="var(--accent)" /> : <Copy size={14} />}
            <span>{copiedCode === 'bulk-pantones' ? '¡Ambos Pantones Copiados!' : 'Copiar Ambos Pantones (C & U)'}</span>
          </button>
        </ToolCard>
      </div>

      {/* Row 2 — 3-Column Grid */}
      <div style={gridStyle3Col}>
        {/* Tailwind Shades */}
        <ToolCard icon={Layers} title="Escala de Sombras Tailwind (50 — 950)" description="Se actualiza automáticamente al escribir o seleccionar cualquier color base. Hacé clic en cualquier sombra para aplicarla a todo el sistema.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {tailwindShades.map((shade) => (
              <div
                key={shade.weight}
                onClick={() => { setColorInput(shade.hex); copyToClipboard(shade.hex, `shade-${shade.weight}`); }}
                className="shade-item"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  backgroundColor: shade.hex, color: shade.weight < 500 ? '#08080A' : '#FFFFFF',
                  padding: '0.55rem 0.8rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.82rem', transition: 'transform 0.15s ease'
                }}
              >
                <span className="font-mono">{shade.weight}</span>
                <span className="font-mono">{shade.hex}</span>
                {copiedCode === `shade-${shade.weight}` ? <Check size={14} /> : <Copy size={14} style={{ opacity: 0.7 }} />}
              </div>
            ))}
          </div>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => copyToClipboard(bulkTailwindStr, 'bulk-tailwind')}
            style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', border: '1px dashed var(--border-strong)' }}
          >
            {copiedCode === 'bulk-tailwind' ? <Check size={14} color="var(--accent)" /> : <Copy size={14} />}
            <span>{copiedCode === 'bulk-tailwind' ? '¡Todas las Sombras Copiadas!' : 'Copiar Todas las Sombras Tailwind'}</span>
          </button>
        </ToolCard>

        {/* Harmonies */}
        <ToolCard icon={Droplet} title="Generador de Armonías Cromáticas" description="Esquemas calculados automáticamente en la rueda cromática HSL. Hacé clic en cualquier color para seleccionarlo o usá los botones de copia.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {harmonies.map((scheme) => (
              <div key={scheme.id}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{scheme.label}</span>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => copyToClipboard(scheme.colors.join(', '), `scheme-${scheme.id}`)}
                    style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem' }}
                    title="Copiar todos los colores de este esquema"
                  >
                    {copiedCode === `scheme-${scheme.id}` ? <Check size={12} color="var(--accent)" /> : <Copy size={12} />}
                    <span>{copiedCode === `scheme-${scheme.id}` ? 'Copiado' : 'Copiar Esquema'}</span>
                  </button>
                </div>

                <div style={{ display: 'flex', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                  {scheme.colors.map((c, i) => (
                    <div
                      key={i}
                      onClick={() => { setColorInput(c); copyToClipboard(c, `${scheme.id}-${i}`); }}
                      title={`Hacé clic para seleccionar ${c} o copiarlo`}
                      style={{ flex: 1, height: '36px', backgroundColor: c, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {copiedCode === `${scheme.id}-${i}` && <Check size={13} color="#08080A" />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => copyToClipboard(bulkHarmoniesStr, 'bulk-harmonies')}
            style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', border: '1px dashed var(--border-strong)' }}
          >
            {copiedCode === 'bulk-harmonies' ? <Check size={14} color="var(--accent)" /> : <Copy size={14} />}
            <span>{copiedCode === 'bulk-harmonies' ? '¡Todas las Armonías Copiadas!' : 'Copiar Todas las Armonías'}</span>
          </button>
        </ToolCard>

        {/* Colorblind Quick Preview */}
        <ToolCard icon={ScanEye} title="Vista Rápida de Daltonismo" description="Simulación automática en tiempo real del color activo bajo distintos tipos de daltonismo con botones de copia.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {colorblindSwatches.map((cb) => (
              <div key={cb.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                backgroundColor: 'var(--bg-surface-2)', padding: '0.6rem 0.8rem',
                borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)'
              }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{cb.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600 }}>{cb.hex}</span>
                  <div
                    onClick={() => setColorInput(cb.hex)}
                    title="Hacé clic para cargar este color simulado"
                    style={{ width: '24px', height: '24px', borderRadius: 'var(--radius-sm)', backgroundColor: cb.hex, border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                  />
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => copyToClipboard(cb.hex, `cb-${cb.id}`)}
                    title="Copiar HEX simulado"
                  >
                    {copiedCode === `cb-${cb.id}` ? <Check size={14} color="var(--accent)" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => copyToClipboard(bulkColorblindStr, 'bulk-cb')}
            style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', border: '1px dashed var(--border-strong)' }}
          >
            {copiedCode === 'bulk-cb' ? <Check size={14} color="var(--accent)" /> : <Copy size={14} />}
            <span>{copiedCode === 'bulk-cb' ? '¡Todas las Simulaciones Copiadas!' : 'Copiar Todas las Simulaciones de Daltonismo'}</span>
          </button>
        </ToolCard>
      </div>
    </div>
  );
}
