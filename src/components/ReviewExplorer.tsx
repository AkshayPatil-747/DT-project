'use client';

import React, { useState } from 'react';
import { AmazonReview } from '@/types/trust';
import { Star, CheckCircle2, AlertOctagon, ThumbsUp, Filter, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ReviewExplorerProps {
  reviews: AmazonReview[];
}

export const ReviewExplorer: React.FC<ReviewExplorerProps> = ({ reviews }) => {
  const [filter, setFilter] = useState<'all' | 'flagged' | 'verified'>('all');

  const filteredReviews = reviews.filter((r) => {
    if (filter === 'flagged') return r.isFlaggedSuspicious || (r.detectedKeywords && r.detectedKeywords.length > 0);
    if (filter === 'verified') return r.isVerified;
    return true;
  });

  const flaggedCount = reviews.filter(
    (r) => r.isFlaggedSuspicious || (r.detectedKeywords && r.detectedKeywords.length > 0)
  ).length;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-md">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <span>Customer Review Audit Log</span>
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300">
              {reviews.length} Sampled
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Examine recent reviews for hijacked category mentions or boilerplate phrasing.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-950 p-1">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              filter === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({reviews.length})
          </button>
          <button
            onClick={() => setFilter('flagged')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors flex items-center space-x-1 ${
              filter === 'flagged'
                ? 'bg-rose-500 text-white font-bold'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            <AlertOctagon className="h-3 w-3" />
            <span>Flagged ({flaggedCount})</span>
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              filter === 'verified'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            Verified Only
          </button>
        </div>
      </div>

      {/* Review List */}
      <div className="mt-4 space-y-3 max-h-[460px] overflow-y-auto pr-1">
        {filteredReviews.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No reviews match the selected filter.
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className={`rounded-xl border p-4 transition-all ${
                rev.isFlaggedSuspicious || (rev.detectedKeywords && rev.detectedKeywords.length > 0)
                  ? 'border-rose-500/40 bg-rose-950/20'
                  : 'border-slate-800 bg-slate-950/60'
              }`}
            >
              {/* Suspicious Alert Banner if flagged */}
              {(rev.isFlaggedSuspicious || rev.suspicionReason) && (
                <div className="mb-2 flex items-center space-x-2 rounded-lg bg-rose-500/20 border border-rose-500/30 px-2.5 py-1 text-xs font-semibold text-rose-300">
                  <AlertOctagon className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                  <span>{rev.suspicionReason || 'Suspicious review anomaly detected'}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  {/* Star Rating */}
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3.5 w-3.5 ${
                          star <= rev.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="text-xs font-bold text-white">
                    {rev.author}
                  </span>

                  {rev.isVerified ? (
                    <span className="flex items-center space-x-1 rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Verified Purchase</span>
                    </span>
                  ) : (
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                      Unverified
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(rev.date)}</span>
                </div>
              </div>

              {/* Title & Body */}
              <h4 className="mt-2 text-xs sm:text-sm font-bold text-slate-100">
                {rev.title}
              </h4>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                {rev.content}
              </p>

              {/* Hijacked Keyword Badges */}
              {rev.detectedKeywords && rev.detectedKeywords.length > 0 && (
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-rose-400 font-semibold">
                    Incompatible Product Mentions:
                  </span>
                  {rev.detectedKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="rounded bg-rose-500/30 text-rose-200 border border-rose-500/40 px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}

              {/* Helpful Votes */}
              {rev.helpfulVotes > 0 && (
                <div className="mt-2 flex items-center space-x-1 text-[11px] text-slate-400">
                  <ThumbsUp className="h-3 w-3" />
                  <span>{rev.helpfulVotes} people found this helpful</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
