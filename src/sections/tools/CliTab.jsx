import React from 'react';
import { Terminal, Check, Copy } from 'lucide-react';
import { ToolCard, FieldLabel } from './CommonComponents';

export default function CliTab({ copiedCode, copyToClipboard }) {
  return (
    <ToolCard icon={Terminal} title="Terminal @kalpa-droid/delphitools — Paquete Standalone" description="Ejecutá la suite utilitaria directamente en tu terminal sin necesidad de descargar React ni la aplicación web completa.">
      <div style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <FieldLabel accent>Comando de Instalación Global Npm Scoped (Solo Herramientas &lt; 50 KB)</FieldLabel>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-surface-2)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
          <code className="font-mono" style={{ fontSize: '0.9rem', color: 'var(--accent)' }}>npm install -g @kalpa-droid/delphitools</code>
          <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard('npm install -g @kalpa-droid/delphitools', 'cli-inst')}>
            {copiedCode === 'cli-inst' ? <Check size={16} color="var(--accent)" /> : <Copy size={16} />}
          </button>
        </div>

        <FieldLabel>Ejecutar sin instalar mediante npx:</FieldLabel>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-surface-2)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)' }}>
          <code className="font-mono" style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>npx @kalpa-droid/delphitools colour ffd42a</code>
          <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard('npx @kalpa-droid/delphitools colour ffd42a', 'cli-npx')}>
            {copiedCode === 'cli-npx' ? <Check size={16} color="var(--accent)" /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {[
          { cmd: 'dt colour ffd42aff', desc: 'Convierte ffd42aff a RGB, HSL, CMYK, OKLCH y Coincidencias Pantone Coated/Uncoated' },
          { cmd: 'dt pantone 115-c', desc: 'Muestra la ficha técnica Pantone PMS Coated (brillante) vs Uncoated (mate)' },
          { cmd: 'dt tailwind-shades #BAFDC1', desc: 'Genera las 11 sombras de 50 a 950 para Tailwind CSS' },
          { cmd: 'dt harmony #BAFDC1', desc: 'Genera esquemas complementarios, análogos, triádicos y tetrádicos' },
          { cmd: 'dt contrast #BAFDC1 #111114', desc: 'Calcula el ratio de contraste WCAG entre dos colores' }
        ].map((c) => (
          <div key={c.cmd} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            backgroundColor: 'var(--bg-surface-2)', padding: '0.8rem 1rem',
            borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)'
          }}>
            <div>
              <code className="font-mono" style={{ fontSize: '0.88rem', color: 'var(--accent)', display: 'block', marginBottom: '0.2rem' }}>{c.cmd}</code>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{c.desc}</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard(c.cmd, c.cmd)} title="Copiar comando">
              {copiedCode === c.cmd ? <Check size={15} color="var(--accent)" /> : <Copy size={15} />}
            </button>
          </div>
        ))}
      </div>
    </ToolCard>
  );
}
