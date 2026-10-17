'use client';

import React, { useState } from 'react';
import {
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Copy,
  Check,
  Truck,
  RotateCcw,
  Tag,
  Star,
} from 'lucide-react';
import { TrustAnalysisResult } from '@/types/trust';
import { formatCurrency } from '@/lib/utils';

interface SummaryVerdictProps {
  analysis: TrustAnalysisResult;
}

export const SummaryVerdict: React.FC<SummaryVerdictProps> = ({ analysis }) => {
  const { product, seller, verdict, overallScore, riskLevel } = analysis;
  const [copiedAsin, setCopiedAsin] = useState(false);

  const copyAsin = () => {
    navigator.clipboard.writeText(product.asin);
    setCopiedAsin(true);
    setTimeout(() => setCopiedAsin(false), 2000);
  };

  const getVerdictTheme = () => {
    if (riskLevel === 'Safe') {
      return {
        bannerBg: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        icon: ShieldCheck,
        iconColor: 'text-emerald-400',
      };
    }
    if (riskLevel === 'Moderate Risk') {
      return {
        bannerBg: 'bg-amber-950/40 border-amber-500/30 text-amber-200',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        icon: AlertTriangle,
        iconColor: 'text-amber-400',
      };
    }
    return {
      bannerBg: 'bg-rose-950/40 border-rose-500/30 text-rose-200',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      icon: ShieldAlert,
      iconColor: 'text-rose-400',
    };
  };

  const theme = getVerdictTheme();
  const IconComponent = theme.icon;

  return (
    <div className="flex flex-col space-y-4">
      {/* Top Prominent Verdict Alert Banner */}
      <div className={`rounded-2xl border p-5 ${theme.bannerBg} backdrop-blur-md shadow-lg transition-all`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3.5">
            <div className="mt-0.5 rounded-xl bg-slate-900/60 p-2.5 border border-slate-700/50 shrink-0">
              <IconComponent className={`h-6 w-6 ${theme.iconColor}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-bold ${theme.badgeBg}`}>
                  {verdict.badgeText}
                </span>
                <span className="text-xs text-slate-400 font-mono">ASIN: {product.asin}</span>
              </div>
              <h3 className="mt-1 text-lg font-bold tracking-tight text-white sm:text-xl">
                {verdict.title}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                {verdict.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row gap-5 items-start">
          {/* Thumbnail */}
          <div className="relative h-44 w-full md:w-44 shrink-0 overflow-hidden rounded-xl bg-slate-800 border border-slate-700/70 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt={product.title}
              className="h-full w-full object-cover object-center transition-transform hover:scale-105 duration-300"
              onError={(e) => {
                // Fallback image
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
              }}
            />
            {product.discountPercentage > 0 && (
              <span className={`absolute top-2 left-2 rounded-md px-2 py-0.5 text-[11px] font-bold shadow-md ${
                product.discountPercentage > 75
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-amber-500 text-slate-950'
              }`}>
                {product.discountPercentage}% OFF
              </span>
            )}
          </div>

          {/* Product Meta & Details */}
          <div className="flex-1 flex flex-col justify-between h-full">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-md bg-slate-800 px-2 py-0.5 font-medium text-slate-300">
                  {product.category}
                </span>
                <span className="text-slate-400">•</span>
                <span className="font-semibold text-amber-400">Brand: {product.brand}</span>
                {product.hasOfficialBadge && (
                  <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    Official Badge
                  </span>
                )}
              </div>

              <h2 className="mt-2 text-base sm:text-lg font-bold text-white line-clamp-2" title={product.title}>
                {product.title}
              </h2>

              {/* Price & MSRP */}
              <div className="mt-3 flex items-baseline space-x-3">
                <span className="text-2xl font-extrabold text-white">
                  {formatCurrency(product.price, product.productUrl)}
                </span>
                {product.msrp > product.price && (
                  <span className="text-sm text-slate-400 line-through">
                    {formatCurrency(product.msrp, product.productUrl)}
                  </span>
                )}
                <div className="flex items-center space-x-1 text-xs text-amber-400 font-medium">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <span>{product.ratingAverage}</span>
                  <span className="text-slate-400">({product.totalRatingsCount.toLocaleString()} ratings)</span>
                </div>
              </div>
            </div>

            {/* Quick Feature Chips */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-slate-800/80 pt-3">
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <Truck className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="truncate">
                  {seller.isSoldByAmazon || seller.isFBA ? 'Fulfilled by Amazon' : '3rd-Party Fulfilled'}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <RotateCcw className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="truncate" title={product.returnPolicy}>
                  {product.returnPolicy.includes('30-day') ? '30-Day Free Returns' : 'Restricted Returns'}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-300 col-span-2 sm:col-span-1">
                <Tag className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="truncate">Seller: {seller.name}</span>
              </div>
            </div>

            {/* Actions: Copy ASIN & View on Amazon */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={copyAsin}
                className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                {copiedAsin ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedAsin ? 'Copied ASIN!' : `Copy ASIN (${product.asin})`}</span>
              </button>

              <a
                href={product.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-colors ml-auto"
              >
                <span>View on Amazon</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
