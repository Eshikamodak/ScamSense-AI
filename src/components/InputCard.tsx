import React, { useState } from 'react';
import { Search, Loader2, Sparkles, AlertCircle, Trash2, Clipboard } from 'lucide-react';
import { DEMO_EXAMPLES } from '../data/demoExamples.ts';

interface InputCardProps {
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  errorMessage: string | null;
  onClearError: () => void;
}

export const InputCard: React.FC<InputCardProps> = ({
  inputMessage,
  setInputMessage,
  onAnalyze,
  isLoading,
  errorMessage,
  onClearError,
}) => {
  const [activeDemoId, setActiveDemoId] = useState<string | null>(null);

  const handleSelectDemo = (exampleId: string, message: string) => {
    setActiveDemoId(exampleId);
    setInputMessage(message);
    onClearError();
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputMessage(text);
        setActiveDemoId(null);
        onClearError();
      }
    } catch {
      // Clipboard access might be blocked in iframe; user can paste manually
    }
  };

  const handleClear = () => {
    setInputMessage('');
    setActiveDemoId(null);
    onClearError();
  };

  return (
    <div
      id="input-card-container"
      className="w-full bg-[#0c1310] border border-emerald-900/40 rounded-2xl p-4 sm:p-6 shadow-xl shadow-black/40 relative overflow-hidden"
    >
      {/* Subtle top accent gradient */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-600/30 via-emerald-400/80 to-emerald-600/30" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
            Analyze a suspicious message
          </h2>
        </div>
        <span className="text-xs text-emerald-300/60 font-mono">
          SMS • WhatsApp • Email • Web Offers
        </span>
      </div>

      {/* Demo buttons selection */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
          <span className="font-medium text-emerald-400/80 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Quick Demo Scenarios:
          </span>
          <span className="text-[11px] text-zinc-500 hidden sm:inline">Click to test instant sample</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {DEMO_EXAMPLES.map((demo) => {
            const isSelected = activeDemoId === demo.id && inputMessage === demo.message;
            return (
              <button
                key={demo.id}
                id={`demo-btn-${demo.id}`}
                type="button"
                disabled={isLoading}
                onClick={() => handleSelectDemo(demo.id, demo.message)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : 'bg-zinc-900/80 text-zinc-300 hover:text-white border-zinc-800 hover:border-emerald-800/60 hover:bg-zinc-800/80'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {demo.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Large Textarea input */}
      <div className="relative group">
        <textarea
          id="message-input-textarea"
          value={inputMessage}
          onChange={(e) => {
            setInputMessage(e.target.value);
            if (activeDemoId) setActiveDemoId(null);
            if (errorMessage) onClearError();
          }}
          disabled={isLoading}
          rows={5}
          placeholder="Paste an SMS, WhatsApp message, email, job offer, payment request or suspicious online message..."
          className="w-full bg-[#080d0b] text-zinc-100 placeholder:text-zinc-500 text-sm sm:text-base rounded-xl p-3.5 sm:p-4 border border-emerald-950/80 focus:border-emerald-500/80 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all font-sans resize-y leading-relaxed disabled:opacity-60"
        />

        {/* Textarea quick actions */}
        <div className="flex items-center justify-between mt-2 px-1 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            {inputMessage && (
              <button
                type="button"
                id="btn-clear-input"
                onClick={handleClear}
                disabled={isLoading}
                className="inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Clear input"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
            <button
              type="button"
              id="btn-paste-input"
              onClick={handlePaste}
              disabled={isLoading}
              className="inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors"
              title="Paste from clipboard"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Paste</span>
            </button>
          </div>
          <span className="font-mono text-[11px] text-zinc-500">
            {inputMessage.length} characters
          </span>
        </div>
      </div>

      {/* Error Message display */}
      {errorMessage && (
        <div
          id="input-error-banner"
          className="mt-3.5 p-3 rounded-xl bg-red-950/40 border border-red-800/50 flex items-start gap-2.5 text-xs text-red-200"
        >
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-medium text-red-300">Notice: </span>
            {errorMessage}
          </div>
        </div>
      )}

      {/* Primary Action Button */}
      <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400/80"></span>
          Deep contextual analysis: detects psychological coercion, urgency & spoofing.
        </p>

        <button
          id="btn-analyze-with-ai"
          type="button"
          disabled={isLoading || !inputMessage.trim()}
          onClick={onAnalyze}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm sm:text-base text-zinc-950 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 transition-all duration-150 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
              <span>🧠 Gemini is analyzing...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4 text-zinc-950" />
              <span>🔍 Analyze with AI</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
