import { cn } from '../../utils/cn';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <label className="block space-y-1.5">
      {label && (
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          {label}
        </span>
      )}
      <input
        className={cn(
          'w-full rounded-xl border bg-black/20 px-3 py-2 text-sm text-slate-100 outline-none transition-all duration-200',
          'placeholder:text-slate-500',
          error ? 'border-red-500/40 focus:border-red-500' : 'border-white/10 focus:border-blue-400/45',
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </label>
  );
}
