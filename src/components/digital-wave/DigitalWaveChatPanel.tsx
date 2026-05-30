import { Bot, X } from 'lucide-react';

interface DigitalWaveChatPanelProps {
  prompt: string;
  setPrompt: (value: string) => void;
  answer: string;
  onAsk: () => void;
  onClose: () => void;
}

export function DigitalWaveChatPanel({ prompt, setPrompt, answer, onAsk, onClose }: DigitalWaveChatPanelProps) {
  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center bg-black/40 px-4 pt-20 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-xl border border-white/10 bg-[#151515] p-2 text-white shadow-2xl">
        <div className="flex items-center gap-2 border-b border-white/10 px-2 pb-2">
          <Bot size={16} />
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
          />
          <button onClick={onClose} className="rounded-lg bg-white/10 p-1.5"><X size={13} /></button>
        </div>
        <div className="m-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs leading-5 text-white/75">
          {answer || 'Ask Digital Wave AI about your companies, opportunities, or next actions.'}
        </div>
        <button className="m-2 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold hover:bg-blue-500" onClick={onAsk}>
          Ask AI
        </button>
      </div>
    </div>
  );
}
