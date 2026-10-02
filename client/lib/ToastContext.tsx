import { createContext, useCallback, useContext, useRef, useState, ReactNode } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

type ToastVariant = "info" | "success" | "error";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<ToastVariant, { bg: string; icon: typeof Info }> = {
  info: { bg: "bg-slate-900", icon: Info },
  success: { bg: "bg-emerald-600", icon: CheckCircle2 },
  error: { bg: "bg-rose-600", icon: AlertTriangle },
};

/**
 * Replaces window.alert() across the app - alert() blocks the whole page
 * (and every other tab, on some browsers) until dismissed, which is jarring
 * for routine, non-critical notices (mic permission denied, "select a
 * document first", a TTS failure). This is a minimal, dependency-free
 * toast stack instead of pulling in a whole notification library.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const { bg, icon: Icon } = VARIANT_STYLES[t.variant];
          return (
            <div
              key={t.id}
              className={`${bg} text-white rounded-xl shadow-lg px-4 py-3 flex items-start gap-2.5 pointer-events-auto animate-in slide-in-from-bottom-2 fade-in duration-200`}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium flex-1">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast() must be called within a <ToastProvider>");
  }
  return ctx;
}
