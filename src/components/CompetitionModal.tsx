import React from 'react';
import { X, Sparkles, CheckCircle, ShieldAlert, Cpu, ArrowRight, Brain, Lock } from 'lucide-react';

interface CompetitionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompetitionModal: React.FC<CompetitionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="competition-modal-dialog"
        className="bg-[#0b120f] border border-emerald-800/60 rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto text-zinc-200"
      >
        <button
          type="button"
          id="btn-close-modal"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 text-emerald-400 mb-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-mono uppercase tracking-wider font-semibold">
            AI Innovation Competition Showcase
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          How ScamSense AI Powers Digital Safety with Gemini
        </h2>

        {/* Core Innovation Quote */}
        <div className="mt-4 p-4 rounded-xl bg-emerald-950/40 border border-emerald-700/50 text-emerald-200 text-xs sm:text-sm leading-relaxed">
          <p className="font-semibold text-emerald-300 mb-1">Core Innovation Statement:</p>
          <blockquote className="italic">
            &ldquo;ScamSense AI converts Gemini&apos;s contextual understanding into an explainable digital-safety decision layer: it identifies contextual red flags, provides an AI-assisted risk assessment, explains why the message is suspicious, and converts the analysis into practical safety actions.&rdquo;
          </blockquote>
        </div>

        {/* Comparison: Traditional vs Gemini Explainable Layer */}
        <div className="mt-6 space-y-3">
          <h3 className="text-xs uppercase font-mono tracking-wider text-zinc-400">
            Why Generic Keyword Filters Fail vs. Gemini Contextual Intelligence
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/40 space-y-2">
              <div className="font-bold text-red-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> Traditional Keyword Filter
              </div>
              <ul className="space-y-1.5 text-zinc-400">
                <li className="flex items-start gap-1.5">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Flags words like &quot;bank&quot; or &quot;urgent&quot; blindly, causing false alarms on real alerts.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Misses novel social engineering, disguised job offers, and multi-stage Telegram funnel scams.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Binary &quot;scam/not scam&quot; output with zero education or actionable protection steps.</span>
                </li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Brain className="w-4 h-4" /> ScamSense + Gemini Engine
              </div>
              <ul className="space-y-1.5 text-zinc-300">
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Understands psychological coercion (urgency, false authority, artificial scarcity, fear).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Accurately recognizes legitimate family updates and official notifications without panic.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Provides structured, transparent explanations and answers real-time follow-up questions.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 4-Stage Decision Pipeline */}
        <div className="mt-6 space-y-2.5">
          <h3 className="text-xs uppercase font-mono tracking-wider text-zinc-400">
            Explainable Digital-Safety Decision Pipeline
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
              <div className="font-mono text-[10px] text-emerald-400 font-semibold">STAGE 1</div>
              <div className="font-bold text-white mt-0.5">Intent Ingestion</div>
              <div className="text-[10px] text-zinc-400 mt-1">Contextual language parsing via Gemini</div>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
              <div className="font-mono text-[10px] text-emerald-400 font-semibold">STAGE 2</div>
              <div className="font-bold text-white mt-0.5">Pattern Detection</div>
              <div className="text-[10px] text-zinc-400 mt-1">Red flag extraction & manipulative cues</div>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
              <div className="font-mono text-[10px] text-emerald-400 font-semibold">STAGE 3</div>
              <div className="font-bold text-white mt-0.5">Risk Calibrator</div>
              <div className="text-[10px] text-zinc-400 mt-1">AI-assisted score (0-100) & risk tier</div>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
              <div className="font-mono text-[10px] text-emerald-400 font-semibold">STAGE 4</div>
              <div className="font-bold text-white mt-0.5">Actionable Shield</div>
              <div className="text-[10px] text-zinc-400 mt-1">Protective protocols & interactive Q&A</div>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="mt-5 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-2.5 text-xs text-zinc-400">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Zero Persistent Message Storage: User-submitted messages are processed in-memory during the session and never stored permanently in a database.
          </span>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-colors"
          >
            Got it, return to demo
          </button>
        </div>
      </div>
    </div>
  );
};
