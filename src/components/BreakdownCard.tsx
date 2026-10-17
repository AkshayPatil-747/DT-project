'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Store,
  FileCheck2,
  AlertOctagon,
  Clock,
  TrendingDown,
  Info,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  ReviewScoreBreakdown,
  SellerScoreBreakdown,
  ProductScoreBreakdown,
} from '@/types/trust';

interface BreakdownCardsProps {
  reviewBreakdown: ReviewScoreBreakdown;
  sellerBreakdown: SellerScoreBreakdown;
  productBreakdown: ProductScoreBreakdown;
}

export const BreakdownCards: React.FC<BreakdownCardsProps> = ({
  reviewBreakdown,
  sellerBreakdown,
  productBreakdown,
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const toggleTooltip = (key: string) => {
    setActiveTooltip(activeTooltip === key ? null : key);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 55) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 55) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ========================================================= */}
      {/* CARD 1: REVIEW ANALYSIS (45% Weight)                      */}
      {/* ========================================================= */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-md">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="rounded-xl bg-purple-500/10 p-2.5 border border-purple-500/20 text-purple-400">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                  <span>Review Authenticity</span>
                  <button
                    onClick={() => toggleTooltip('review')}
                    className="text-slate-400 hover:text-slate-200"
                    title="How Review Score is computed"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </h3>
                <span className="text-[11px] text-slate-400">45% Total Trust Weight</span>
              </div>
            </div>

            <div className={`rounded-xl border px-2.5 py-1 text-right ${getScoreColor(reviewBreakdown.score)}`}>
              <span className="text-base font-extrabold">{reviewBreakdown.score}</span>
              <span className="text-[10px] text-slate-400">/100</span>
            </div>
          </div>

          {/* Tooltip drawer if clicked */}
          {activeTooltip === 'review' && (
            <div className="my-3 rounded-lg bg-slate-950 border border-slate-800 p-3 text-xs text-slate-300 leading-relaxed animate-fade-in">
              <p className="font-semibold text-purple-300 mb-1">Mathematical Formula:</p>
              <p className="font-mono text-[11px] text-slate-400 mb-1">
                Score = 100 - VerifiedPenalty - BurstPenalty(20) - RepetitionPenalty - HijackingPenalty(30) - BimodalPenalty(15)
              </p>
              <p className="text-[11px] text-slate-400">
                Deducts points if verified ratio &lt; 70%, if &gt;35% of 5-star reviews were posted within 72h, if generic phrasing repeats, or if reviews mention unrelated products.
              </p>
            </div>
          )}

          {/* Key Metrics */}
          <div className="mt-4 space-y-3.5">
            {/* 1. Verified Purchase Ratio */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 flex items-center space-x-1">
                  <span>Verified Purchase Ratio</span>
                </span>
                <span className={`font-semibold ${reviewBreakdown.verifiedRatio >= 70 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {reviewBreakdown.verifiedRatio}% {reviewBreakdown.verifiedPenalty > 0 && `(-${reviewBreakdown.verifiedPenalty} pts)`}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${reviewBreakdown.verifiedRatio >= 70 ? 'bg-emerald-500' : 'bg-rose-500'} transition-all duration-500`}
                  style={{ width: `${reviewBreakdown.verifiedRatio}%` }}
                />
              </div>
            </div>

            {/* 2. Burst Spike Indicator */}
            <div className="flex items-center justify-between rounded-lg bg-slate-950/60 p-2.5 border border-slate-800">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="text-xs text-slate-300">72-Hour Burst Spike:</span>
              </div>
              <div className="flex items-center space-x-1">
                {reviewBreakdown.burstDetected ? (
                  <span className="rounded-md bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 text-[11px] font-bold text-rose-300">
                    Spike Detected ({reviewBreakdown.burstPercentage}%)
                  </span>
                ) : (
                  <span className="rounded-md bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                    Normal Pacing
                  </span>
                )}
              </div>
            </div>

            {/* 3. Text Repetition */}
            <div className="flex items-center justify-between rounded-lg bg-slate-950/60 p-2.5 border border-slate-800">
              <span className="text-xs text-slate-300">Suspicious Repeated Phrases:</span>
              <span className={`text-xs font-bold ${reviewBreakdown.repeatedPhraseCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {reviewBreakdown.repeatedPhraseCount > 0 ? `${reviewBreakdown.repeatedPhraseCount} matches` : 'None (Natural)'}
              </span>
            </div>

            {/* 4. Hijacking Status */}
            <div className="flex items-center justify-between rounded-lg bg-slate-950/60 p-2.5 border border-slate-800">
              <span className="text-xs text-slate-300">Listing Hijack Check:</span>
              {reviewBreakdown.hijackingDetected ? (
                <span className="rounded-md bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 text-[11px] font-bold text-rose-300 animate-pulse">
                  🚨 Hijacked (-30 pts)
                </span>
              ) : (
                <span className="rounded-md bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                  Clean &amp; Coherent
                </span>
              )}
            </div>

            {/* 5. Rating Distribution Mini Bar Chart */}
            <div className="mt-3 rounded-xl bg-slate-950/80 p-3 border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-semibold uppercase text-slate-400">
                  Star Rating Distribution
                </span>
                {reviewBreakdown.bimodalDetected && (
                  <span className="text-[10px] font-bold text-rose-400">
                    Bimodal Peak Flag
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-[11px]">
                {[
                  { star: '5★', pct: reviewBreakdown.ratingDistribution.fiveStar },
                  { star: '4★', pct: reviewBreakdown.ratingDistribution.fourStar },
                  { star: '3★', pct: reviewBreakdown.ratingDistribution.threeStar },
                  { star: '2★', pct: reviewBreakdown.ratingDistribution.twoStar },
                  { star: '1★', pct: reviewBreakdown.ratingDistribution.oneStar },
                ].map((item) => (
                  <div key={item.star} className="flex items-center space-x-2">
                    <span className="w-5 text-slate-400 font-mono text-[10px]">{item.star}</span>
                    <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          item.star === '5★'
                            ? 'bg-amber-400'
                            : item.star === '1★' && item.pct > 10
                            ? 'bg-rose-400'
                            : 'bg-slate-500'
                        }`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-slate-300 font-mono text-[10px]">
                      {item.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Score Summary */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-400">Contribution to Total:</span>
          <span className="font-bold text-purple-400">
            +{(0.45 * reviewBreakdown.score).toFixed(1)} pts
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CARD 2: SELLER RELIABILITY (35% Weight)                   */}
      {/* ========================================================= */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-md">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="rounded-xl bg-blue-500/10 p-2.5 border border-blue-500/20 text-blue-400">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                  <span>Seller Reliability</span>
                  <button
                    onClick={() => toggleTooltip('seller')}
                    className="text-slate-400 hover:text-slate-200"
                    title="How Seller Score is computed"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </h3>
                <span className="text-[11px] text-slate-400">35% Total Trust Weight</span>
              </div>
            </div>

            <div className={`rounded-xl border px-2.5 py-1 text-right ${getScoreColor(sellerBreakdown.score)}`}>
              <span className="text-base font-extrabold">{sellerBreakdown.score}</span>
              <span className="text-[10px] text-slate-400">/100</span>
            </div>
          </div>

          {/* Tooltip drawer if clicked */}
          {activeTooltip === 'seller' && (
            <div className="my-3 rounded-lg bg-slate-950 border border-slate-800 p-3 text-xs text-slate-300 leading-relaxed animate-fade-in">
              <p className="font-semibold text-blue-300 mb-1">Mathematical Formula:</p>
              <p className="font-mono text-[11px] text-slate-400 mb-1">
                Score = Fulfillment(30) + SellerRating(40) + Maturity(30)
              </p>
              <p className="text-[11px] text-slate-400">
                Amazon / FBA fulfillment yields 30 pts; &gt;92% rating yields 40 pts (80-91% = 20 pts); Established seller (&gt;100 ratings) yields 30 pts.
              </p>
            </div>
          )}

          {/* Key Metrics */}
          <div className="mt-4 space-y-3.5">
            {/* 1. Fulfillment Model */}
            <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">Fulfillment Model</span>
                <span className="font-bold text-blue-300">
                  +{sellerBreakdown.fulfillmentPoints}/30 pts
                </span>
              </div>
              <div className="mt-1 flex items-center space-x-1.5">
                {sellerBreakdown.fulfillmentPoints >= 30 ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertOctagon className="h-4 w-4 text-rose-400 shrink-0" />
                )}
                <span className="text-xs font-semibold text-white">
                  {sellerBreakdown.fulfillmentType}
                </span>
              </div>
            </div>

            {/* 2. Positive Feedback Rate */}
            <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">12-Month Feedback Rating</span>
                <span className="font-bold text-blue-300">
                  +{sellerBreakdown.sellerRatingPoints}/40 pts
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-sm font-bold text-white">
                  {sellerBreakdown.sellerRating}% Positive
                </span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  sellerBreakdown.sellerRating >= 92
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : sellerBreakdown.sellerRating >= 80
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {sellerBreakdown.sellerRating >= 92 ? 'Top Tier' : sellerBreakdown.sellerRating >= 80 ? 'Average' : 'Low Rating'}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    sellerBreakdown.sellerRating >= 92
                      ? 'bg-emerald-500'
                      : sellerBreakdown.sellerRating >= 80
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${sellerBreakdown.sellerRating}%` }}
                />
              </div>
            </div>

            {/* 3. Account Maturity & Lifetime Volume */}
            <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">Account Maturity</span>
                <span className="font-bold text-blue-300">
                  +{sellerBreakdown.sellerMaturityPoints}/30 pts
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-white font-medium">
                  {sellerBreakdown.sellerTotalRatings.toLocaleString()} feedback ratings
                </span>
                <span className="text-slate-400 text-[11px]">
                  {sellerBreakdown.sellerTotalRatings > 100
                    ? 'Established Merchant'
                    : sellerBreakdown.sellerTotalRatings >= 15
                    ? 'Intermediate'
                    : 'New Storefront (<15)'}
                </span>
              </div>
            </div>

            {/* Summary bullet highlights */}
            <div className="space-y-1 text-[11px] text-slate-400 pl-1">
              {sellerBreakdown.details.map((detail, idx) => (
                <div key={idx} className="flex items-center space-x-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Score Summary */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-400">Contribution to Total:</span>
          <span className="font-bold text-blue-400">
            +{(0.35 * sellerBreakdown.score).toFixed(1)} pts
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CARD 3: LISTING INTEGRITY (20% Weight)                    */}
      {/* ========================================================= */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-md">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="rounded-xl bg-emerald-500/10 p-2.5 border border-emerald-500/20 text-emerald-400">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                  <span>Product Integrity</span>
                  <button
                    onClick={() => toggleTooltip('product')}
                    className="text-slate-400 hover:text-slate-200"
                    title="How Product Integrity Score is computed"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </h3>
                <span className="text-[11px] text-slate-400">20% Total Trust Weight</span>
              </div>
            </div>

            <div className={`rounded-xl border px-2.5 py-1 text-right ${getScoreColor(productBreakdown.score)}`}>
              <span className="text-base font-extrabold">{productBreakdown.score}</span>
              <span className="text-[10px] text-slate-400">/100</span>
            </div>
          </div>

          {/* Tooltip drawer if clicked */}
          {activeTooltip === 'product' && (
            <div className="my-3 rounded-lg bg-slate-950 border border-slate-800 p-3 text-xs text-slate-300 leading-relaxed animate-fade-in">
              <p className="font-semibold text-emerald-300 mb-1">Mathematical Formula:</p>
              <p className="font-mono text-[11px] text-slate-400 mb-1">
                Score = BrandMatch(50) + ReturnPolicy(50) - PriceAnomalyPenalty(25)
              </p>
              <p className="text-[11px] text-slate-400">
                Matching storefront brand yields 50 pts; 30-day return policy yields 50 pts; Suspicious discount &gt;75% without official badge deducts 25 pts.
              </p>
            </div>
          )}

          {/* Key Metrics */}
          <div className="mt-4 space-y-3.5">
            {/* 1. Brand Storefront Alignment */}
            <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">Brand Matching</span>
                <span className="font-bold text-emerald-300">
                  +{productBreakdown.brandPoints}/50 pts
                </span>
              </div>
              <div className="mt-1 flex items-center space-x-1.5">
                {productBreakdown.brandMatch ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                )}
                <span className="text-xs font-semibold text-white">
                  {productBreakdown.brandMatch ? 'Brand Matches Storefront' : 'Mismatched Brand Storefront'}
                </span>
              </div>
            </div>

            {/* 2. Price Sanity & MSRP Check */}
            <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">Price Sanity Check</span>
                {productBreakdown.priceAnomalyDetected ? (
                  <span className="font-bold text-rose-400">
                    -{productBreakdown.priceDeduction} pts penalty
                  </span>
                ) : (
                  <span className="font-bold text-emerald-400">
                    Normal Market Price
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-white">
                  Category Avg: ~${productBreakdown.marketAveragePrice.toFixed(2)}
                </span>
                {productBreakdown.priceAnomalyDetected ? (
                  <span className="text-[11px] text-rose-300 font-semibold bg-rose-500/20 px-2 py-0.5 rounded">
                    &gt;75% Fake Discount
                  </span>
                ) : (
                  <span className="text-[11px] text-emerald-300 font-semibold bg-emerald-500/20 px-2 py-0.5 rounded">
                    Priced Reasonably
                  </span>
                )}
              </div>
            </div>

            {/* 3. Return Policy */}
            <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">Return Policy Validation</span>
                <span className="font-bold text-emerald-300">
                  +{productBreakdown.returnPoints}/50 pts
                </span>
              </div>
              <div className="mt-1 flex items-center space-x-1.5">
                {productBreakdown.returnPolicyValid ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertOctagon className="h-4 w-4 text-amber-400 shrink-0" />
                )}
                <span className="text-xs font-semibold text-white">
                  {productBreakdown.returnPolicyValid
                    ? '30-Day Money-Back Guarantee'
                    : 'Restricted / Non-standard Return'}
                </span>
              </div>
            </div>

            {/* Summary details */}
            <div className="space-y-1 text-[11px] text-slate-400 pl-1">
              {productBreakdown.details.map((detail, idx) => (
                <div key={idx} className="flex items-center space-x-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Score Summary */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-400">Contribution to Total:</span>
          <span className="font-bold text-emerald-400">
            +{(0.20 * productBreakdown.score).toFixed(1)} pts
          </span>
        </div>
      </div>
    </div>
  );
};
