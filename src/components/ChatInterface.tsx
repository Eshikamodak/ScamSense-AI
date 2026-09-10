import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2, Sparkles, Bot, User, ShieldCheck } from 'lucide-react';
import { ChatMessage, ScamAnalysis } from '../types.ts';

interface ChatInterfaceProps {
  originalMessage: string;
  analysis: ScamAnalysis | null;
  chatHistory: ChatMessage[];
  onSendMessage: (question: string) => Promise<void>;
  isChatLoading: boolean;
}

const POST_ANALYSIS_PROMPTS = [
  'Why is this suspicious?',
  'What should I do now?',
  'Which part of the message is dangerous?',
  'How do I verify with the real company?',
];

const PRE_ANALYSIS_PROMPTS = [
  'How do I recognize a fake job scam?',
  'Why do scammers urgently demand OTPs?',
  'What should I do if I clicked a suspicious link?',
  'What is bank KYC smishing?',
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  originalMessage,
  analysis,
  chatHistory,
  onSendMessage,
  isChatLoading,
}) => {
  const [inputQuestion, setInputQuestion] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activePrompts = analysis ? POST_ANALYSIS_PROMPTS : PRE_ANALYSIS_PROMPTS;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isChatLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim() || isChatLoading) return;
    const q = inputQuestion.trim();
    setInputQuestion('');
    await onSendMessage(q);
  };

  const handleQuickPrompt = async (prompt: string) => {
    if (isChatLoading) return;
    await onSendMessage(prompt);
  };

  return (
    <div
      id="chat-interface-container"
      className="w-full bg-[#0c1310] border border-emerald-900/40 rounded-2xl p-4 sm:p-6 shadow-xl shadow-black/40 space-y-4"
    >
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/70 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <span>💬 Ask ScamSense</span>
            </h3>
            <p className="text-xs text-zinc-400">
              {analysis
                ? `Ask follow-up questions about this ${analysis.category} & safety next-steps`
                : 'Ask our cybersecurity AI advisor anything about scams, suspicious links, or online safety'}
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-emerald-400/80 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full hidden sm:inline-block">
          {analysis ? `Context: ${analysis.category} (${analysis.risk_score}/100)` : 'Advisor Ready'}
        </span>
      </div>

      {/* Suggested Quick Question Chips */}
      <div>
        <div className="text-xs text-zinc-400 mb-2 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>{analysis ? 'Suggested follow-up questions:' : 'Popular digital safety topics:'}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {activePrompts.map((prompt, idx) => (
            <button
              key={idx}
              id={`quick-prompt-${idx}`}
              type="button"
              disabled={isChatLoading}
              onClick={() => handleQuickPrompt(prompt)}
              className="text-xs px-3 py-1.5 rounded-lg bg-zinc-900/80 text-zinc-300 hover:text-emerald-300 hover:bg-emerald-950/40 border border-zinc-800 hover:border-emerald-700/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Scroll Container */}
      <div
        id="chat-messages-container"
        className="h-64 sm:h-72 overflow-y-auto space-y-3.5 pr-1.5 rounded-xl bg-[#080d0b] border border-zinc-800/80 p-3 sm:p-4 text-xs sm:text-sm"
      >
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-zinc-500">
            <Bot className="w-8 h-8 text-emerald-500/40 mb-2" />
            <p className="font-medium text-zinc-400 text-xs sm:text-sm">
              {analysis ? `Have questions about this ${analysis.category}?` : 'Ask ScamSense AI a Question'}
            </p>
            <p className="text-[11px] text-zinc-500 mt-1 max-w-sm">
              {analysis
                ? 'Click any suggested prompt above or type your own question below. ScamSense uses Gemini to evaluate the exact wording and risk factors.'
                : 'You can ask about identifying fraud, how to protect personal data, or paste a suspicious message above to analyze it.'}
            </p>
          </div>
        ) : (
          chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-xl p-3 leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-emerald-600/90 text-white font-medium rounded-tr-none'
                    : 'bg-zinc-900/90 text-zinc-200 border border-zinc-800 rounded-tl-none font-sans'
                }`}
              >
                {msg.content}
                <div
                  className={`text-[10px] mt-1 font-mono text-right ${
                    msg.role === 'user' ? 'text-emerald-200/70' : 'text-zinc-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading Bubble */}
        {isChatLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 text-zinc-300 text-xs flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>ScamSense is analyzing your question...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Question Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          id="chat-question-input"
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          disabled={isChatLoading}
          placeholder="Ask a question about this message (e.g. 'Can clicking this link hack my phone?')..."
          className="flex-1 bg-[#080d0b] text-zinc-100 placeholder:text-zinc-500 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-zinc-800 focus:border-emerald-500/80 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-colors disabled:opacity-60"
        />

        <button
          id="btn-send-chat"
          type="submit"
          disabled={isChatLoading || !inputQuestion.trim()}
          className="px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-zinc-950 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
        >
          {isChatLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Safety Reminder */}
      <div className="flex items-center gap-2 text-[11px] text-zinc-500 pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70 shrink-0" />
        <span>ScamSense will never request your passwords, OTP codes, or banking PINs.</span>
      </div>
    </div>
  );
};
