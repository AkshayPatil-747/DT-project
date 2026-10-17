'use client';

import React from 'react';
import {
  X,
  Trash2,
  ExternalLink,
  History,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { HistoryItem } from '@/types/trust';
import { formatCurrency, formatDate } from '@/lib/utils';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectProduct: (asin: string) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearAllHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectProduct,
  onDeleteHistoryItem,
  onClearAllHistory,
}) => {
  if (!isOpen) return null;

  const getScoreBadge = (score: number, riskLevel: string) => {
    if (score >= 80) {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
    if (score >= 55) {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
    return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm transition-opacity animate-fade-in">
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md border-l border-slate-800 bg-slate-900 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <History className="h-5 w-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">Scanned Product History</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close Drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Previously evaluated Amazon listings and cached fraud risk audits.
            </p>

            {history.length > 0 && (
              <div className="mt-3 flex justify-between items-center text-xs">
                <span className="text-slate-400">{history.length} saved scans</span>
                <button
                  onClick={onClearAllHistory}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear All</span>
                </button>
              </div>
            )}
          </div>

          {/* List of Scans */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <History className="h-10 w-10 text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-slate-300">No scan history yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Analyze products or click on quick demo presets to build your inspection log.
                </p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 transition-all hover:border-slate-700 hover:bg-slate-800/40"
                >
                  <div className="flex items-start space-x-3">
                    {/* Thumbnail */}
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.productImage}
                        alt={item.productTitle}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600';
                        }}
                      />
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-[10px] text-slate-400">
                          {item.asin}
                        </span>
                        <span
                          className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${getScoreBadge(
                            item.overallScore,
                            item.riskLevel
                          )}`}
                        >
                          Score: {item.overallScore}/100
                        </span>
                      </div>

                      <h4
                        className="mt-1 text-xs font-semibold text-white line-clamp-1 group-hover:text-amber-400 transition-colors"
                        title={item.productTitle}
                      >
                        {item.productTitle}
                      </h4>

                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{formatCurrency(item.price)}</span>
                        <span>{item.sellerName}</span>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[10px] text-slate-400">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(item.analyzedAt)}</span>
                        </span>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onDeleteHistoryItem(item.id)}
                            className="text-slate-400 hover:text-rose-400 p-1"
                            title="Remove from history"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              onSelectProduct(item.asin);
                              onClose();
                            }}
                            className="flex items-center space-x-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 px-2 py-0.5 font-bold"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/80">
            <button
              onClick={onClose}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition-colors"
            >
              Close History Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
