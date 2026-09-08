import React, { InputHTMLAttributes, ReactNode } from 'react';
import { cn, formatCurrencyInput, parseCurrencyInput } from '../../lib/utils';

export interface CurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  hint?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (numericValue: number, formattedValue: string) => void;
  currencyPrefix?: string;
  allowZero?: boolean;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      className,
      label,
      error,
      icon,
      hint,
      id,
      value = '',
      onChange,
      onValueChange,
      currencyPrefix = 'R$',
      allowZero = false,
      placeholder = '0,00',
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    // Garante que o valor exibido esteja formatado
    const displayValue = typeof value === 'number'
      ? formatCurrencyInput(value, allowZero)
      : value;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawInput = e.target.value;
      const formatted = formatCurrencyInput(rawInput, allowZero);
      const numeric = parseCurrencyInput(formatted);

      if (onValueChange) {
        onValueChange(numeric, formatted);
      }

      if (onChange) {
        // Cria evento sintético com o valor formatado
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            name: props.name || '',
            value: formatted,
          },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-din-muted tracking-wide uppercase"
          >
            {label}
          </label>
        )}
        <div className="relative rounded-xl shadow-inner">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-din-muted font-bold text-xs select-none">
            {icon || <span className="text-din-muted/80">{currencyPrefix}</span>}
          </div>
          <input
            ref={ref}
            id={inputId}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'w-full rounded-xl bg-card-secondary border border-border text-din-text placeholder-din-muted/60 text-base sm:text-sm pl-11 pr-3.5 py-2.5 h-11 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-din-primary/40 focus:border-din-primary shadow-sm disabled:opacity-50 disabled:bg-card',
              error && 'border-rose-500/80 focus:ring-rose-500/50 focus:border-rose-500',
              className
            )}
            {...props}
          />
        </div>
        {hint && !error && <p className="text-xs text-din-muted">{hint}</p>}
        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
