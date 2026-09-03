import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { AlertTriangle, AlertCircle, HelpCircle, CheckCircle2, Trash2, X } from 'lucide-react';
import { Button } from '../components/ui/Button';

export interface ConfirmOptions {
  title?: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  icon?: ReactNode;
}

interface ConfirmContextData {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextData>({} as ConfirmContextData);

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const resolveRef = useRef<(value: boolean) => void>(() => {});

  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    setIsLoading(false);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    resolveRef.current(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolveRef.current(false);
  };

  const variant = options.variant || 'danger';

  let iconContainerClass = 'bg-rose-500/15 border-rose-500/30 text-rose-400';
  let defaultIcon = <Trash2 className="w-6 h-6" />;
  let confirmButtonClass = 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-lg shadow-rose-500/20';

  if (variant === 'warning') {
    iconContainerClass = 'bg-amber-500/15 border-amber-500/30 text-amber-400';
    defaultIcon = <AlertTriangle className="w-6 h-6" />;
    confirmButtonClass = 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold shadow-lg shadow-amber-500/20';
  } else if (variant === 'info') {
    iconContainerClass = 'bg-sky-500/15 border-sky-500/30 text-sky-400';
    defaultIcon = <HelpCircle className="w-6 h-6" />;
    confirmButtonClass = 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-lg shadow-sky-500/20';
  } else if (variant === 'success') {
    iconContainerClass = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
    defaultIcon = <CheckCircle2 className="w-6 h-6" />;
    confirmButtonClass = 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20';
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {/* Modal Dialog de Confirmação Personalizado */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
            onClick={handleCancel}
            aria-hidden="true"
          />

          {/* Card Dialog */}
          <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-5 sm:p-6 text-din-text z-10 shadow-2xl animate-scale-in space-y-4 backdrop-blur-2xl">
            {/* Header com Ícone e Fechar */}
            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-md ${iconContainerClass}`}>
                {options.icon || defaultIcon}
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="p-1.5 text-din-muted hover:text-din-text rounded-xl hover:bg-card-hover transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo Textual */}
            <div className="space-y-1.5 pt-1">
              <h3 className="text-lg sm:text-xl font-bold text-din-text tracking-tight">
                {options.title || 'Confirmar Ação'}
              </h3>
              <div className="text-xs sm:text-sm text-din-muted leading-relaxed">
                {options.message}
              </div>
            </div>

            {/* Botões de Ação Mobile First */}
            <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancel}
                disabled={isLoading}
                className="w-full sm:w-1/2 py-2.5 min-h-[44px] text-slate-300 hover:text-white hover:bg-slate-800/80"
              >
                {options.cancelText || 'Cancelar'}
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading}
                className={`w-full sm:w-1/2 py-2.5 min-h-[44px] font-semibold ${confirmButtonClass}`}
              >
                {options.confirmText || 'Confirmar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context.confirm;
}
