import { useState } from 'react';
import { CreditCard, Download, TrendingUp, Users, Zap, HardDrive, Check, X, Plus, Trash2 } from 'lucide-react';
import { SelectDropdown } from './SelectDropdown';
import type { BillingSettings, PaymentMethod, InvoiceRecord } from '../../services/settingsService';

const PLANS = [
  { id: 'free', name: 'Free', price: 0, yearlyPrice: 0, ai: 100, workflows: 50, storage: 1, team: 2, popular: false },
  { id: 'starter', name: 'Starter', price: 29, yearlyPrice: 290, ai: 500, workflows: 200, storage: 5, team: 5, popular: false },
  { id: 'professional', name: 'Professional', price: 99, yearlyPrice: 990, ai: 2000, workflows: 500, storage: 10, team: 10, popular: true },
  { id: 'enterprise', name: 'Enterprise', price: 299, yearlyPrice: 2990, ai: 10000, workflows: 5000, storage: 100, team: 999, popular: false },
];

export function BillingPanel({ settings, onChange }: { settings: BillingSettings; onChange: (s: BillingSettings) => void }) {
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardForm, setCardForm] = useState({ brand: 'Visa', last4: '', expMonth: 12, expYear: 2027 });

  const currentPlan = PLANS.find((p) => p.id === settings.plan) || PLANS[2];
  const price = settings.billingCycle === 'yearly' ? currentPlan.yearlyPrice : currentPlan.price;
  const usagePercent = (key: keyof typeof settings.usage) => {
    const val = settings.usage[key];
    const limit = settings.usage[`${key.replace(/Used$/, '')}Limit` as keyof typeof settings.usage] as number || 1;
    return Math.round((val as number / limit) * 100);
  };

  const addCard = () => {
    if (!cardForm.last4 || cardForm.last4.length < 4) return;
    const pm: PaymentMethod = { id: 'pm_' + Date.now(), ...cardForm, isDefault: settings.paymentMethods.length === 0 };
    onChange({ ...settings, paymentMethods: [...settings.paymentMethods, pm] });
    setCardForm({ brand: 'Visa', last4: '', expMonth: 12, expYear: 2027 });
    setShowAddCard(false);
  };

  const removeCard = (id: string) => {
    onChange({ ...settings, paymentMethods: settings.paymentMethods.filter((p) => p.id !== id) });
  };

  const setDefaultCard = (id: string) => {
    onChange({ ...settings, paymentMethods: settings.paymentMethods.map((p) => ({ ...p, isDefault: p.id === id })) });
  };

  const cancelSub = () => {
    onChange({ ...settings, cancelAtPeriodEnd: !settings.cancelAtPeriodEnd });
  };

  const switchPlan = (planId: string) => {
    onChange({ ...settings, plan: planId as BillingSettings['plan'] });
  };

  const switchCycle = () => {
    onChange({ ...settings, billingCycle: settings.billingCycle === 'monthly' ? 'yearly' : 'monthly' });
  };

  const downloadInvoice = (invoice: InvoiceRecord) => {
    const contents = [
      'Digital Wave CRM Invoice',
      `Invoice: ${invoice.id}`,
      `Date: ${invoice.date}`,
      `Plan: ${invoice.plan}`,
      `Amount: ${invoice.currency} ${invoice.amount}`,
      `Status: ${invoice.status}`,
      `Period: ${invoice.periodStart} to ${invoice.periodEnd}`,
    ].join('\n');
    const blob = new Blob([contents], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoice.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Current Plan */}
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--crm-border)' }}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--crm-text)' }}>Current Plan</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--crm-text-muted)' }}>You are on the <strong style={{ color: 'var(--crm-text)' }}>{currentPlan.name}</strong> plan</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold" style={{ color: 'var(--crm-text)' }}>${price}<span className="text-xs font-normal" style={{ color: 'var(--crm-text-muted)' }}>/{settings.billingCycle === 'yearly' ? 'yr' : 'mo'}</span></p>
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium mt-1"
              style={{ background: settings.subscriptionStatus === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(250,204,21,0.1)', color: settings.subscriptionStatus === 'active' ? '#22c55e' : '#eab308' }}>
              {settings.subscriptionStatus === 'active' ? 'Active' : settings.subscriptionStatus === 'past_due' ? 'Past Due' : settings.subscriptionStatus === 'trialing' ? 'Trial' : 'Canceled'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <button onClick={switchCycle} type="button" className="digital-wave-btn">
            Switch to {settings.billingCycle === 'monthly' ? 'Yearly' : 'Monthly'} {settings.billingCycle === 'yearly' && <span className="text-emerald-400 ml-1">Save 17%</span>}
          </button>
          {settings.cancelAtPeriodEnd ? (
            <button onClick={cancelSub} type="button" className="digital-wave-btn digital-wave-btn-success">
              Reactivate Subscription
            </button>
          ) : (
            <button onClick={cancelSub} type="button" className="digital-wave-btn digital-wave-btn-danger">
              Cancel Subscription
            </button>
          )}
        </div>
        {settings.cancelAtPeriodEnd && (
          <p className="text-xs rounded-lg px-3 py-2" style={{ background: 'rgba(250,204,21,0.1)', color: '#eab308' }}>
            Your subscription will end on {settings.nextBillingDate}. You can reactivate before then.
          </p>
        )}
      </div>

      {/* Plan Selection */}
      <div>
        <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--crm-text)' }}>Available Plans</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {PLANS.map((p) => {
            const isCurrent = p.id === settings.plan;
            return (
              <button key={p.id} onClick={() => switchPlan(p.id)} type="button"
                className="relative rounded-xl border p-3 text-left transition text-xs"
                style={{ borderColor: isCurrent ? 'var(--crm-text)' : 'var(--crm-border)', background: isCurrent ? 'var(--crm-hover)' : 'transparent' }}
              >
                {p.popular && <span className="absolute -top-2 right-2 rounded-full px-2 py-0.5 text-[9px] font-medium" style={{ background: 'var(--crm-text)', color: 'var(--crm-app-bg)' }}>Popular</span>}
                <p className="font-semibold text-sm mb-1" style={{ color: 'var(--crm-text)' }}>{p.name}</p>
                <p className="text-lg font-bold" style={{ color: 'var(--crm-text)' }}>${p.price}<span className="text-[10px] font-normal" style={{ color: 'var(--crm-text-muted)' }}>/mo</span></p>
                {isCurrent && <Check size={12} className="mt-1" style={{ color: '#22c55e' }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Usage */}
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--crm-border)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--crm-text)' }}>Usage</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'AI Executions', used: settings.usage.aiExecutions, limit: settings.usage.aiLimit, icon: Zap, color: '#8b5cf6' },
            { label: 'Workflow Executions', used: settings.usage.workflowExecutions, limit: settings.usage.workflowLimit, icon: TrendingUp, color: '#3b82f6' },
            { label: 'Storage', used: settings.usage.storageUsed, limit: settings.usage.storageLimit, icon: HardDrive, color: '#22c55e', suffix: 'GB' },
            { label: 'Team Members', used: settings.usage.teamMembers, limit: settings.usage.teamLimit, icon: Users, color: '#f59e0b' },
          ].map((item) => {
            const pct = Math.min(100, Math.round((item.used / item.limit) * 100));
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-lg p-3" style={{ background: 'var(--crm-surface)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={13} style={{ color: item.color }} />
                  <span className="text-xs" style={{ color: 'var(--crm-text-secondary)' }}>{item.label}</span>
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--crm-text)' }}>{item.used}{item.suffix || ''} / {item.limit}{item.suffix || ''}</p>
                <div className="mt-1.5 h-1.5 rounded-full" style={{ background: 'var(--crm-border)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct > 90 ? '#f87171' : item.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--crm-border)' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--crm-text)' }}>Payment Methods</h3>
          <button onClick={() => setShowAddCard(!showAddCard)} type="button" className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs transition" style={{ background: 'var(--crm-surface)', color: 'var(--crm-text-secondary)' }}>
            <Plus size={12} /> Add Card
          </button>
        </div>
        {showAddCard && (
          <div className="rounded-lg border p-3 mb-3 space-y-2" style={{ borderColor: 'var(--crm-border)', background: 'var(--crm-surface)' }}>
            <div className="flex gap-2">
              <SelectDropdown value={cardForm.brand} onChange={(v) => setCardForm((p) => ({ ...p, brand: v }))} options={['Visa', 'Mastercard', 'Amex', 'Discover']} />
              <input value={cardForm.last4} onChange={(e) => setCardForm((p) => ({ ...p, last4: e.target.value.replace(/\D/g, '').slice(0, 4) }))} placeholder="Last 4 digits" className="w-full rounded-lg border px-3 py-2 text-xs outline-none" style={{ background: 'var(--crm-surface)', borderColor: 'var(--crm-border)', color: 'var(--crm-text)' }} />
            </div>
            <div className="flex gap-2">
              <input value={cardForm.expMonth} onChange={(e) => setCardForm((p) => ({ ...p, expMonth: Math.min(12, Math.max(1, Number(e.target.value) || 1)) }))} type="number" min={1} max={12} placeholder="Month" className="w-full rounded-lg border px-3 py-2 text-xs outline-none" style={{ background: 'var(--crm-surface)', borderColor: 'var(--crm-border)', color: 'var(--crm-text)' }} />
              <input value={cardForm.expYear} onChange={(e) => setCardForm((p) => ({ ...p, expYear: Number(e.target.value) || 2027 }))} type="number" min={2026} max={2036} placeholder="Year" className="w-full rounded-lg border px-3 py-2 text-xs outline-none" style={{ background: 'var(--crm-surface)', borderColor: 'var(--crm-border)', color: 'var(--crm-text)' }} />
            </div>
            <button onClick={addCard} type="button" className="digital-wave-btn digital-wave-btn-primary w-full">Add Card</button>
          </div>
        )}
        <div className="space-y-1">
          {settings.paymentMethods.map((pm) => (
            <div key={pm.id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: 'var(--crm-surface)' }}>
              <div className="flex items-center gap-2">
                <CreditCard size={13} style={{ color: 'var(--crm-text-muted)' }} />
                <span className="text-xs" style={{ color: 'var(--crm-text)' }}>{pm.brand} **** {pm.last4}</span>
                {pm.isDefault && <span className="text-[10px] rounded px-1.5 py-0.5" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>Default</span>}
              </div>
              <div className="flex gap-1">
                {!pm.isDefault && <button onClick={() => setDefaultCard(pm.id)} type="button" className="text-[10px] px-2 py-1 rounded hover:bg-white/10" style={{ color: 'var(--crm-text-muted)' }}>Set Default</button>}
                <button onClick={() => removeCard(pm.id)} type="button" className="p-1 rounded hover:bg-red-500/10"><Trash2 size={12} style={{ color: '#f87171' }} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--crm-border)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--crm-text)' }}>Billing History</h3>
        <div className="space-y-1">
          {settings.invoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: 'var(--crm-surface)' }}>
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--crm-text)' }}>{inv.plan} - ${inv.amount}</p>
                  <p className="text-[10px]" style={{ color: 'var(--crm-text-muted)' }}>{inv.date} - {inv.periodStart} to {inv.periodEnd}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] rounded-full px-2 py-0.5 font-medium"
                  style={{ background: inv.status === 'paid' ? 'rgba(34,197,94,0.1)' : inv.status === 'failed' ? 'rgba(248,113,113,0.1)' : 'rgba(250,204,21,0.1)', color: inv.status === 'paid' ? '#22c55e' : inv.status === 'failed' ? '#f87171' : '#eab308' }}>
                  {inv.status}
                </span>
                <button type="button" onClick={() => downloadInvoice(inv)} className="p-1 rounded hover:bg-white/10" title="Download invoice"><Download size={12} style={{ color: 'var(--crm-text-muted)' }} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
