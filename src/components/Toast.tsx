import { useEffect, useState, type FC } from "react";
import { useToast, type Toast } from "../context/ToastContext";

interface ToastItemProps {
  toast: Toast;
}

const icons = {
  success: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  loading: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="toast-spinner">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  ),
};

const colors = {
  success: { bg: "#f0fdf4", border: "#16a34a", text: "#166534", icon: "#16a34a" },
  error: { bg: "#fef2f2", border: "#ef4444", text: "#991b1b", icon: "#ef4444" },
  warning: { bg: "#fffbeb", border: "#f59e0b", text: "#92400e", icon: "#f59e0b" },
  info: { bg: "#eff6ff", border: "#3b82f6", text: "#1e40af", icon: "#3b82f6" },
  loading: { bg: "#fafafa", border: "#64748b", text: "#334155", icon: "#64748b" },
};

const ToastItem: FC<ToastItemProps> = ({ toast }) => {
  const { removeToast } = useToast();
  const [isExiting, setIsExiting] = useState(false);
  const colorScheme = colors[toast.type];

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => removeToast(toast.id), 300);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.id, removeToast]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => removeToast(toast.id), 300);
  };

  const handleAction = () => {
    if (toast.action?.onClick) {
      toast.action.onClick();
      if (toast.action.label !== "Deshacer") removeToast(toast.id);
    }
  };

  if (isExiting) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "16px 20px",
        background: colorScheme.bg,
        border: `1px solid ${colorScheme.border}`,
        borderLeft: `4px solid ${colorScheme.border}`,
        borderRadius: 12,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)",
        minWidth: 320,
        maxWidth: 480,
        animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
    >
      <div
        style={{
          flexShrink: 0,
          width: 24,
          height: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: colorScheme.icon,
          marginTop: 2,
        }}
        role="img"
        aria-label={toast.type}
      >
        {icons[toast.type]}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div>
            <h4 style={{ margin: "0 0 4px", fontSize: "0.95rem", fontWeight: 700, color: colorScheme.text, lineHeight: 1.3 }}>
              {toast.title}
            </h4>
            {toast.message && (
              <p style={{ margin: 0, fontSize: "0.85rem", color: colorScheme.text, opacity: 0.9, lineHeight: 1.5 }}>
                {toast.message}
              </p>
            )}
          </div>
          {toast.dismissible && (
            <button
              onClick={handleDismiss}
              style={{
                flexShrink: 0,
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                background: "transparent",
                color: colorScheme.text,
                opacity: 0.5,
                cursor: "pointer",
                borderRadius: 6,
                transition: "all 0.15s",
                padding: 0,
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseOut={(e) => (e.currentTarget.style.opacity = "0.5")}
              aria-label="Cerrar notificación"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {toast.action && (
          <button
            onClick={handleAction}
            style={{
              marginTop: 10,
              padding: "6px 14px",
              fontSize: "0.8rem",
              fontWeight: 600,
              color: colorScheme.icon,
              background: "transparent",
              border: `1px solid ${colorScheme.icon}`,
              borderRadius: 6,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = colorScheme.icon;
              e.currentTarget.style.color = "#fff";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = colorScheme.icon;
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {toast.duration && toast.duration > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: 3,
            background: colorScheme.icon,
            borderRadius: "0 0 12px 12px",
            animation: `progressBar ${toast.duration}ms linear forwards`,
            transformOrigin: "left",
          }}
        />
      )}
    </div>
  );
};

const ToastContainer: FC = () => {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        maxWidth: 520,
        pointerEvents: "none",
      }}
      role="region"
      aria-label="Notificaciones"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: "auto" }}>
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;