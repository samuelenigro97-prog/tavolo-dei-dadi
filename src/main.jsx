import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('Crash intercettato da ErrorBoundary:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20, background: 'rgba(20,12,8,0.88)', backdropFilter: 'blur(8px)', color: '#fff',
          fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        }}>
          <div style={{
            maxWidth: 480, width: '100%', background: '#2c1e14', border: '1.5px solid #d4af37',
            borderRadius: 12, padding: 24, boxShadow: '0 10px 40px rgba(0,0,0,0.6)', textAlign: 'center'
          }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>⚠️</div>
            <h2 style={{ color: '#d4af37', fontSize: 20, margin: '0 0 10px 0' }}>Errore di Visualizzazione Scheda</h2>
            <p style={{ fontSize: 13, color: '#e0d8cc', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              La scheda non è stata caricata correttamente a causa di dati non previsti.
            </p>
            {this.state.error && (
              <pre style={{
                background: 'rgba(0,0,0,0.5)', padding: '10px 12px', borderRadius: 6,
                fontSize: 11.5, color: '#ff8a80', textAlign: 'left', overflowX: 'auto',
                margin: '0 0 20px 0', maxHeight: 120, border: '1px solid rgba(255,255,255,0.1)'
              }}>
                {String(this.state.error.message || this.state.error)}
              </pre>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                style={{
                  background: '#d4af37', color: '#1a110b', border: 'none', borderRadius: 8,
                  padding: '10px 18px', fontWeight: 800, fontSize: 14, cursor: 'pointer'
                }}
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
              >
                🔄 Ricarica Pagina
              </button>
              <button
                style={{
                  background: 'transparent', color: '#d4af37', border: '1px solid #d4af37',
                  borderRadius: 8, padding: '10px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer'
                }}
                onClick={() => {
                  try {
                    localStorage.removeItem('scheda-interattiva:v1');
                    localStorage.removeItem('tavolo-dei-dadi:scheda:v1');
                  } catch {}
                  window.location.reload();
                }}
              >
                🏠 Ripristina Scheda Base
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
