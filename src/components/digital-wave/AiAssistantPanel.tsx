import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Lightbulb, TrendingUp, Users, Briefcase, Clock, RefreshCw } from 'lucide-react';
import type { CompanyTableRow } from '../../constants/data';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

interface AiAssistantPanelProps {
  companies: CompanyTableRow[];
  selectedIds: string[];
}

const quickPrompts = [
  { icon: Lightbulb, label: 'Recommendations', query: 'What are your top recommendations to improve my CRM?' },
  { icon: TrendingUp, label: 'Analytics', query: 'Give me a CRM analytics overview' },
  { icon: Users, label: 'Summarize', query: 'Summarize all my companies' },
  { icon: Briefcase, label: 'Compare', query: 'Compare NovaGrid Systems and Blue Harbor Logistics' },
  { icon: Clock, label: 'Recent', query: 'What happened recently in my CRM?' },
];

async function askDigitalWaveAi(prompt: string, companies: CompanyTableRow[], selectedIds: string[]) {
  const selectedCompanies = companies.filter((company) => selectedIds.includes(company.id));
  const response = await fetch('/api/ai/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      context: {
        company: 'Digital Wave',
        selectedIds,
        companies: companies.slice(0, 25),
        selectedCompanies,
      },
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'AI request failed. Check OPENAI_API_KEY on the server.');
  }

  if (!data.answer) {
    throw new Error('The AI service returned an empty response.');
  }

  return String(data.answer);
}

export function AiAssistantPanel({ companies, selectedIds }: AiAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, streaming]);

  const handleSubmit = async (query: string) => {
    const q = query.trim();
    if (!q || loading) return;
    setInput('');
    const userMsg: Message = { id: Date.now(), role: 'user', content: q };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setStreaming('');

    let answer = '';
    try {
      answer = await askDigitalWaveAi(q, companies, selectedIds);
    } catch (error) {
      answer = error instanceof Error ? error.message : 'AI request failed. Check the server configuration.';
    }

    const words = answer.split(' ');
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < words.length) {
        setStreaming((prev) => prev + (prev ? ' ' : '') + words[idx]);
        idx++;
      } else {
        clearInterval(interval);
        setStreaming('');
        setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', content: answer }]);
        setLoading(false);
      }
    }, 30);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto min-h-0 space-y-3 p-4">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl mb-3" style={{ background: 'var(--crm-surface)' }}>
              <Sparkles size={18} style={{ color: 'var(--crm-text-secondary)' }} />
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--crm-text)' }}>Ask me anything about your CRM</p>
            <p className="text-xs mb-6" style={{ color: 'var(--crm-text-muted)' }}>I can analyze data, explain trends, and provide insights</p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              {quickPrompts.map((p) => {
                const PIcon = p.icon;
                return (
                  <button
                    key={p.label}
                    onClick={() => handleSubmit(p.query)}
                    type="button"
                    className="flex items-center gap-2 rounded-lg border p-2.5 text-left text-xs transition hover:opacity-80"
                    style={{ borderColor: 'var(--crm-border)', background: 'var(--crm-surface)' }}
                  >
                    <PIcon size={13} style={{ color: 'var(--crm-text-muted)' }} />
                    <span style={{ color: 'var(--crm-text-secondary)' }}>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--crm-surface)' }}>
                <Bot size={13} style={{ color: 'var(--crm-text-secondary)' }} />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'
              }`}
              style={{
                background: msg.role === 'user' ? 'var(--crm-text)' : 'var(--crm-surface)',
                color: msg.role === 'user' ? 'var(--crm-app-bg)' : 'var(--crm-text)',
              }}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--crm-text)' }}>
                <User size={13} style={{ color: 'var(--crm-app-bg)' }} />
              </div>
            )}
          </div>
        ))}
        {loading && streaming && (
          <div className="flex gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--crm-surface)' }}>
              <Bot size={13} style={{ color: 'var(--crm-text-secondary)' }} />
            </div>
            <div className="max-w-[75%] rounded-xl rounded-tl-sm px-3.5 py-2.5 text-xs leading-relaxed" style={{ background: 'var(--crm-surface)', color: 'var(--crm-text)' }}>
              {streaming}
              <span className="inline-block w-1.5 h-4 ml-0.5 animate-pulse" style={{ background: 'var(--crm-text)' }} />
            </div>
          </div>
        )}
        {loading && !streaming && (
          <div className="flex gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--crm-surface)' }}>
              <Bot size={13} style={{ color: 'var(--crm-text-secondary)' }} />
            </div>
            <div className="flex items-center gap-1.5 rounded-xl rounded-tl-sm px-3.5 py-2.5" style={{ background: 'var(--crm-surface)' }}>
              <RefreshCw size={12} className="animate-spin" style={{ color: 'var(--crm-text-muted)' }} />
              <span className="text-xs" style={{ color: 'var(--crm-text-muted)' }}>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t p-3" style={{ borderColor: 'var(--crm-border)' }}>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(input); } }}
            placeholder="Ask a question about your CRM..."
            className="flex-1 rounded-lg border px-3 py-2 text-xs outline-none transition"
            style={{ background: 'var(--crm-surface)', borderColor: 'var(--crm-border)', color: 'var(--crm-text)' }}
          />
          <button
            onClick={() => handleSubmit(input)}
            disabled={!input.trim() || loading}
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg transition disabled:opacity-30"
            style={{ background: 'var(--crm-text)' }}
          >
            <Send size={13} style={{ color: 'var(--crm-app-bg)' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
