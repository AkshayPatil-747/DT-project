'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, HelpCircle } from 'lucide-react';

interface TrustGaugeProps {
  score: number; // 0 - 100
  riskLevel: 'Safe' | 'Moderate Risk' | 'High Risk';
  reviewContrib: number;
  sellerContrib: number;
  productContrib: number;
  onOpenFormula: () => void;
}

export const TrustGauge: React.FC<TrustGaugeProps> = ({
  score,
  riskLevel,
  reviewContrib,
  sellerContrib,
  productContrib,
  onOpenFormula,
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Smooth count-up effect
  useEffect(() => {
    let start = 0;
    const duration = 1200; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(easeProgress * score));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  // Color config
  const getTheme = () => {
    if (score >= 80) {
      return {
        strokeColor: '#10b981', // emerald-500
        bgColor: 'rgba(16, 185, 129, 0.1)',
        textColor: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
        gradientId: 'emeraldGrad',
        icon: ShieldCheck,
      };
    }
    if (score >= 55) {
      return {
        strokeColor: '#f59e0b', // amber-500
        bgColor: 'rgba(245, 158, 11, 0.1)',
        textColor: 'text-amber-400',
        badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
        gradientId: 'amberGrad',
        icon: AlertTriangle,
      };
    }
    return {
      strokeColor: '#ef4444', // rose-500
      bgColor: 'rgba(239, 68, 68, 0.1)',
      textColor: 'text-rose-400',
      badgeBg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
      gradientId: 'roseGrad',
      icon: ShieldAlert,
    };
  };

  const theme = getTheme();
  const IconComponent = theme.icon;

  // Gauge calculation (Semi-circle or 240-degree arc)
  const radius = 80;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  // Arc covering 240 degrees (out of 360)
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - (arcLength * (animatedScore / 100));

  return (
    <div className="relative flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md">
      {/* Formula Info Button */}
      <button
        onClick={onOpenFormula}
        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        title="View Mathematical Scoring Formula"
      >
        <HelpCircle className="h-4 w-4" />
      </button>

      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
        Composite Trust Index
      </span>

      {/* SVG Arc Gauge */}
      <div className="relative flex items-center justify-center w-52 h-44">
        <svg className="w-52 h-52 -rotate-[210deg] transform" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="roseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>

          {/* Background Track Arc */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Value Progress Arc */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={`url(#${theme.gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
          />
        </svg>

        {/* Center Numbers & Icon */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <div className="flex items-baseline">
            <span className={`text-5xl font-black tracking-tight ${theme.textColor}`}>
              {animatedScore}
            </span>
            <span className="text-xl font-bold text-slate-400 ml-1">/100</span>
          </div>
          <div className="flex items-center space-x-1.5 mt-1">
            <IconComponent className={`h-4 w-4 ${theme.textColor}`} />
            <span className="text-xs font-semibold text-slate-300">{riskLevel}</span>
          </div>
        </div>
      </div>

      {/* Trust Level Pill */}
      <div className={`mt-2 inline-flex items-center space-x-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${theme.badgeBg}`}>
        <span>
          {score >= 80 ? 'Verified & Highly Reliable' : score >= 55 ? 'Moderate Caution Advised' : 'High Risk & Red Flags'}
        </span>
      </div>

      {/* Formula Breakdown Weight Chips */}
      <div className="mt-5 w-full grid grid-cols-3 gap-2 border-t border-slate-800 pt-4 text-center">
        <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Reviews (45%)</div>
          <div className="text-xs font-bold text-slate-200 mt-0.5">+{reviewContrib.toFixed(1)} pts</div>
        </div>
        <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Seller (35%)</div>
          <div className="text-xs font-bold text-slate-200 mt-0.5">+{sellerContrib.toFixed(1)} pts</div>
        </div>
        <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Product (20%)</div>
          <div className="text-xs font-bold text-slate-200 mt-0.5">+{productContrib.toFixed(1)} pts</div>
        </div>
      </div>
    </div>
  );
};
