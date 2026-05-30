import { ChevronDown, ChevronRight, Search, Sun, Moon, LayoutDashboard } from 'lucide-react';
import { LogoutButton } from './LogoutButton';
import { AccountCenter } from './AccountCenter';
import { cn } from '../../utils/cn';
import { sidebarItems, aiSidebarItems, otherSidebarItems } from '../../constants/data';
import { useTheme } from '../../contexts/ThemeContext';

interface DigitalWaveSidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  onOpenCommand: () => void;
  onOpenChat: () => void;
}

const allModules = [
  ...sidebarItems.map(([, label]) => label),
  ...aiSidebarItems.map(([, label]) => label),
  ...otherSidebarItems.map(([, label]) => label),
];

export function DigitalWaveSidebar({ activeModule, onModuleChange, onOpenCommand, onOpenChat }: DigitalWaveSidebarProps) {
  const { theme, toggleTheme } = useTheme();

  const navTo = (label: string) => {
    if (allModules.includes(label)) {
      onModuleChange(label);
    }
  };

  return (
    <aside className="flex h-full flex-col border-r border-white/15 bg-white/[0.03] p-3 text-white backdrop-blur-xl">
      <div className="shrink-0">
        <AccountCenter />
        <div className="mb-5 flex w-24 rounded-full border border-white/10 bg-white/5 p-0.5">
          <button onClick={() => onOpenCommand()} className="flex h-7 flex-1 items-center justify-center rounded-full bg-white/15 text-white" type="button">
            <LayoutDashboard size={14} />
          </button>
          <button onClick={onOpenChat} className="flex h-7 flex-1 items-center justify-center rounded-full text-white/80 hover:bg-white/10" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          </button>
        </div>
        <button className="mb-5 flex w-36 items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10" onClick={onOpenChat} type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v8M8 12h8"/><circle cx="12" cy="12" r="10"/></svg> New chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <p className="mb-2 mt-4 text-[11px] text-white/60">Workspace</p>
        {sidebarItems.map(([Icon, label, tone]) => (
          <button
            key={label}
            className={cn('digital-wave-sidebar-item', activeModule === label && 'active')}
            onClick={() => navTo(label)}
            type="button"
          >
            <span className={cn('digital-wave-sidebar-icon', tone)}><Icon size={14} /></span>
            {label}
            {label === 'Workflows' && <ChevronRight className="ml-auto" size={13} />}
          </button>
        ))}
        <p className="mb-2 mt-4 text-[11px] text-white/60">AI</p>
        {aiSidebarItems.map(([Icon, label, tone]) => (
          <button
            key={label}
            className={cn('digital-wave-sidebar-item', activeModule === label && 'active')}
            onClick={() => navTo(label)}
            type="button"
          >
            <span className={cn('digital-wave-sidebar-icon', tone)}><Icon size={14} /></span>
            {label}
          </button>
        ))}
        <p className="mb-2 mt-4 text-[11px] text-white/60">Other</p>
        {otherSidebarItems.map(([Icon, label]) => (
          <button
            key={label}
            className={cn('digital-wave-sidebar-item', activeModule === label && 'active')}
            onClick={() => navTo(label)}
            type="button"
          >
            <span className="digital-wave-sidebar-icon bg-white/10 text-white"><Icon size={14} /></span>
            {label}
          </button>
        ))}
      </div>
      <div className="shrink-0 pt-3 border-t border-white/10 space-y-0.5">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-white/60 transition hover:bg-white/10 hover:text-white/90"
          type="button"
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <LogoutButton />
      </div>
    </aside>
  );
}
