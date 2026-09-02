import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextData {
  toast: {
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
  };
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, description?: string, duration = 4000) => {
    const id = `${Date.now()}-${Math.random()}`;
    const newToast: ToastItem = { id, type, title, description, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: useCallback((title: string, description?: string) => addToast('success', title, description), [addToast]),
    error: useCallback((title: string, description?: string) => addToast('error', title, description), [addToast]),
    info: useCallback((title: string, description?: string) => addToast('info', title, description), [addToast]),
    warning: useCallback((title: string, description?: string) => addToast('warning', title, description), [addToast]),
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[9999] flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
        {toasts.map((t) => {
          let bgColor = 'bg-slate-900 border-slate-700/80 text-slate-100';
          let icon = <Info className="w-5 h-5 text-sky-400 shrink-0" />;

          if (t.type === 'success') {
            bgColor = 'bg-slate-900/95 border-emerald-500/40 text-emerald-100 shadow-emerald-500/10';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
          } else if (t.type === 'error') {
            bgColor = 'bg-slate-900/95 border-rose-500/40 text-rose-100 shadow-rose-500/10';
            icon = <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
          } else if (t.type === 'warning') {
            bgColor = 'bg-slate-900/95 border-amber-500/40 text-amber-100 shadow-amber-500/10';
            icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start justify-between p-3.5 rounded-2xl border shadow-xl backdrop-blur-xl transition-all animate-slide-up ${bgColor}`}
            >
              <div className="flex items-start space-x-3 min-w-0 pr-2">
                <div className="mt-0.5">{icon}</div>
                <div className="min-w-0">
                  <h5 className="font-semibold text-sm text-white">{t.title}</h5>
                  {t.description && (
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{t.description}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}
