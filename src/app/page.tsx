'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroSearch } from '@/components/HeroSearch';
import { TrustGauge } from '@/components/TrustGauge';
import { SummaryVerdict } from '@/components/SummaryVerdict';
import { BreakdownCards } from '@/components/BreakdownCard';
import { WarningsList } from '@/components/WarningsList';
import { BuyerRecommendations } from '@/components/BuyerRecommendation';
import { ReviewExplorer } from '@/components/ReviewExplorer';
import { HistoryDrawer } from '@/components/HistoryDrawer';
import { FormulaModal } from '@/components/FormulaModal';
import { TrustAnalysisResult, HistoryItem } from '@/types/trust';
import { Sparkles, ArrowUpRight, Scale, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

const ANALYSIS_STEPS = [
  'Extracting ASIN and querying Amazon metadata...',
  'Scanning review bursts & temporal distributions...',
  'Auditing seller storefront age and fulfillment channel...',
  'Computing weighted composite Trust & Risk Index...',
];

export default function HomePage() {
  const [analysis, setAnalysis] = useState<TrustAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('B08N5WRWNW');
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isFormulaOpen, setIsFormulaOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<string>('Simulation Preset');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Initial load: Fetch default analysis (Demo 1: B08N5WRWNW) & history
  useEffect(() => {
    // Load local history from localStorage if available
    const localSaved = localStorage.getItem('trust_checker_history');
    if (localSaved) {
      try {
        setHistory(JSON.parse(localSaved));
      } catch {}
    }

    // Fetch initial demo and API history
    const initApp = async () => {
      try {
        // Fetch server history
        const histRes = await fetch('/api/history');
        if (histRes.ok) {
          const histJson = await histRes.json();
          if (histJson.history && histJson.history.length > 0) {
            setHistory(histJson.history);
          }
        }

        // Auto-analyze Demo 1 on mount so the user has immediate rich data
        const analyzeRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'B08N5WRWNW' }),
        });

        if (analyzeRes.ok) {
          const json = await analyzeRes.json();
          if (json.data) {
            setAnalysis(json.data);
            setIsLiveApi(Boolean(json.isLiveFetch || json.hasApiKeyConfigured));
            setDataSource(json.dataSource || 'Simulation Preset');
          }
        }
      } catch (err) {
        console.error('Failed to initialize app data:', err);
      }
    };

    initApp();
  }, []);

  // Sync history to localStorage
  const saveHistoryItem = async (newAnalysis: TrustAnalysisResult) => {
    const item: HistoryItem = {
      id: `hist-${Date.now()}`,
      asin: newAnalysis.product.asin,
      productTitle: newAnalysis.product.title,
      productImage: newAnalysis.product.imageUrl,
      price: newAnalysis.product.price,
      overallScore: newAnalysis.overallScore,
      riskLevel: newAnalysis.riskLevel,
      analyzedAt: new Date().toISOString(),
      sellerName: newAnalysis.seller.name,
    };

    setHistory((prev) => {
      const updated = [item, ...prev.filter((h) => h.asin !== item.asin)].slice(0, 30);
      localStorage.setItem('trust_checker_history', JSON.stringify(updated));
      return updated;
    });

    // Also send to backend
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
    } catch {}
  };

  const handleAnalyze = async (query: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSearchQuery(query);

    // Step simulation
    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      setCurrentStep(ANALYSIS_STEPS[i]);
      await new Promise((r) => setTimeout(r, 200));
    }

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json.error || 'Failed to analyze product. Please verify the URL or ASIN.');
      }

      if (json.data) {
        setAnalysis(json.data);
        setIsLiveApi(Boolean(json.isLiveFetch || json.hasApiKeyConfigured));
        setDataSource(json.dataSource || (json.isLiveFetch ? 'Live Amazon Scraper' : 'Simulation Preset'));
        saveHistoryItem(json.data);

        // Smooth scroll to results
        setTimeout(() => {
          dashboardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

        // Confetti if high trust score
        if (json.data.overallScore >= 80) {
          try {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#10b981', '#34d399', '#6ee7b7'],
            });
          } catch {}
        }
      } else {
        throw new Error('No assessment data was returned.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while analyzing listing.');
    } finally {
      setIsLoading(false);
      setCurrentStep('');
    }
  };

  const handleSelectDemo = (asin: string) => {
    setSearchQuery(asin);
    handleAnalyze(asin);
  };

  const handleDeleteHistoryItem = async (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem('trust_checker_history', JSON.stringify(updated));
      return updated;
    });
    try {
      await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
    } catch {}
  };

  const handleClearAllHistory = async () => {
    setHistory([]);
    localStorage.removeItem('trust_checker_history');
    try {
      await fetch('/api/history?all=true', { method: 'DELETE' });
    } catch {}
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Navbar */}
      <Navbar
        onSelectDemo={handleSelectDemo}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenFormula={() => setIsFormulaOpen(true)}
        historyCount={history.length}
        isLiveApi={isLiveApi}
      />

      {/* Hero & Search Section */}
      <HeroSearch
        onAnalyze={handleAnalyze}
        isLoading={isLoading}
        currentStep={currentStep}
        initialQuery={searchQuery}
        errorMessage={errorMessage}
      />

      {/* Main Analysis Dashboard */}
      <main ref={dashboardRef} className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {analysis ? (
          <div className="space-y-8 animate-fade-in">
            {/* Live Data Source / Mode Indicator Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2.5 text-xs backdrop-blur-md">
              <div className="flex items-center space-x-2">
                <span className={`h-2.5 w-2.5 rounded-full ${isLiveApi ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
                <span className="font-semibold text-white">
                  Data Feed: <span className={isLiveApi ? 'text-emerald-300 font-bold' : 'text-cyan-300 font-bold'}>{dataSource}</span>
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300 text-[11px]">
                  {isLiveApi ? 'Live scraped from Amazon catalog with real-time price & reviews' : 'Calibrated benchmark scenario'}
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                Audited at {new Date(analysis.timestamp).toLocaleTimeString()}
              </span>
            </div>

            {/* Top Grid: Trust Gauge + Summary Verdict */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Circular Gauge Card */}
              <div className="lg:col-span-4 flex">
                <div className="w-full">
                  <TrustGauge
                    score={analysis.overallScore}
                    riskLevel={analysis.riskLevel}
                    reviewContrib={analysis.computationFormula.reviewContribution}
                    sellerContrib={analysis.computationFormula.sellerContribution}
                    productContrib={analysis.computationFormula.productContribution}
                    onOpenFormula={() => setIsFormulaOpen(true)}
                  />
                </div>
              </div>

              {/* Summary Verdict & Product Card */}
              <div className="lg:col-span-8 flex">
                <div className="w-full">
                  <SummaryVerdict analysis={analysis} />
                </div>
              </div>
            </div>

            {/* Red Flag Warnings Banner */}
            <WarningsList warnings={analysis.warnings} />

            {/* 3 Detailed Breakdown Cards */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
                    <span>Mathematical Sub-Score Breakdown</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Transparent attribution: Reviews (45%), Seller (35%), Product Integrity (20%)
                  </p>
                </div>
                <button
                  onClick={() => setIsFormulaOpen(true)}
                  className="hidden sm:flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-slate-800 transition-colors"
                >
                  <Scale className="h-3.5 w-3.5" />
                  <span>Explain Weights</span>
                </button>
              </div>

              <BreakdownCards
                reviewBreakdown={analysis.breakdown.reviewAuthenticity}
                sellerBreakdown={analysis.breakdown.sellerReliability}
                productBreakdown={analysis.breakdown.productIntegrity}
              />
            </section>

            {/* Buyer Checklist & Review Audit Log */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Checklist */}
              <div className="lg:col-span-5">
                <BuyerRecommendations recommendations={analysis.recommendations} />
              </div>

              {/* Review Inspector */}
              <div className="lg:col-span-7">
                <ReviewExplorer reviews={analysis.reviewsSample} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <RefreshCw className="h-10 w-10 text-amber-500 animate-spin mb-4" />
            <h3 className="text-lg font-bold text-white">Loading Product Trust Intelligence...</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm">
              Connecting to evaluation engine and initializing simulated database.
            </p>
          </div>
        )}
      </main>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectProduct={(asin) => handleSelectDemo(asin)}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        onClearAllHistory={handleClearAllHistory}
      />

      {/* Formula Explanation Modal */}
      <FormulaModal
        isOpen={isFormulaOpen}
        onClose={() => setIsFormulaOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            <span className="font-semibold text-slate-300">Amazon Product Trust Checker</span>
            <span>—</span>
            <span>Independent Academic Consumer Defense Research</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <button
              onClick={() => setIsFormulaOpen(true)}
              className="hover:text-amber-400 transition-colors"
            >
              Scoring Methodology
            </button>
            <span>•</span>
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="hover:text-amber-400 transition-colors"
            >
              Saved Scans ({history.length})
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
