import { useState } from 'react';
import { LogOut, AlertTriangle, X } from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';

interface LogoutButtonProps {
  variant?: 'sidebar' | 'settings' | 'icon-only';
}

export function LogoutButton({ variant = 'sidebar' }: LogoutButtonProps) {
  const { signOut } = useClerk();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('crm-settings');
      localStorage.removeItem('crm-selected-ids');
      localStorage.removeItem('crm-view-mode');
      localStorage.removeItem('theme');
      await signOut();
      window.location.href = '/';
    } catch {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (variant === 'icon-only') {
    return (
      <>
        <button
          onClick={() => setShowConfirm(true)}
          type="button"
          className="flex items-center justify-center rounded-md p-1.5 text-xs transition"
          style={{ color: 'var(--crm-text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--crm-text-muted)'; e.currentTarget.style.background = 'transparent'; }}
          aria-label="Logout"
        >
          <LogOut size={14} />
        </button>
        {showConfirm && renderModal()}
      </>
    );
  }

  const isSettings = variant === 'settings';

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        type="button"
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition"
        style={{
          color: isSettings ? 'var(--crm-text-secondary)' : 'var(--crm-text-muted)',
          fontSize: isSettings ? 'inherit' : undefined,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = isSettings ? 'var(--crm-text-secondary)' : 'var(--crm-text-muted)'; e.currentTarget.style.background = 'transparent'; }}
      >
        <LogOut size={13} />
        <span className="truncate">Logout</span>
      </button>
      {showConfirm && renderModal()}
    </>
  );

  function renderModal() {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={(e) => { if (e.target === e.currentTarget) setShowConfirm(false); }}
      >
        <div
          className="rounded-xl border p-5 w-80 shadow-2xl"
          style={{ background: 'var(--crm-app-bg)', borderColor: 'var(--crm-border)' }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: 'rgba(248,113,113,0.1)' }}>
                <AlertTriangle size={16} style={{ color: '#f87171' }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--crm-text)' }}>Logout</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--crm-text-muted)' }}>Are you sure you want to logout?</p>
              </div>
            </div>
            <button
              onClick={() => setShowConfirm(false)}
              type="button"
              className="flex h-6 w-6 items-center justify-center rounded-md transition"
              style={{ color: 'var(--crm-text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--crm-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <X size={14} />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowConfirm(false)}
              type="button"
              className="flex-1 rounded-lg border px-3 py-2 text-xs transition"
              style={{ borderColor: 'var(--crm-border)', color: 'var(--crm-text-secondary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--crm-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              disabled={loading}
              type="button"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition disabled:opacity-50"
              style={{ background: '#dc2626', color: '#fff' }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#b91c1c'; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#dc2626'; }}
            >
              {loading ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <LogOut size={13} />
              )}
              {loading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
