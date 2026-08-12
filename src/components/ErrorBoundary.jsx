import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary atrapó un error no controlado:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          backgroundColor: 'var(--bg-surface-2)',
          border: '1.5px solid #F87171',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          margin: '1rem 0',
          textAlign: 'center',
          color: 'var(--text-primary)'
        }}>
          <AlertCircle size={32} color="#F87171" style={{ marginBottom: '0.6rem' }} />
          <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.4rem', color: '#F87171' }}>
            {this.props.title || 'Se produjo un problema inesperado en el componente.'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', maxWidth: '500px', margin: '0 auto 1rem' }}>
            No te preocupes, el resto de la aplicación sigue funcionando. Podés intentar recargar o seleccionar otro archivo PDF.
          </div>
          <button
            onClick={this.handleReset}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', margin: '0 auto' }}
          >
            <RefreshCw size={14} />
            <span>Reintentar / Volver a Cargar</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
