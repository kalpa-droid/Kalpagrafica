import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

export function ToolCard({ icon: Icon, title, description, children, style }) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-subtle)',
      padding: '1.8rem',
      boxShadow: 'var(--shadow-card)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      ...style
    }}>
      <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: description ? '0.5rem' : '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {Icon && <Icon size={18} color="var(--accent)" />}
        <span>{title}</span>
      </h3>
      {description && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.3rem', lineHeight: 1.5 }}>
          {description}
        </p>
      )}
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
}

export function FieldLabel({ children, accent }) {
  return (
    <label style={{ fontSize: '0.8rem', color: accent ? 'var(--accent)' : 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
      {children}
    </label>
  );
}

export function UploadZone({ onFile, hint, fileName, accept = "image/*" }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files) => {
    const file = files && files[0];
    if (file) onFile(file);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
      style={{
        border: `1.5px dashed ${dragOver ? 'var(--accent)' : 'var(--border-strong)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '1.6rem',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: dragOver ? 'var(--accent-muted)' : 'var(--bg-surface-2)',
        transition: 'all 0.2s ease'
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => handleFiles(e.target.files)}
        style={{ display: 'none' }}
      />
      <Upload size={22} color="var(--accent)" style={{ marginBottom: '0.5rem' }} />
      <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
        {fileName || 'Arrastrá un archivo o hacé clic para subir'}
      </div>
      {hint && <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', marginTop: '0.3rem' }}>{hint}</div>}
    </div>
  );
}
