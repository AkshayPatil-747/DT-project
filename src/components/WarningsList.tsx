'use client';

import React from 'react';
import { ShieldAlert, AlertTriangle, AlertCircle, CheckCircle2, Flag } from 'lucide-react';
import { TrustWarning } from '@/types/trust';

interface WarningsListProps {
  warnings: TrustWarning[];
}

export const WarningsList: React.FC<WarningsListProps> = ({ warnings }) => {
  if (warnings.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="rounded-xl bg-emerald-500/10 p-2.5 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Zero Critical Red Flags Detected
            </h3>
            <p className="text-xs text-emerald-300/80 mt-0.5">
              Review velocity, purchase verification, seller history, and product integrity all passed automated scrutiny.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getSeverityStyle = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return {
          cardBorder: 'border-rose-500/30 bg-rose-950/20',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          iconColor: 'text-rose-400',
          icon: ShieldAlert,
        };
      case 'medium':
        return {
          cardBorder: 'border-amber-500/30 bg-amber-950/20',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          iconColor: 'text-amber-400',
          icon: AlertTriangle,
        };
      default:
        return {
          cardBorder: 'border-slate-700 bg-slate-900/60',
          badge: 'bg-slate-800 text-slate-300 border-slate-700',
          iconColor: 'text-slate-400',
          icon: AlertCircle,
        };
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Flag className="h-5 w-5 text-rose-400" />
          <h3 className="text-base font-bold text-white">
            Detected Listing Red Flags &amp; Anomalies
          </h3>
        </div>
        <span className="rounded-full bg-rose-500/20 border border-rose-500/30 px-2.5 py-0.5 text-xs font-bold text-rose-300">
          {warnings.length} {warnings.length === 1 ? 'Anomaly Flagged' : 'Anomalies Flagged'}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {warnings.map((warn) => {
          const style = getSeverityStyle(warn.severity);
          const IconComponent = style.icon;

          return (
            <div
              key={warn.id}
              className={`rounded-xl border p-3.5 transition-all hover:bg-slate-800/40 ${style.cardBorder}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    <IconComponent className={`h-5 w-5 shrink-0 ${style.iconColor}`} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {warn.title}
                      </span>
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${style.badge}`}>
                        {warn.badge}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                      {warn.description}
                    </p>
                  </div>
                </div>

                {warn.impactScoreDeduction > 0 && (
                  <div className="shrink-0 text-right">
                    <span className="inline-block rounded-md bg-rose-500/20 border border-rose-500/30 px-2 py-1 text-xs font-mono font-bold text-rose-300">
                      -{warn.impactScoreDeduction} pts
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
