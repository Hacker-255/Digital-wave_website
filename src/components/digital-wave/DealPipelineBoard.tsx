import { ArrowRight, Briefcase, CheckCircle2, DollarSign, Target } from 'lucide-react';
import type { CrmDeal } from '../../constants/data';

const PIPELINE_STAGES = ['Qualification', 'Demo', 'Proposal', 'Negotiation', 'Closed'];

interface DealPipelineBoardProps {
  deals: CrmDeal[];
  onMoveDeal: (dealId: string, stage: string) => void;
  onOpenDeal: (deal: CrmDeal) => void;
}

function money(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export function DealPipelineBoard({ deals, onMoveDeal, onOpenDeal }: DealPipelineBoardProps) {
  const total = deals.reduce((sum, deal) => sum + Number(deal.value || 0), 0);
  const forecast = deals.reduce((sum, deal) => {
    const weight = deal.stage === 'Closed' ? 1 : deal.stage === 'Negotiation' ? 0.8 : deal.stage === 'Proposal' ? 0.6 : deal.stage === 'Demo' ? 0.35 : 0.2;
    return sum + (Number(deal.value || 0) * weight);
  }, 0);

  return (
    <section className="space-y-3">
      <div className="grid gap-2 md:grid-cols-3">
        <Metric icon={Briefcase} label="Open pipeline" value={money(total)} />
        <Metric icon={Target} label="Weighted forecast" value={money(forecast)} />
        <Metric icon={CheckCircle2} label="Active deals" value={String(deals.filter((deal) => deal.stage !== 'Closed').length)} />
      </div>
      <div className="grid gap-3 overflow-x-auto pb-1 lg:grid-cols-5">
        {PIPELINE_STAGES.map((stage) => {
          const stageDeals = deals.filter((deal) => deal.stage === stage);
          const stageValue = stageDeals.reduce((sum, deal) => sum + Number(deal.value || 0), 0);
          return (
            <div key={stage} className="min-w-[220px] rounded-xl border p-3" style={{ borderColor: 'var(--crm-border)', background: 'var(--crm-surface)' }}>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold" style={{ color: 'var(--crm-text)' }}>{stage}</h3>
                  <p className="text-[10px]" style={{ color: 'var(--crm-text-muted)' }}>{stageDeals.length} deals - {money(stageValue)}</p>
                </div>
                <span className="rounded-lg p-1.5" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}><DollarSign size={13} /></span>
              </div>
              <div className="space-y-2">
                {stageDeals.length === 0 ? (
                  <p className="rounded-lg border border-dashed p-3 text-center text-[11px]" style={{ borderColor: 'var(--crm-border)', color: 'var(--crm-text-muted)' }}>No deals</p>
                ) : stageDeals.map((deal) => (
                  <button key={deal.id} onClick={() => onOpenDeal(deal)} type="button" className="w-full rounded-lg border p-3 text-left" style={{ borderColor: 'var(--crm-border-accent)', background: 'var(--crm-card-bg)' }}>
                    <p className="truncate text-xs font-semibold" style={{ color: 'var(--crm-text)' }}>{deal.name}</p>
                    <p className="mt-1 truncate text-[11px]" style={{ color: 'var(--crm-text-muted)' }}>{deal.company}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <b className="text-xs" style={{ color: '#22c55e' }}>{money(Number(deal.value) || 0)}</b>
                      <select
                        value={deal.stage}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) => onMoveDeal(deal.id, event.target.value)}
                        className="rounded-md border px-1.5 py-1 text-[10px] outline-none"
                        style={{ background: 'var(--crm-surface)', borderColor: 'var(--crm-border)', color: 'var(--crm-text)' }}
                      >
                        {PIPELINE_STAGES.map((option) => <option key={option}>{option}</option>)}
                      </select>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Briefcase; label: string; value: string }) {
  return (
    <div className="rounded-xl border p-3" style={{ borderColor: 'var(--crm-border-accent)', background: 'var(--crm-card-bg)' }}>
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-lg p-2" style={{ background: 'rgba(56,189,248,0.12)', color: '#38bdf8' }}><Icon size={14} /></span>
        <ArrowRight size={13} style={{ color: 'var(--crm-text-muted)' }} />
      </div>
      <p className="text-lg font-bold" style={{ color: 'var(--crm-text)' }}>{value}</p>
      <p className="text-[11px]" style={{ color: 'var(--crm-text-muted)' }}>{label}</p>
    </div>
  );
}
