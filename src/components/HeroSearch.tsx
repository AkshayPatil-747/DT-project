'use client';

import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Loader2, Link2, Clipboard, ArrowRight, ShieldAlert, Check } from 'lucide-react';
import { extractAsin } from '@/lib/asinExtractor';

interface HeroSearchProps {
  onAnalyze: (query: string) => Promise<void>;
  isLoading: boolean;
  currentStep: string;
  initialQuery?: string;
  errorMessage?: string | null;
}

const ANALYSIS_STEPS = [
  'Fetching product & buybox details...',
  'Scanning review timestamps & patterns...',
  'Evaluating seller metrics & fulfillment...',
  'Computing composite trust & risk score...',
];

export const HeroSearch: React.FC<HeroSearchProps> = ({
  onAnalyze,
  isLoading,
  currentStep,
  initialQuery = '',
  errorMessage = null,
}) => {
  const [inputVal, setInputVal] = useState(initialQuery);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const displayError = errorMsg || errorMessage;

  useEffect(() => {
    if (initialQuery) {
      setInputVal(initialQuery);
      setErrorMsg(null);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmed = inputVal.trim();
    if (!trimmed) {
      setErrorMsg('Please enter an Amazon product URL or 10-character ASIN.');
      return;
    }

    onAnalyze(trimmed);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputVal(text);
        setErrorMsg(null);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback if clipboard API restricted
    }
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-10 sm:pt-14 sm:pb-16 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Decorative gradient glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[200px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        {/* Pill Tag */}
        <div className="inline-flex items-center space-x-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300 mb-6 shadow-sm shadow-amber-500/10 animate-fade-in">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Transparent 0–100 Trust & Fraud Risk Scoring</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Don&apos;t Get Fooled By{' '}
          <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
            Fake Amazon Reviews
          </span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
          Paste any Amazon product URL or 10-character ASIN. Our mathematical trust engine instantly audits review bursts, hijacked listings, merchant maturity, and price anomalies before you buy.
        </p>

        {/* Search Input Box */}
        <div className="mt-8">
          <form onSubmit={handleSubmit} className="relative mx-auto max-w-2xl">
            <div className="relative flex flex-col sm:flex-row items-center rounded-2xl border border-slate-700 bg-slate-900/90 p-2 shadow-2xl backdrop-blur-xl focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/30 transition-all">
              <div className="flex items-center w-full px-3 py-2 sm:py-0">
                <Search className="h-5 w-5 text-slate-400 shrink-0 mr-3" />
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => {
                    setInputVal(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  disabled={isLoading}
                  placeholder="Paste Amazon link or ASIN (e.g. B08N5WRWNW)..."
                  className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none disabled:opacity-50"
                />

                {/* Paste button */}
                <button
                  type="button"
                  onClick={handlePaste}
                  disabled={isLoading}
                  className="flex items-center space-x-1 rounded-md px-2 py-1 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mr-2"
                  title="Paste from clipboard"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Clipboard className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">{copied ? 'Pasted' : 'Paste'}</span>
                </button>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading || !inputVal.trim()}
                className="w-full sm:w-auto mt-2 sm:mt-0 flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-md transition-all hover:from-amber-400 hover:to-orange-400 hover:shadow-orange-500/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze Product</span>
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Validation Error Message */}
          {displayError && (
            <div className="mx-auto mt-3 max-w-2xl flex items-center space-x-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs text-rose-300 text-left animate-shake">
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{displayError}</span>
            </div>
          )}

          {/* Animated Step Progress Indicator while Loading */}
          {isLoading && (
            <div className="mx-auto mt-6 max-w-lg rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
                <span className="text-sm font-semibold text-white animate-pulse">
                  {currentStep || 'Analyzing listing security...'}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                <div className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 animate-pulse w-full" />
              </div>
              <div className="grid grid-cols-4 gap-1 mt-3 text-[10px] text-slate-400">
                <span className="text-amber-400 font-medium">1. Extract</span>
                <span className="text-amber-400 font-medium">2. Reviews</span>
                <span className="text-amber-400 font-medium">3. Seller</span>
                <span className="text-amber-400 font-medium">4. Scoring</span>
              </div>
            </div>
          )}

          {/* Supported Format Hint & Sample ASINs */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="flex items-center space-x-1">
              <Link2 className="h-3.5 w-3.5 text-slate-400" />
              <span>Supports amazon.com, amazon.in, amazon.co.uk &amp; direct ASINs:</span>
            </span>
            <button
              onClick={() => {
                setInputVal('B08N5WRWNW');
                setErrorMsg(null);
                onAnalyze('B08N5WRWNW');
              }}
              className="rounded bg-slate-800/80 hover:bg-slate-700 px-2 py-0.5 font-mono text-[11px] text-emerald-300 transition-colors"
            >
              B08N5WRWNW (Safe)
            </button>
            <button
              onClick={() => {
                setInputVal('B09XFAK321');
                setErrorMsg(null);
                onAnalyze('B09XFAK321');
              }}
              className="rounded bg-slate-800/80 hover:bg-slate-700 px-2 py-0.5 font-mono text-[11px] text-rose-300 transition-colors"
            >
              B09XFAK321 (Hijacked)
            </button>
            <button
              onClick={() => {
                setInputVal('B07XYZ9999');
                setErrorMsg(null);
                onAnalyze('B07XYZ9999');
              }}
              className="rounded bg-slate-800/80 hover:bg-slate-700 px-2 py-0.5 font-mono text-[11px] text-amber-300 transition-colors"
            >
              B07XYZ9999 (Spike)
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
