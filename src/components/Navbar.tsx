'use client';

import React from 'react';
import { ShieldCheck, History, Info, Sparkles, CheckCircle2, AlertTriangle, AlertOctagon, Terminal } from 'lucide-react';

interface NavbarProps {
  onSelectDemo: (asin: string) => void;
  onOpenHistory: () => void;
  onOpenFormula: () => void;
  historyCount: number;
  isLiveApi: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSelectDemo,
  onOpenHistory,
  onOpenFormula,
  historyCount,
  isLiveApi,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 text-slate-950 shadow-lg shadow-orange-500/20">
            <ShieldCheck className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-white">
                Amazon Trust<span className="text-amber-400">Checker</span>
              </span>
              <span className="hidden rounded-full border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-[10px] font-semibold text-slate-300 sm:inline-block">
                v1.0 Pro
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Listing Integrity & Fraud Detection Engine
            </p>
          </div>
        </div>

        {/* Quick Demo Scenarios (Desktop) */}
        <div className="hidden lg:flex items-center space-x-2 rounded-xl border border-slate-800 bg-slate-900/60 p-1">
          <span className="px-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Quick Demos:
          </span>
          <button
            onClick={() => onSelectDemo('B08N5WRWNW')}
            className="group flex items-center space-x-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-300 transition-all hover:bg-emerald-500/10 hover:text-emerald-200 border border-transparent hover:border-emerald-500/30"
            title="ASIN: B08N5WRWNW - Genuine Sony Headphones (Score: 88)"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Safe (88)</span>
          </button>
          <button
            onClick={() => onSelectDemo('B09XFAK321')}
            className="group flex items-center space-x-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-300 transition-all hover:bg-rose-500/10 hover:text-rose-200 border border-transparent hover:border-rose-500/30"
            title="ASIN: B09XFAK321 - Hijacked Listing with Bedding Reviews (Score: 42)"
          >
            <AlertOctagon className="h-3.5 w-3.5 text-rose-400" />
            <span>Hijacked (42)</span>
          </button>
          <button
            onClick={() => onSelectDemo('B07XYZ9999')}
            className="group flex items-center space-x-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-amber-300 transition-all hover:bg-amber-500/10 hover:text-amber-200 border border-transparent hover:border-amber-500/30"
            title="ASIN: B07XYZ9999 - Knockoff with Unverified 5-Star Spike (Score: 56)"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span>Fake Spike (56)</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* API Status Badge */}
          <div
            className={`hidden sm:flex items-center space-x-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border ${
              isLiveApi
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
            }`}
            title={
              isLiveApi
                ? 'Connected to Live Amazon Scraper API'
                : 'Running in High-Fidelity Simulation Mode (Instant response, offline capable)'
            }
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isLiveApi ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'
              }`}
            />
            <span>{isLiveApi ? 'Live Scraper Active' : 'Simulation Mode'}</span>
          </div>

          {/* Formula Modal Trigger */}
          <button
            onClick={onOpenFormula}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-white"
            title="Inspect Mathematical Scoring Formula"
          >
            <Info className="h-4 w-4 text-amber-400" />
            <span className="hidden md:inline">Formula</span>
          </button>

          {/* History Drawer Toggle */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-white"
            title="View Search History & Past Scans"
          >
            <History className="h-4 w-4 text-slate-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Demo Bar */}
      <div className="flex lg:hidden items-center justify-between border-t border-slate-800/80 bg-slate-950/95 px-4 py-2 overflow-x-auto gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 shrink-0">
          Demos:
        </span>
        <button
          onClick={() => onSelectDemo('B08N5WRWNW')}
          className="shrink-0 flex items-center space-x-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 text-[11px] font-medium text-emerald-300"
        >
          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
          <span>Safe (88)</span>
        </button>
        <button
          onClick={() => onSelectDemo('B09XFAK321')}
          className="shrink-0 flex items-center space-x-1 rounded-md bg-rose-500/10 border border-rose-500/20 px-2 py-1 text-[11px] font-medium text-rose-300"
        >
          <AlertOctagon className="h-3 w-3 text-rose-400" />
          <span>Hijacked (42)</span>
        </button>
        <button
          onClick={() => onSelectDemo('B07XYZ9999')}
          className="shrink-0 flex items-center space-x-1 rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-1 text-[11px] font-medium text-amber-300"
        >
          <AlertTriangle className="h-3 w-3 text-amber-400" />
          <span>Spike (56)</span>
        </button>
      </div>
    </header>
  );
};
