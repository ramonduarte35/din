import React, { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: 'none' | 'emerald' | 'rose' | 'indigo';
  children: ReactNode;
}

export function Card({ className, glow = 'none', children, ...props }: CardProps) {
  const glowClasses = {
    none: '',
    emerald: 'border-emerald-500/30 hover:border-emerald-500/50 shadow-lg shadow-emerald-500/10',
    rose: 'border-rose-500/30 hover:border-rose-500/50 shadow-lg shadow-rose-500/10',
    indigo: 'border-indigo-500/30 hover:border-indigo-500/50 shadow-lg shadow-indigo-500/10',
  };

  return (
    <div
      className={cn(
        'rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-5 transition-all duration-200 shadow-xl',
        glowClasses[glow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
