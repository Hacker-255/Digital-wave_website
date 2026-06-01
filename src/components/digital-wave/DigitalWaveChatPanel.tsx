import { Bot, Loader2, Send, X } from 'lucide-react';

interface DigitalWaveChatPanelProps {
  prompt: string;
  setPrompt: (value: string) => void;
  answer: string;
  loading?: boolean;
  onAsk: () => void;
  onClose: () => void;
}

export function DigitalWaveChatPanel({ prompt, setPrompt, answer, loading = false, onAsk, onClose }: DigitalWaveChatPanelProps) {
  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center bg-slate-950/45 px-4 pt-20 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border p-3 shadow-2xl" style={{ background: 'var(--crm-card-bg)', borderColor: 'var(--crm-border-accent)', color: 'var(--crm-text)' }}>
        <div className="flex items-center gap-3 border-b px-2 pb-3" style={{ borderColor: 'var(--crm-border)' }}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'var(--crm-cta-bg)', color: '#fff' }}>
            <Bot size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Digital Wave AI Chat</p>
            <p className="text-xs" style={{ color: 'var(--crm-text-muted)' }}>Ask Gemini about your CRM data and next actions.</p>
          </div>
          <button onClick={onClose} className="rounded-xl border p-2" style={{ borderColor: 'var(--crm-border)', background: 'var(--crm-surface)' }} type="button" aria-label="Close AI chat">
            <X size={14} />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: 'var(--crm-border)', background: 'var(--crm-surface)' }}>
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                onAsk();
              }
            }}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--crm-text)' }}
            placeholder="Ask a question about your CRM..."
          />
          <button
            className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-white disabled:opacity-50"
            onClick={onAsk}
            disabled={loading || !prompt.trim()}
            style={{ background: 'var(--crm-cta-bg)' }}
            type="button"
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
            Ask
          </button>
        </div>
        <div className="mt-3 min-h-[180px] rounded-xl border p-4 text-sm leading-6" style={{ borderColor: 'var(--crm-border)', background: 'var(--crm-surface)', color: 'var(--crm-text-secondary)' }}>
          {loading ? (
            <span className="inline-flex items-center gap-2"><Loader2 className="animate-spin" size={14} /> Thinking with Gemini...</span>
          ) : (
            answer || 'Ask Digital Wave AI about your companies, opportunities, leads, tasks, or next actions.'
          )}
        </div>
      </div>
    </div>
  );
}
