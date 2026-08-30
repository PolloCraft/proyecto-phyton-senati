import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement | string, opts: any) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      getResponse: (widgetId: string) => string | undefined;
    };
  }
}

interface TurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

export default function Turnstile({ onVerify, onExpire }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string>("");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string;

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    let timeout: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;

    const tryRender = () => {
      if (window.turnstile && containerRef.current) {
        clearInterval(interval);
        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token: string) => {
              setLoaded(true);
              onVerify(token);
            },
            "expired-callback": () => onExpire?.(),
            "error-callback": () => {
              setError(true);
            },
            theme: "light",
            size: "normal",
          });
          setLoaded(true);
        } catch (e) {
          console.error("Turnstile render error:", e);
          setError(true);
        }
      }
    };

    interval = setInterval(tryRender, 300);

    timeout = setTimeout(() => {
      if (!loaded) {
        clearInterval(interval);
        setError(true);
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch {}
      }
    };
  }, [siteKey, onVerify, onExpire]);

  if (!siteKey) {
    return (
      <div style={{ padding: "8px", background: "#fef2f2", borderRadius: 8, fontSize: 12, color: "#dc2626" }}>
        Turnstile no configurado (site key faltante)
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "12px", background: "#fef2f2", borderRadius: 8, fontSize: 13, color: "#dc2626", textAlign: "center" }}>
        Error al cargar verificacion.{" "}
        <button
          onClick={() => {
            setError(false);
            setLoaded(false);
          }}
          style={{ background: "none", border: "none", color: "#6366f1", textDecoration: "underline", cursor: "pointer", fontSize: 13 }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={{ margin: "12px 0" }}>
      <div ref={containerRef} />
      {!loaded && (
        <div style={{ padding: "12px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
          Cargando verificacion...
        </div>
      )}
    </div>
  );
}
