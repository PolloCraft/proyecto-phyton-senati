import { createContext, useContext, useState, useCallback, type ReactNode, type FC } from "react";

export type ToastType = "success" | "error" | "warning" | "info" | "loading";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  success: (title: string, message?: string, options?: Partial<Toast>) => string;
  error: (title: string, message?: string, options?: Partial<Toast>) => string;
  warning: (title: string, message?: string, options?: Partial<Toast>) => string;
  info: (title: string, message?: string, options?: Partial<Toast>) => string;
  loading: (title: string, message?: string, options?: Partial<Toast>) => { id: string; dismiss: (type: ToastType, message?: string) => void };
  updateToast: (id: string, updates: Partial<Toast>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let idCounter = 0;
const generateId = () => `toast-${++idCounter}-${Date.now()}`;

export const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = generateId();
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? (toast.type === "loading" ? 0 : 5000),
      dismissible: toast.dismissible ?? true,
    };
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const success = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ type: "success", title, message, ...options });
  }, [addToast]);

  const error = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ type: "error", title, message, duration: 8000, ...options });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ type: "warning", title, message, duration: 7000, ...options });
  }, [addToast]);

  const info = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ type: "info", title, message, ...options });
  }, [addToast]);

  const loading = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    const id = addToast({ type: "loading", title, message, duration: 0, dismissible: false, ...options });
    const dismiss = (finalType: ToastType = "success", finalMessage?: string) => {
      updateToast(id, {
        type: finalType,
        message: finalMessage,
        duration: finalType === "error" ? 8000 : 5000,
        dismissible: true,
      });
    };
    return { id, dismiss };
  }, [addToast, updateToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts, success, error, warning, info, loading, updateToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};