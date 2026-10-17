'use client';

import React, { useState, useEffect } from 'react';
import { X, Key, Cloud, ShieldAlert, Check, ExternalLink, RefreshCw } from 'lucide-react';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: (key: string) => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  onKeySaved,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('trust_checker_scraper_key') || '';
    setApiKey(saved);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('trust_checker_scraper_key', apiKey.trim());
    onKeySaved(apiKey.trim());
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    localStorage.removeItem('trust_checker_scraper_key');
    setApiKey('');
    onKeySaved('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="rounded-xl bg-cyan-500/10 p-2 border border-cyan-500/20 text-cyan-400">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Deployment &amp; Scraper API Settings
              </h3>
              <p className="text-xs text-slate-400">
                Fix Amazon cloud datacenter IP blocks after deploying
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cloud Explanation Alert */}
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 text-xs text-amber-200/90 leading-relaxed">
          <div className="flex items-start space-x-2">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <strong className="text-amber-300">Why does this happen after deployment?</strong>
              <p className="mt-1 text-slate-300 text-[11px]">
                On localhost, requests originate from your residential home IP, so Amazon allows scraping. But once deployed on Vercel, Netlify, or AWS, Amazon detects cloud serverless IPs and serves 503 / CAPTCHA pages.
              </p>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>ScraperAPI or Rainforest API Key</span>
              <a
                href="https://www.scraperapi.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-amber-400 hover:underline flex items-center space-x-1"
              >
                <span>Get 5,000 Free Requests</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your ScraperAPI or Rainforest key here..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400 leading-normal">
              Stored securely in your local browser session and sent to the analysis route. Alternatively, set <code className="text-amber-300 bg-slate-800 px-1 py-0.5 rounded font-mono">AMAZON_SCRAPER_API_KEY</code> in your Vercel Project Environment Variables.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
          >
            Clear Stored Key
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center space-x-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors"
            >
              {isSaved ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Configuration</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
