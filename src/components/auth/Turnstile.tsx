import { useEffect, useRef, useState, useCallback } from "react";

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
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);

  onVerifyRef.current = onVerify;
  onExpireRef.current = onExpire;

  const siteKey = "0x4AAAAAAEhpe3UsjnvRf7I0";

  useEffect(() => {
    if (!containerRef.current || widgetIdRef.current) return;

    let interval: ReturnType<typeof setInterval>;
    let timeout: ReturnType<typeof setTimeout>;

    const tryRender = () => {
      if (window.turnstile && containerRef.current && !widgetIdRef.current) {
        clearInterval(interval);
        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token: string) => {
              setLoaded(true);
              onVerifyRef.current(token);
            },
            "expired-callback": () => onExpireRef.current?.(),
            "error-callback": () => setError(true),
            theme: "light",
            size: "normal",
          });
          setLoaded(true);
        } catch {
          setError(true);
        }
      }
    };

    interval = setInterval(tryRender, 300);
    timeout = setTimeout(() => {
      if (!loaded) { clearInterval(interval); setError(true); }
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const handleRetry = useCallback(() => {
    setError(false);
    setLoaded(false);
    widgetIdRef.current = "";
    if (containerRef.current && window.turnstile) {
      try { window.turnstile.remove(widgetIdRef.current); } catch {}
    }
  }, []);

  if (error) {
    return (
      <div style={{ padding: "12px", background: "#fef2f2", borderRadius: 8, fontSize: 13, color: "#dc2626", textAlign: "center" }}>
        Error al cargar verificacion.{" "}
        <button onClick={handleRetry} style={{ background: "none", border: "none", color: "#6366f1", textDecoration: "underline", cursor: "pointer", fontSize: 13 }}>
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
