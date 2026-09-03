import React, { ReactNode } from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  variant?: 'emerald' | 'indigo' | 'amber' | 'slate';
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  variant = 'emerald',
  className = '',
}: EmptyStateProps) {
  let iconGlowClass = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-500/10';
  let buttonVariant: 'emerald' | 'primary' | 'secondary' = 'emerald';

  if (variant === 'indigo') {
    iconGlowClass = 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 shadow-indigo-500/10';
    buttonVariant = 'primary';
  } else if (variant === 'amber') {
    iconGlowClass = 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-amber-500/10';
    buttonVariant = 'secondary';
  } else if (variant === 'slate') {
    iconGlowClass = 'bg-slate-800/60 border-slate-700/40 text-slate-400 shadow-slate-900/20';
    buttonVariant = 'secondary';
  }

  return (
    <div
      className={`p-8 sm:p-12 rounded-3xl bg-card border border-border text-center flex flex-col items-center justify-center space-y-4 shadow-xl backdrop-blur-sm animate-fade-in ${className}`}
    >
      {/* Icon with Ambient Glow */}
      <div
        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl border flex items-center justify-center shadow-2xl transition-transform duration-300 hover:scale-105 ${iconGlowClass}`}
      >
        <div className="scale-125">{icon}</div>
      </div>

      {/* Texts */}
      <div className="max-w-md space-y-1.5">
        <h4 className="text-base sm:text-lg font-bold text-din-text tracking-tight">{title}</h4>
        <p className="text-xs sm:text-sm text-din-muted leading-relaxed">{description}</p>
      </div>

      {/* Action Buttons */}
      {(actionText || secondaryActionText) && (
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full sm:w-auto">
          {actionText && onAction && (
            <Button
              variant={buttonVariant}
              onClick={onAction}
              className="w-full sm:w-auto min-h-[44px] px-6 shadow-lg shadow-emerald-500/20 font-semibold"
            >
              {actionText}
            </Button>
          )}
          {secondaryActionText && onSecondaryAction && (
            <Button
              variant="ghost"
              onClick={onSecondaryAction}
              className="w-full sm:w-auto min-h-[44px] px-4 text-slate-400 hover:text-white"
            >
              {secondaryActionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
