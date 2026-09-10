import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  Brain,
  Flag,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ScamAnalysis, RiskLevel } from '../types.ts';

interface ResultCardProps {
  analysis: ScamAnalysis;
  onReset: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ analysis, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [showDeepAnalysis, setShowDeepAnalysis] = useState(false);

  const getRiskVisuals = (level: RiskLevel, score: number) => {
    switch (level) {
      case 'HIGH':
        return {
          icon: ShieldAlert,
          title: '🚨 HIGH RISK',
          badgeClass: 'bg-red-950/70 border-red-600/70 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]',
          scoreColor: 'text-red-400',
          meterFill: 'bg-red-500',
          cardGlow: 'border-red-900/60 shadow-red-950/20',
          tagText: 'Critical Danger Detected',
        };
      case 'MEDIUM':
        return {
          icon: AlertTriangle,
          title: '⚠️ MEDIUM RISK',
          badgeClass: 'bg-amber-950/70 border-amber-600/70 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
          scoreColor: 'text-amber-400',
          meterFill: 'bg-amber-500',
          cardGlow: 'border-amber-900/60 shadow-amber-950/20',
          tagText: 'Exercise Extreme Caution',
        };
      case 'UNCERTAIN':
        return {
          icon: HelpCircle,
          title: '❓ UNCERTAIN',
          badgeClass: 'bg-indigo-950/70 border-indigo-600/70 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]',
          scoreColor: 'text-indigo-400',
          meterFill: 'bg-indigo-500',
          cardGlow: 'border-indigo-900/60 shadow-indigo-950/20',
          tagText: 'Insufficient Context to Verify',
        };
      case 'LOW':
      default:
        return {
          icon: ShieldCheck,
          title: '🛡️ LOW RISK',
          badgeClass: 'bg-emerald-950/70 border-emerald-600/70 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
          scoreColor: 'text-emerald-400',
          meterFill: 'bg-emerald-500',
          cardGlow: 'border-emerald-900/60 shadow-emerald-950/20',
          tagText: 'Likely Safe / Legitimate',
        };
    }
  };

  const visuals = getRiskVisuals(analysis.risk_level, analysis.risk_score);
  const VisualIcon = visuals.icon;

  const handleCopyReport = () => {
    const report = `ScamSense AI Digital Safety Report
----------------------------------------
Risk Level: ${analysis.risk_level} (${analysis.risk_score}/100)
Category: ${analysis.category}
Summary: ${analysis.summary}

Red Flags:
${analysis.red_flags.map((rf) => `- ${rf}`).join('\n')}

Recommended Actions:
${analysis.recommended_actions.map((ra) => `- ${ra}`).join('\n')}

Sensitive Information to Protect:
${analysis.protect_information.join(', ')}

Disclaimer: ScamSense AI provides an AI-assisted risk assessment and is not a definitive legal or financial determination.`;

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="result-card-container"
      className={`w-full bg-[#0c1310] border ${visuals.cardGlow} rounded-2xl p-4 sm:p-7 shadow-2xl transition-all duration-300 relative`}
    >
      {/* Top Banner with High Prominence */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border flex items-center justify-center shrink-0 ${visuals.badgeClass}`}
          >
            <VisualIcon className="w-8 h-8 sm:w-9 sm:h-9" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                id="result-risk-level-badge"
                className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold tracking-wide border ${visuals.badgeClass}`}
              >
                {visuals.title}
              </span>
              <span
                id="result-category-badge"
                className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900 border border-zinc-700 text-zinc-200"
              >
                {analysis.category}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-medium">
              {visuals.tagText}
            </p>
          </div>
        </div>

        {/* Big Risk Score Gauge */}
        <div className="flex items-center gap-4 bg-zinc-950/80 border border-zinc-800/90 rounded-xl px-4 py-3 self-stretch md:self-auto justify-between md:justify-end">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              AI Risk Score
            </div>
            <div className="flex items-baseline gap-1">
              <span
                id="result-risk-score"
                className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${visuals.scoreColor}`}
              >
                {analysis.risk_score}
              </span>
              <span className="text-sm font-mono text-zinc-500">/100</span>
            </div>
          </div>

          {/* Progress Bar Visualizer */}
          <div className="w-24 sm:w-28 flex flex-col gap-1.5">
            <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden p-[1px]">
              <div
                className={`h-full rounded-full transition-all duration-700 ${visuals.meterFill}`}
                style={{ width: `${Math.min(100, Math.max(5, analysis.risk_score))}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-zinc-400">
              <span>0 LOW</span>
              <span>100 HIGH</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Main Sections */}
      <div className="mt-6 space-y-6">
        {/* 🧠 AI Explanation Section */}
        <div id="section-ai-explanation" className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-emerald-400" />
              <span>🧠 AI Explanation</span>
            </h3>
            {analysis.context_analysis && (
              <button
                type="button"
                id="btn-toggle-deep-context"
                onClick={() => setShowDeepAnalysis(!showDeepAnalysis)}
                className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 transition-colors"
              >
                <span>{showDeepAnalysis ? 'Hide deep reasoning' : 'View contextual breakdown'}</span>
                {showDeepAnalysis ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
          <div className="bg-[#080d0b] border border-zinc-800/80 rounded-xl p-4 text-zinc-200 text-sm sm:text-base leading-relaxed">
            <p>{analysis.summary}</p>

            {showDeepAnalysis && analysis.context_analysis && (
              <div className="mt-3 pt-3 border-t border-zinc-800/80 text-xs text-emerald-200/90 leading-relaxed font-sans bg-emerald-950/20 p-3 rounded-lg border border-emerald-900/30">
                <div className="font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Contextual & Psychological Deconstruction:
                </div>
                {analysis.context_analysis}
              </div>
            )}
          </div>
        </div>

        {/* 🚩 Red Flags Detected */}
        <div id="section-red-flags" className="space-y-2">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Flag className="w-4 h-4 text-red-400" />
            <span>🚩 Red Flags Detected ({analysis.red_flags.length})</span>
          </h3>
          {analysis.red_flags.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {analysis.red_flags.map((flag, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-red-950/20 border border-red-900/40 text-xs sm:text-sm text-red-200"
                >
                  <span className="w-5 h-5 rounded-full bg-red-900/50 border border-red-700/50 flex items-center justify-center text-[11px] font-bold text-red-300 shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-snug">{flag}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-xs sm:text-sm text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>No critical malicious indicators or manipulative patterns detected.</span>
            </div>
          )}
        </div>

        {/* 🛡️ Recommended Actions */}
        <div id="section-recommended-actions" className="space-y-2">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>🛡️ Recommended Actions</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {analysis.recommended_actions.map((action, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-xs sm:text-sm text-emerald-100"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 🔐 Protect This Information */}
        <div id="section-protect-information" className="space-y-2">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>🔐 Protect This Information (Never Share)</span>
          </h3>
          {analysis.protect_information.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {analysis.protect_information.map((info, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-950/40 border border-amber-600/50 text-amber-200"
                >
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>{info}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-zinc-400 bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800">
              No sensitive credential requests found in this text.
            </div>
          )}
        </div>
      </div>

      {/* Footer Controls: Copy Report & Reset */}
      <div className="mt-7 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-copy-safety-report"
            onClick={handleCopyReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Report Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copy Safety Summary</span>
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          id="btn-analyze-another"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Analyze Another Message</span>
        </button>
      </div>
    </div>
  );
};
