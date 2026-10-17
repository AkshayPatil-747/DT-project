'use client';

import React, { useState } from 'react';
import { CheckSquare, Square, ShoppingBag, ShieldCheck, HelpCircle, Sparkles } from 'lucide-react';
import { BuyerRecommendation } from '@/types/trust';

interface BuyerRecommendationProps {
  recommendations: BuyerRecommendation[];
}

export const BuyerRecommendations: React.FC<BuyerRecommendationProps> = ({
  recommendations,
}) => {
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <ShoppingBag className="h-5 w-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">
            Buyer Recommendation &amp; Safety Checklist
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          Click to mark completed steps
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {recommendations.map((rec) => {
          const isChecked = Boolean(checkedIds[rec.id]);

          return (
            <button
              key={rec.id}
              onClick={() => toggleCheck(rec.id)}
              className={`w-full text-left flex items-start space-x-3 rounded-xl border p-3 transition-all ${
                isChecked
                  ? 'border-emerald-500/30 bg-emerald-950/20 text-slate-300'
                  : 'border-slate-800 bg-slate-950/50 hover:bg-slate-800/40 text-slate-200'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isChecked ? (
                  <CheckSquare className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Square className="h-4 w-4 text-slate-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs font-bold ${
                      isChecked ? 'text-emerald-300 line-through' : 'text-white'
                    }`}
                  >
                    {rec.title}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded ${
                      rec.category === 'caution'
                        ? 'bg-rose-500/20 text-rose-300'
                        : rec.category === 'action'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}
                  >
                    {rec.category}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  {rec.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
