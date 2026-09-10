import React from 'react';
import { Shield, Sparkles, Info, MessageSquare } from 'lucide-react';

interface HeaderProps {
  onOpenInnovationModal: () => void;
  onScrollToChat?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenInnovationModal, onScrollToChat }) => {
  return (
    <header className="w-full border-b border-emerald-950/60 bg-[#070b09]/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] shrink-0">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>🛡️ ScamSense AI</span>
              </h1>
              <span className="hidden xs:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/70 text-emerald-400 border border-emerald-800/40">
                <Sparkles className="w-3 h-3 text-emerald-400" /> Gemini Powered
              </span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-200/70 mt-0.5">
              Understand suspicious messages before you act.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center">
          {onScrollToChat && (
            <button
              type="button"
              id="header-btn-ask-chatbot"
              onClick={onScrollToChat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-700/50 transition-colors shadow-sm"
              title="Jump directly to the ScamSense AI Chatbot"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>💬 Ask Chatbot</span>
            </button>
          )}

          <button
            type="button"
            id="btn-innovation-layer"
            onClick={onOpenInnovationModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-700/40 transition-colors"
            title="How Gemini contextual intelligence powers ScamSense"
          >
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            <span>Explainable AI Layer</span>
          </button>

          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-400 bg-zinc-900/60 border border-zinc-800 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Context Engine Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
};
