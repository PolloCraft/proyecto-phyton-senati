import { Component, type ReactNode, type ErrorInfo } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: "40px 24px",
          textAlign: "center",
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "12px",
          margin: "20px",
        }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 16px" }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h2 style={{ margin: "0 0 8px", color: "#991b1b", fontSize: "1.25rem", fontWeight: 700 }}>
            Algo salió mal
          </h2>
          <p style={{ margin: "0 0 16px", color: "#7f1d1d", fontSize: "0.95rem", lineHeight: 1.6 }}>
            Se ha producido un error inesperado. El equipo ha sido notificado.
          </p>
          <details style={{ textAlign: "left", marginTop: 16, padding: 12, background: "#fff", borderRadius: 8, border: "1px solid #fecaca" }}>
            <summary style={{ cursor: "pointer", color: "#991b1b", fontWeight: 600, fontSize: "0.85rem" }}>
              Ver detalles del error
            </summary>
            <pre style={{ marginTop: 12, fontSize: "0.75rem", color: "#7f1d1d", overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {this.state.error?.message}
              {this.state.error?.stack}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 16,
              padding: "10px 24px",
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;