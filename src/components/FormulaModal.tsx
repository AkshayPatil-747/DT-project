'use client';

import React from 'react';
import { X, Calculator, ShieldCheck, Scale, AlertTriangle } from 'lucide-react';

interface FormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormulaModal: React.FC<FormulaModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="rounded-xl bg-amber-500/10 p-2 border border-amber-500/20 text-amber-400">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Scoring Engine &amp; Mathematical Formulation
              </h3>
              <p className="text-xs text-slate-400">
                Transparent rubric and weight attribution model
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

        {/* Core Formula Box */}
        <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            Composite Trust Equation
          </span>
          <div className="mt-1 font-mono text-sm sm:text-base font-extrabold text-white">
            Total Trust Score = (0.45 × ReviewScore) + (0.35 × SellerScore) + (0.20 × ProductScore)
          </div>
        </div>

        {/* 3 Pillars Breakdown */}
        <div className="mt-5 space-y-4 text-xs text-slate-300">
          {/* Pillar 1 */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-purple-300">
                1. Review Authenticity Score (45% Weight)
              </span>
              <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-mono text-purple-300">
                Max 45 pts to total
              </span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] mt-2">
              <li>
                <strong className="text-slate-200">Verified Purchase Ratio:</strong> Penalized if verified buyer ratio drops below 70%.
              </li>
              <li>
                <strong className="text-slate-200">Review Burst Detection:</strong> If &gt;35% of 5-star ratings cluster in a single 72h window, 20 points are deducted.
              </li>
              <li>
                <strong className="text-slate-200">Listing Hijacking Detection:</strong> Compares title keywords with older review tokens (e.g. Earbuds vs Bedsheets). Drops score by 30 points.
              </li>
              <li>
                <strong className="text-slate-200">Bimodal Polarization Penalty:</strong> High 5-star + high 1-star with negligible 2-4 stars triggers a 15-point penalty.
              </li>
              <li>
                <strong className="text-slate-200">Template Repetition:</strong> Deducts points for repeated generic phrases (&quot;great product loved it&quot;).
              </li>
            </ul>
          </div>

          {/* Pillar 2 */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-blue-300">
                2. Seller Reliability Score (35% Weight)
              </span>
              <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-mono text-blue-300">
                Max 35 pts to total
              </span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] mt-2">
              <li>
                <strong className="text-slate-200">Fulfillment Model (30 pts max):</strong> Sold &amp; Shipped by Amazon or Fulfilled by Amazon (FBA) = +30 pts; Third-party merchant (FBM) = 5 pts.
              </li>
              <li>
                <strong className="text-slate-200">12-Month Feedback Rate (40 pts max):</strong> &gt;92% positive = +40 pts; 80–91% = +20 pts; &lt;80% = 0 pts.
              </li>
              <li>
                <strong className="text-slate-200">Maturity / Ratings Count (30 pts max):</strong> Established seller (&gt;100 ratings) = +30 pts; New seller (&lt;15 ratings) = 5 pts max.
              </li>
            </ul>
          </div>

          {/* Pillar 3 */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-emerald-300">
                3. Product Integrity Score (20% Weight)
              </span>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                Max 20 pts to total
              </span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] mt-2">
              <li>
                <strong className="text-slate-200">Brand Matching (50 pts):</strong> Title brand matches storefront owner = 50 pts; mismatch = 15 pts.
              </li>
              <li>
                <strong className="text-slate-200">Return Policy Validation (50 pts):</strong> Standard 30-day money-back refund guarantee = 50 pts; restrictive replacement policy = 20 pts.
              </li>
              <li>
                <strong className="text-slate-200">Price Sanity Check (-25 pts):</strong> Slashed &gt;75% off standard MSRP without official Amazon deal badge = 25 pts deduction.
              </li>
            </ul>
          </div>
        </div>

        {/* Thresholds Table */}
        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/80 p-3.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Risk Tier Classification
          </span>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2 text-emerald-300">
              <div className="font-bold">80 – 100</div>
              <div className="text-[10px] font-medium text-emerald-400">Safe / Verified</div>
            </div>
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-2 text-amber-300">
              <div className="font-bold">55 – 79</div>
              <div className="text-[10px] font-medium text-amber-400">Moderate Caution</div>
            </div>
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-2 text-rose-300">
              <div className="font-bold">0 – 54</div>
              <div className="text-[10px] font-medium text-rose-400">High Risk Alert</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
