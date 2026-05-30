import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export function Card({ children, className, hover = false, glow = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-xl',
        hover && 'transition-all duration-300 hover:border-blue-500/20 hover:bg-white/[0.06]',
        glow && 'shadow-xl shadow-blue-500/5',
        className,
      )}
    >
      {children}
    </div>
  );
}
