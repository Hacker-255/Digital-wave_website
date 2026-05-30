import { cn } from '../../utils/cn';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  loading?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-blue-600 text-white border border-blue-500 hover:bg-blue-500 shadow-lg shadow-blue-500/20 active:scale-[0.98]',
  secondary:
    'bg-white/[0.04] text-slate-100 border border-white/10 hover:border-blue-400/40 hover:bg-blue-500/10 active:scale-[0.98]',
  ghost:
    'bg-transparent text-slate-300 border border-transparent hover:bg-white/5 hover:text-white active:scale-[0.98]',
  danger:
    'bg-red-600/20 text-red-200 border border-red-500/30 hover:bg-red-600/30 active:scale-[0.98]',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 py-1.5 text-xs gap-1.5 rounded-xl',
  md: 'h-10 px-4 py-2 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 py-3 text-base gap-2 rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  loading,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-200',
        variants[variant],
        sizes[size],
        (loading || disabled) && 'pointer-events-none opacity-60',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
