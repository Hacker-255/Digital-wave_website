import { ChevronRight, Menu, Moon, Plus, Search, Sun, LayoutDashboard } from 'lucide-react';
import { LogoutButton } from './LogoutButton';
import { AccountCenter } from './AccountCenter';
import { cn } from '../../utils/cn';
import { sidebarItems, aiSidebarItems, otherSidebarItems } from '../../constants/data';
import { useTheme } from '../../contexts/ThemeContext';
import digitalWaveLogo from '../../assets/digital-wave-logo.png';

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
          <span className="digital-wave-brand-mark">
            <img src={digitalWaveLogo} alt="" />
          </span>
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
        {otherSidebarItems.map(([Icon, label]) => (
          <button
            key={label}
            className={cn('digital-wave-sidebar-item', activeModule === label && 'active')}
            onClick={() => navTo(label)}
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
