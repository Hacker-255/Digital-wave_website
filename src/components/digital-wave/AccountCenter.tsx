import { useState, useCallback } from 'react';
import { LogOut, UserPlus, Check, ChevronDown, Circle, Clock, Monitor, Smartphone } from 'lucide-react';
import { useClerk, useUser } from '@clerk/clerk-react';
import { useAuth } from '../../contexts/AuthContext';
import { loadSettings, saveSettings } from '../../services/settingsService';

interface SavedAccount {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  lastUsed: string;
}

const STORAGE_KEY = 'crm-saved-accounts';

function loadSavedAccounts(): SavedAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveSavedAccounts(accounts: SavedAccount[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch { /* ignore */ }
}

export function AccountCenter() {
  const [open, setOpen] = useState(false);
  const { signOut } = useClerk();
  const { user: clerkUser, isSignedIn } = useUser();
  const { currentUser, isManager } = useAuth();
  const [savedAccounts] = useState<SavedAccount[]>(loadSavedAccounts);

  const saveCurrentAccount = useCallback(() => {
    if (!clerkUser || !isSignedIn) return;
    const accounts = loadSavedAccounts();
    const existing = accounts.findIndex((a) => a.id === clerkUser.id);
    const entry: SavedAccount = {
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      name: clerkUser.fullName || 'User',
      avatar: clerkUser.imageUrl,
      lastUsed: new Date().toISOString(),
    };
    if (existing >= 0) {
      accounts[existing] = entry;
    } else {
      accounts.unshift(entry);
      if (accounts.length > 10) accounts.pop();
    }
    saveSavedAccounts(accounts);
  }, [clerkUser, isSignedIn]);

  const handleSwitchAccount = useCallback(async (account: SavedAccount) => {
    try {
      await signOut();
      localStorage.setItem('crm-pending-login', JSON.stringify({
        email: account.email,
        name: account.name,
      }));
      window.location.href = '/';
    } catch { /* ignore */ }
  }, [signOut]);

  const handleAddAccount = useCallback(async () => {
    saveCurrentAccount();
    try {
      await signOut();
      window.location.href = '/';
    } catch { /* ignore */ }
  }, [signOut, saveCurrentAccount]);

  if (!currentUser) return null;

  const statusColor = currentUser.online
    ? currentUser.away ? '#f59e0b' : '#22c55e'
    : '#6b7280';

  return (
    <div className="relative">
      <button
        onClick={() => { saveCurrentAccount(); setOpen(!open); }}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition hover:bg-white/10"
        style={{ color: 'var(--crm-text-secondary)' }}
        type="button"
      >
        <div className="relative flex-shrink-0">
          {currentUser.avatar ? (
            <img src={currentUser.avatar} alt="" className="h-5 w-5 rounded-full" />
          ) : (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-lime-600 text-[9px] font-bold text-[#061b15]">
              {currentUser.name[0]?.toUpperCase() || '?'}
            </span>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white/20"
            style={{ backgroundColor: statusColor }}
          />
        </div>
        <span className="flex-1 truncate text-left">{currentUser.name}</span>
        <ChevronDown size={11} className="opacity-50" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute top-full left-0 right-0 z-50 mt-1 overflow-hidden rounded-xl border shadow-2xl"
            style={{
              background: 'var(--crm-dropdown-bg)',
              borderColor: 'var(--crm-border-accent)',
            }}
          >
            <div className="p-2">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: 'var(--crm-text-muted)' }}>
                Signed in as
              </p>
              <div className="flex items-center gap-2 rounded-lg px-2 py-2">
                <div className="relative">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt="" className="h-7 w-7 rounded-full" />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-lime-600 text-xs font-bold text-[#061b15]">
                      {currentUser.name[0]?.toUpperCase() || '?'}
                    </span>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white/20"
                    style={{ backgroundColor: statusColor }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" style={{ color: 'var(--crm-text)' }}>
                    {currentUser.name}
                  </p>
                  <p className="truncate text-xs" style={{ color: 'var(--crm-text-muted)' }}>
                    {currentUser.email}
                  </p>
                </div>
                <Check size={14} style={{ color: 'var(--crm-text-muted)' }} />
              </div>

              {isManager && (
                <div className="mt-1 rounded-lg px-2 py-1.5 text-xs"
                  style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                  <Monitor size={11} className="inline mr-1" />
                  CRM Manager • {currentUser.role}
                </div>
              )}
            </div>

            {savedAccounts.length > 0 && (
              <>
                <div className="border-t" style={{ borderColor: 'var(--crm-border)' }} />
                <div className="p-2">
                  <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--crm-text-muted)' }}>
                    Saved accounts
                  </p>
                  <div className="max-h-40 overflow-y-auto">
                    {savedAccounts.filter((a) => a.id !== clerkUser?.id).map((account) => (
                      <button
                        key={account.id}
                        onClick={() => handleSwitchAccount(account)}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition hover:bg-white/10"
                        type="button"
                      >
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-[9px] font-bold"
                          style={{ color: 'var(--crm-text-secondary)' }}>
                          {account.name[0]?.toUpperCase() || '?'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate" style={{ color: 'var(--crm-text)' }}>{account.name}</p>
                          <p className="truncate text-[10px]" style={{ color: 'var(--crm-text-muted)' }}>{account.email}</p>
                        </div>
                        <Clock size={10} className="opacity-40" style={{ color: 'var(--crm-text-muted)' }} />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="border-t" style={{ borderColor: 'var(--crm-border)' }} />
            <div className="p-1">
              <button
                onClick={handleAddAccount}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition hover:bg-white/10"
                style={{ color: 'var(--crm-text-secondary)' }}
                type="button"
              >
                <UserPlus size={14} />
                Add another account
              </button>
              <LogoutButtonInline />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function LogoutButtonInline() {
  const { signOut } = useClerk();

  const handleLogout = async () => {
    try {
      localStorage.removeItem('crm-settings');
      localStorage.removeItem('crm-selected-ids');
      localStorage.removeItem('crm-view-mode');
      localStorage.removeItem('crm-saved-accounts');
      localStorage.removeItem('theme');
      await signOut();
      window.location.href = '/';
    } catch { /* ignore */ }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition hover:bg-white/10"
      style={{ color: 'var(--crm-text-secondary)' }}
      type="button"
    >
      <LogOut size={14} />
      Sign out
    </button>
  );
}
