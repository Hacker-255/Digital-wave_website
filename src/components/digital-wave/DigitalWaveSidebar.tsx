import { ChevronRight, Menu, Moon, Plus, Search, Sun, LayoutDashboard, Mail, BarChart3, Users, CreditCard, Puzzle } from 'lucide-react';
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
    <aside className="digital-wave-sidebar flex flex-col">
      <div className="shrink-0">
        <div className="digital-wave-brand">
          <span className="digital-wave-brand-mark" aria-hidden="true" />
          <b>Digital Wave</b>
          <button onClick={onOpenCommand} type="button" aria-label="Open command menu">
            <Menu size={16} />
          </button>
        </div>
        <AccountCenter />
        <div className="digital-wave-pill-nav">
          <button onClick={() => onModuleChange('Dashboards')} className="active" type="button" aria-label="Dashboard">
            <LayoutDashboard size={14} />
          </button>
          <button onClick={onOpenChat} type="button" aria-label="AI chat">
            <Search size={14} />
          </button>
        </div>
        <button className="digital-wave-new-chat" onClick={onOpenChat} type="button">
          <Plus size={16} /> New
        </button>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <p className="digital-wave-section-label">Workspace</p>
        {[...sidebarItems].sort((a, b) => (a[1] === 'Dashboards' ? -1 : b[1] === 'Dashboards' ? 1 : 0)).map(([Icon, label, tone]) => (
          <button
            key={label}
            className={cn('digital-wave-sidebar-item', activeModule === label && 'active')}
            onClick={() => navTo(label)}
            type="button"
          >
            <span className={cn('digital-wave-sidebar-icon', tone)}><Icon size={14} /></span>
            {label === 'Dashboards' ? 'Dashboard' : label}
            {label === 'Workflows' && <ChevronRight className="ml-auto" size={13} />}
          </button>
        ))}
        <button className="digital-wave-sidebar-item" onClick={() => navTo('Settings')} type="button"><span className="digital-wave-sidebar-icon bg-slate-500/20 text-slate-500"><Mail size={14} /></span>Email</button>
        <button className="digital-wave-sidebar-item" onClick={() => navTo('Dashboards')} type="button"><span className="digital-wave-sidebar-icon bg-slate-500/20 text-slate-500"><BarChart3 size={14} /></span>Reports</button>
        <button className="digital-wave-sidebar-item" onClick={() => navTo('Meetings')} type="button"><span className="digital-wave-sidebar-icon bg-slate-500/20 text-slate-500"><CalendarIcon /></span>Calendar</button>
        <p className="digital-wave-section-label">AI</p>
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
        <p className="digital-wave-section-label">Other</p>
        {[
          ...otherSidebarItems,
          [Users, 'Team'] as const,
          [Puzzle, 'Integrations'] as const,
          [CreditCard, 'Billing'] as const,
        ].map(([Icon, label]) => (
          <button
            key={label}
            className={cn('digital-wave-sidebar-item', activeModule === label && 'active')}
            onClick={() => label === 'Settings' || label === 'Documentation' ? navTo(label) : navTo('Settings')}
            type="button"
          >
            <span className="digital-wave-sidebar-icon" style={{ background: 'var(--crm-surface)', color: 'var(--crm-text-secondary)' }}><Icon size={14} /></span>
            {label}
          </button>
        ))}
      </div>
      <div className="shrink-0 pt-3 border-t space-y-1" style={{ borderColor: 'var(--crm-border)' }}>
        <button
          onClick={toggleTheme}
          className="digital-wave-sidebar-item"
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

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}
