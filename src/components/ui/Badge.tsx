import { cn } from '../../utils/cn';

type BadgeVariant = 'active' | 'draft' | 'archived' | 'default' | 'success' | 'warning' | 'error';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  active: 'border-emerald-300/30 bg-emerald-300/10 text-emerald-200',
  draft: 'border-amber-300/30 bg-amber-300/10 text-amber-200',
  archived: 'border-slate-300/20 bg-slate-300/10 text-slate-300',
  default: 'border-white/10 bg-white/[0.04] text-slate-300',
  success: 'border-emerald-300/30 bg-emerald-300/10 text-emerald-200',
  warning: 'border-amber-300/30 bg-amber-300/10 text-amber-200',
  error: 'border-red-300/30 bg-red-300/10 text-red-200',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-xl border px-3 py-1 text-xs font-medium capitalize',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
