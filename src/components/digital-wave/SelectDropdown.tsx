import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

interface SelectDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

export function SelectDropdown({ value, onChange, options, placeholder }: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; width: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const handleScroll = () => setOpen(false);
    const handleClick = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('mousedown', handleClick, true);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('mousedown', handleClick, true);
    };
  }, [open]);

  const toggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      setPos({ left: rect.left, top: rect.bottom + 4, width: rect.width });
    }
    setOpen(true);
  };

  const select = (option: string) => {
    onChange(option);
    setOpen(false);
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={(e) => { e.stopPropagation(); toggle(); }}
        type="button"
        className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs outline-none transition"
        style={{ background: 'var(--crm-surface)', borderColor: 'var(--crm-border)', color: 'var(--crm-text)' }}
      >
        <span>{value || placeholder || 'Select...'}</span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && pos && createPortal(
        <div
          className="fixed z-[9999] rounded-xl border py-1 shadow-2xl"
          style={{
            background: 'var(--crm-dropdown-bg)',
            borderColor: 'var(--crm-border-accent)',
            left: pos.left,
            top: pos.top,
            minWidth: pos.width,
          }}
        >
          {options.map((option) => (
            <button
              key={option}
              onClick={(e) => { e.stopPropagation(); select(option); }}
              type="button"
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition"
              style={{
                color: value === option ? 'var(--crm-text)' : 'var(--crm-text-secondary)',
                background: value === option ? 'var(--crm-hover)' : 'transparent',
              }}
              onMouseEnter={(e) => { if (value !== option) e.currentTarget.style.background = 'var(--crm-hover-subtle)'; }}
              onMouseLeave={(e) => { if (value !== option) e.currentTarget.style.background = 'transparent'; }}
            >
              {option}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
