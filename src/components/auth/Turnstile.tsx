import { useEffect, useRef, useState } from "react";

declare global {
  interface Window { turnstile?: { render: (el: HTMLElement, opts: any) => string; reset: (widgetId: string) => void; remove: (widgetId: string) => void } }
}

interface TurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

export default function Turnstile({ onVerify, onExpire }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string>("");
  const [loaded, setLoaded] = useState(false);

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    const waitForTurnstile = setInterval(() => {
      if (window.turnstile) {
        clearInterval(waitForTurnstile);
        setLoaded(true);

        widgetIdRef.current = window.turnstile.render(containerRef.current!, {
          sitekey: siteKey,
          callback: (token: string) => onVerify(token),
          "expired-callback": () => onExpire?.(),
          theme: "light",
          size: "normal",
        });
      }
    }, 200);

    return () => {
      clearInterval(waitForTurnstile);
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch {}
      }
    };
  }, [siteKey]);

  if (!siteKey) return null;

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
