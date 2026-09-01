import React, { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'income' | 'expense' | 'whatsapp' | 'manual' | 'pro' | 'free' | 'neutral';
  children: ReactNode;
}

export function Badge({ className, variant = 'neutral', children, ...props }: BadgeProps) {
  const variants = {
    income: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    expense: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    whatsapp: 'bg-green-500/10 text-green-400 border-green-500/30',
    manual: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    pro: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40 font-semibold',
    free: 'bg-slate-700/40 text-slate-300 border-slate-600/40',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
