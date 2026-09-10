/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Header } from './components/Header.tsx';
import { InputCard } from './components/InputCard.tsx';
import { ResultCard } from './components/ResultCard.tsx';
import { ChatInterface } from './components/ChatInterface.tsx';
import { CompetitionModal } from './components/CompetitionModal.tsx';
import { ScamAnalysis, ChatMessage } from './types.ts';
import { Shield, Sparkles, AlertCircle, CheckCircle2, Lock, ArrowDown } from 'lucide-react';

export default function App() {
  const [inputMessage, setInputMessage] = useState('');
  const [analysis, setAnalysis] = useState<ScamAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content:
        "👋 Welcome to ScamSense AI! You can paste any suspicious SMS, WhatsApp message, email, or online offer in the box above to get an instant AI risk score, or ask me any digital safety questions directly.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Competition Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Ref to scroll to results or chat
  const resultRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    if (!inputMessage.trim()) {
      setErrorMessage('Please enter or paste a message to analyze.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data: ScamAnalysis = await response.json();
      setAnalysis(data);

      // Add fresh context message to chat tailored to this analysis
      const analysisChat: ChatMessage = {
        id: `analysis-${Date.now()}`,
        role: 'assistant',
        content: `🎯 Analysis complete for this ${data.category} (Risk Score: ${data.risk_score}/100 - ${data.risk_level}). You can ask me follow-up questions below such as "Why is this suspicious?", "What should I do now?", or "Which part is dangerous?"`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory((prev) => [...prev, analysisChat]);

      // Smooth scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setErrorMessage(
        err.message || 'Unable to complete AI analysis. Please check your internet connection or try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (question: string) => {
    if (!question.trim() || isChatLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          analysis,
          chatHistory,
          question: question.trim(),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to get answer');
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatHistory((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessageItem: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${err.message || 'Could not connect to ScamSense advisor. Please try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory((prev) => [...prev, errorMessageItem]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setInputMessage('');
    setErrorMessage(null);
    setChatHistory([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content:
          "👋 Ready for your next message! Paste any text in the box above to get an instant AI risk score, or ask me digital safety questions directly.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#070b09] text-zinc-100 font-sans flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navigation / App Header */}
      <Header
        onOpenInnovationModal={() => setIsModalOpen(true)}
        onScrollToChat={() => chatRef.current?.scrollIntoView({ behavior: 'smooth' })}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-7">
        {/* Core Mission & Value Props */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0c1310] border border-emerald-950/70 text-zinc-300">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white">Contextual Intelligence</div>
              <div className="text-zinc-400 text-[11px]">Evaluates intent, pressure & manipulation</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0c1310] border border-emerald-950/70 text-zinc-300">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white">Actionable Next Steps</div>
              <div className="text-zinc-400 text-[11px]">Clear protocols instead of just yes/no</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0c1310] border border-emerald-950/70 text-zinc-300">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white">Zero Storage Privacy</div>
              <div className="text-zinc-400 text-[11px]">Messages are never stored permanently</div>
            </div>
          </div>
        </section>

        {/* Input Card */}
        <section>
          <InputCard
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            errorMessage={errorMessage}
            onClearError={() => setErrorMessage(null)}
          />
        </section>

        {/* Loading Indicator when Analyzing */}
        {isLoading && (
          <div
            id="loading-indicator"
            className="w-full bg-[#0c1310] border border-emerald-700/40 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-3 animate-pulse shadow-lg shadow-emerald-950/20"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin flex items-center justify-center" />
              <Shield className="w-5 h-5 text-emerald-400 absolute inset-0 m-auto" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                🧠 Gemini is analyzing...
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-md">
                Deconstructing psychological coercion tactics, spoofed domains, sender credibility cues, and sensitive credential requests...
              </p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {analysis && (
          <div ref={resultRef} className="pt-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <section>
              <ResultCard analysis={analysis} onReset={handleReset} />
            </section>
          </div>
        )}

        {/* Conversational AI Chatbot Section - Always accessible */}
        <section id="scamsense-chatbot-section" ref={chatRef} className="pt-1">
          <ChatInterface
            originalMessage={inputMessage}
            analysis={analysis}
            chatHistory={chatHistory}
            onSendMessage={handleSendMessage}
            isChatLoading={isChatLoading}
          />
        </section>

        {/* Competition Showcase Callout Banner */}
        <section className="bg-gradient-to-r from-emerald-950/30 via-[#0c1511] to-emerald-950/30 border border-emerald-900/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Innovation Layer: How Gemini Empowers ScamSense</span>
            </div>
            <p className="text-zinc-400 leading-relaxed text-[11px] sm:text-xs max-w-2xl">
              &ldquo;ScamSense AI converts Gemini&apos;s contextual understanding into an explainable digital-safety decision layer: it identifies contextual red flags, provides an AI-assisted risk assessment, explains why the message is suspicious, and converts the analysis into practical safety actions.&rdquo;
            </p>
          </div>
          <button
            type="button"
            id="btn-view-architecture"
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/50 font-medium shrink-0 transition-colors"
          >
            View Architecture
          </button>
        </section>

        {/* Mandatory Disclaimer */}
        <footer className="pt-4 pb-8 border-t border-zinc-900 text-center space-y-2">
          <p className="text-xs text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            🛡️ <strong className="text-zinc-300">Disclaimer:</strong> ScamSense AI provides an AI-assisted risk assessment and is not a definitive legal, financial, or cybersecurity determination. Always confirm directly through verified official channels and never share OTPs, passwords, or banking credentials with unverified contacts.
          </p>
          <div className="text-[11px] text-zinc-400 font-mono">
            ScamSense AI • Built with Google Gemini • Digital Safety Innovation
          </div>
        </footer>
      </main>

      {/* Architecture / Competition Innovation Modal */}
      <CompetitionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
