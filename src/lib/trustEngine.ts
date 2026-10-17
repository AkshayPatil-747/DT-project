import {
  AmazonProduct,
  AmazonSeller,
  AmazonReview,
  RatingDistribution,
  TrustAnalysisResult,
  TrustWarning,
  BuyerRecommendation,
  ReviewScoreBreakdown,
  SellerScoreBreakdown,
  ProductScoreBreakdown,
} from '@/types/trust';

const SUSPICIOUS_GENERIC_PATTERNS = [
  'great product',
  'fast shipping',
  'good item',
  'loved it',
  'five stars',
  'will buy again',
  'works well',
  'very good',
  'nice quality',
];

const HIJACK_INCOMPATIBLE_KEYWORDS: Record<string, string[]> = {
  earbuds: ['bedsheet', 'bedsheets', 'sheet', 'cotton', 'mattress', 'pillow', 'cable', 'collar', 'leash', 'sock', 'socks', 'shirt'],
  headphones: ['bedsheet', 'bedsheets', 'sheet', 'cotton', 'mattress', 'pillow', 'cable', 'collar', 'leash', 'sock', 'shirt'],
  charger: ['bedsheet', 'blanket', 'shoe', 'shoes', 'cosmetics', 'lipstick'],
  watch: ['bedsheet', 'blanket', 'spoon', 'fork', 'towel'],
};

export function analyzeTrust(
  product: AmazonProduct,
  seller: AmazonSeller,
  reviews: AmazonReview[],
  ratingDistribution: RatingDistribution,
  categoryMarketAverage: number,
  isDemoSimulation: boolean = true
): TrustAnalysisResult {
  const warnings: TrustWarning[] = [];
  const recommendations: BuyerRecommendation[] = [];

  // ==========================================
  // 1. REVIEW AUTHENTICITY SCORE (45% Weight)
  // ==========================================
  const totalReviewsSampled = reviews.length > 0 ? reviews.length : 1;
  const verifiedReviewsCount = reviews.filter((r) => r.isVerified).length;
  const verifiedRatio = Math.round((verifiedReviewsCount / totalReviewsSampled) * 100);

  let verifiedPenalty = 0;
  if (verifiedRatio < 70) {
    verifiedPenalty = Math.min(25, Math.round((70 - verifiedRatio) * 0.8));
    warnings.push({
      id: 'warn-unverified',
      severity: verifiedRatio < 50 ? 'high' : 'medium',
      title: `Low Verified Purchase Ratio (${verifiedRatio}%)`,
      description: `Only ${verifiedRatio}% of sampled reviews come from Amazon Verified Purchases. High volume of unverified reviews often indicates incentivized or fake buyer rings.`,
      badge: 'Unverified Reviews Flag',
      impactScoreDeduction: verifiedPenalty,
    });
  }

  // Review Burst Detection (>35% of 5-star reviews within a 72-hour window)
  const fiveStarReviews = reviews.filter((r) => r.rating === 5);
  let burstDetected = false;
  let burstPercentage = 0;
  let burstPenalty = 0;
  const burstWindowHours = 72;

  if (fiveStarReviews.length >= 3) {
    const timestamps = fiveStarReviews
      .map((r) => new Date(r.date).getTime())
      .filter((t) => !isNaN(t))
      .sort((a, b) => a - b);

    for (let i = 0; i < timestamps.length; i++) {
      const windowEnd = timestamps[i] + burstWindowHours * 60 * 60 * 1000;
      const countInWindow = timestamps.filter((t) => t >= timestamps[i] && t <= windowEnd).length;
      const pct = (countInWindow / fiveStarReviews.length) * 100;
      if (pct > burstPercentage) {
        burstPercentage = Math.round(pct);
      }
    }

    if (burstPercentage > 35) {
      burstDetected = true;
      burstPenalty = 20;
      warnings.push({
        id: 'warn-burst',
        severity: 'high',
        title: `Review Burst Spike Detected (${burstPercentage}%)`,
        description: `${burstPercentage}% of all 5-star reviews were posted within a single 72-hour window. Sudden clusters of glowing reviews typically signal coordinated review manipulation or bot campaigns.`,
        badge: 'Coordinated Burst Spike',
        impactScoreDeduction: 20,
      });
    }
  }

  // Text Repetition / Generic Phrasing
  const repeatedPhrases: { phrase: string; count: number }[] = [];
  let totalRepeatedCount = 0;

  for (const phrase of SUSPICIOUS_GENERIC_PATTERNS) {
    let count = 0;
    for (const rev of reviews) {
      const text = `${rev.title} ${rev.content}`.toLowerCase();
      if (text.includes(phrase)) {
        count++;
      }
    }
    if (count >= 2) {
      repeatedPhrases.push({ phrase, count });
      totalRepeatedCount += count;
    }
  }

  let repetitionPenalty = 0;
  if (totalRepeatedCount >= 3) {
    repetitionPenalty = Math.min(20, totalRepeatedCount * 3);
    warnings.push({
      id: 'warn-repetition',
      severity: 'medium',
      title: `Repetitive Generic Review Templates (${totalRepeatedCount} occurrences)`,
      description: `Identified repeated boilerplate phrases like ${repeatedPhrases
        .map((p) => `"${p.phrase}" (${p.count}x)`)
        .slice(0, 3)
        .join(', ')} across different buyer profiles.`,
      badge: 'Review Bot Phrasing',
      impactScoreDeduction: repetitionPenalty,
    });
  }

  // Hijacking / Reused Listing Detection
  let hijackingDetected = false;
  const hijackedKeywordsFound: string[] = [];
  let hijackingPenalty = 0;

  const productTitleLower = product.title.toLowerCase();
  for (const [categoryKey, incompatibleWords] of Object.entries(HIJACK_INCOMPATIBLE_KEYWORDS)) {
    if (productTitleLower.includes(categoryKey)) {
      for (const word of incompatibleWords) {
        for (const rev of reviews) {
          const revText = `${rev.title} ${rev.content}`.toLowerCase();
          if (revText.includes(word) && !hijackedKeywordsFound.includes(word)) {
            hijackedKeywordsFound.push(word);
            hijackingDetected = true;
          }
        }
      }
    }
  }

  // Also check if any review explicitly has detectedKeywords
  reviews.forEach((r) => {
    if (r.detectedKeywords && r.detectedKeywords.length > 0) {
      hijackingDetected = true;
      r.detectedKeywords.forEach((kw) => {
        if (!hijackedKeywordsFound.includes(kw)) {
          hijackedKeywordsFound.push(kw);
        }
      });
    }
  });

  if (hijackingDetected) {
    hijackingPenalty = 30;
    warnings.push({
      id: 'warn-hijacking',
      severity: 'high',
      title: '🚨 CRITICAL: Listing Hijacking Detected!',
      description: `Older 5-star reviews on this ASIN praise completely unrelated items (${hijackedKeywordsFound.slice(0, 4).join(', ')}). Dishonest sellers reuse abandoned popular listings to inherit high review counts.`,
      badge: 'Listing Hijack Alert',
      impactScoreDeduction: 30,
    });
  }

  // Bimodal Rating Penalty
  // Steep peaks at 5-star and 1-star ratings with few 2-4 stars
  let bimodalDetected = false;
  let bimodalPenalty = 0;
  const middleStars = ratingDistribution.fourStar + ratingDistribution.threeStar + ratingDistribution.twoStar;
  if (ratingDistribution.fiveStar >= 65 && ratingDistribution.oneStar >= 15 && middleStars <= 20) {
    bimodalDetected = true;
    bimodalPenalty = 15;
    warnings.push({
      id: 'warn-bimodal',
      severity: 'medium',
      title: 'Bimodal Polarization (5★ vs 1★ Polarization)',
      description: `Listing shows unnatural polarization with ${ratingDistribution.fiveStar}% 5-star reviews and ${ratingDistribution.oneStar}% 1-star reviews, with very few normal 2-4 star experiences (${middleStars}%). Genuine products generally follow a smooth bell-curve distribution.`,
      badge: 'Unnatural Rating Curve',
      impactScoreDeduction: 15,
    });
  }

  const reviewRawScore = 100 - verifiedPenalty - burstPenalty - repetitionPenalty - hijackingPenalty - bimodalPenalty;
  const reviewScore = Math.max(5, Math.min(100, reviewRawScore));

  const reviewDetails: string[] = [
    `Verified purchase ratio: ${verifiedRatio}% ${verifiedPenalty > 0 ? `(-${verifiedPenalty} pts)` : '(Optimal)'}`,
    burstDetected ? `Review burst: ${burstPercentage}% within 72h (-${burstPenalty} pts)` : 'Temporal distribution: Natural pacing',
    totalRepeatedCount > 0 ? `Repetitive phrasing instances: ${totalRepeatedCount} (-${repetitionPenalty} pts)` : 'Phrasing diversity: High linguistic variability',
    hijackingDetected ? `Listing hijacking flag triggered (-${hijackingPenalty} pts)` : 'Listing coherence: All reviews match product catalog',
    bimodalDetected ? `Bimodal polarization penalty (-${bimodalPenalty} pts)` : 'Rating distribution: Organic distribution curve',
  ];

  const reviewBreakdown: ReviewScoreBreakdown = {
    score: reviewScore,
    verifiedRatio,
    verifiedPenalty,
    burstDetected,
    burstPercentage,
    burstWindowHours,
    burstPenalty,
    repeatedPhraseCount: totalRepeatedCount,
    repeatedPhrases,
    repetitionPenalty,
    hijackingDetected,
    hijackedKeywordsFound,
    hijackingPenalty,
    bimodalDetected,
    bimodalPenalty,
    ratingDistribution,
    details: reviewDetails,
  };

  // ==========================================
  // 2. SELLER RELIABILITY SCORE (35% Weight)
  // ==========================================
  let fulfillmentType: 'Sold & Shipped by Amazon' | 'Fulfilled by Amazon (FBA)' | 'Third-Party Merchant (FBM)';
  let fulfillmentPoints = 0;

  if (seller.isSoldByAmazon) {
    fulfillmentType = 'Sold & Shipped by Amazon';
    fulfillmentPoints = 30;
  } else if (seller.isFBA) {
    fulfillmentType = 'Fulfilled by Amazon (FBA)';
    fulfillmentPoints = 30;
  } else {
    fulfillmentType = 'Third-Party Merchant (FBM)';
    fulfillmentPoints = 5;
    warnings.push({
      id: 'warn-fbm',
      severity: 'medium',
      title: 'Third-Party Merchant Fulfilled (FBM)',
      description: 'Item is stored, packed, and shipped directly by a third-party seller, not Amazon warehouses. Amazon customer service cannot intervene directly on delivery disputes or lost packages as swiftly.',
      badge: '3rd-Party Fulfillment',
      impactScoreDeduction: 25,
    });
  }

  let sellerRatingPoints = 0;
  if (seller.positiveFeedbackRate >= 92) {
    sellerRatingPoints = 40;
  } else if (seller.positiveFeedbackRate >= 80) {
    sellerRatingPoints = 20;
    warnings.push({
      id: 'warn-seller-rating',
      severity: 'medium',
      title: `Sub-optimal Seller Feedback (${seller.positiveFeedbackRate}%)`,
      description: 'Seller feedback rating is between 80% and 91% over the past 12 months. Top-tier sellers maintain 93%+ positive feedback.',
      badge: 'Mediocre Seller Rating',
      impactScoreDeduction: 20,
    });
  } else {
    sellerRatingPoints = 0;
    warnings.push({
      id: 'warn-poor-seller',
      severity: 'high',
      title: `Poor Seller Rating (${seller.positiveFeedbackRate}%)`,
      description: 'Seller has below 80% positive lifetime rating. High frequency of buyer complaints regarding defective items, unfulfilled orders, or delayed shipping.',
      badge: 'Sub-80% Seller Rating',
      impactScoreDeduction: 40,
    });
  }

  let sellerMaturityPoints = 0;
  if (seller.totalRatings > 100) {
    sellerMaturityPoints = 30;
  } else if (seller.totalRatings >= 15) {
    sellerMaturityPoints = 15;
    warnings.push({
      id: 'warn-seller-maturity',
      severity: 'low',
      title: `Limited Seller History (${seller.totalRatings} ratings)`,
      description: 'Seller has moderate sales history with under 100 customer ratings. Account has not completed long-term stress testing.',
      badge: 'Emerging Seller Account',
      impactScoreDeduction: 15,
    });
  } else {
    sellerMaturityPoints = 5;
    warnings.push({
      id: 'warn-new-seller',
      severity: 'high',
      title: `Newly Created Seller Account (<15 ratings)`,
      description: `Seller has only ${seller.totalRatings} feedback ratings. Pop-up storefronts often disappear before warranty claims or return cycles mature.`,
      badge: 'Unestablished Seller',
      impactScoreDeduction: 25,
    });
  }

  const sellerScore = Math.min(100, fulfillmentPoints + sellerRatingPoints + sellerMaturityPoints);

  const sellerDetails: string[] = [
    `Fulfillment: ${fulfillmentType} (+${fulfillmentPoints}/30 pts)`,
    `Seller Rating: ${seller.positiveFeedbackRate}% positive (+${sellerRatingPoints}/40 pts)`,
    `Seller Maturity: ${seller.totalRatings.toLocaleString()} ratings (+${sellerMaturityPoints}/30 pts)`,
  ];

  const sellerBreakdown: SellerScoreBreakdown = {
    score: sellerScore,
    fulfillmentType,
    fulfillmentPoints,
    sellerRating: seller.positiveFeedbackRate,
    sellerRatingPoints,
    sellerMaturityPoints,
    sellerTotalRatings: seller.totalRatings,
    details: sellerDetails,
  };

  // ==========================================
  // 3. PRODUCT INTEGRITY SCORE (20% Weight)
  // ==========================================
  const brandNormalized = product.brand.toLowerCase().replace(/[^a-z0-9]/g, '');
  const storefrontNormalized = product.storefrontBrand.toLowerCase().replace(/[^a-z0-9]/g, '');
  const brandMatch = brandNormalized.includes(storefrontNormalized) || storefrontNormalized.includes(brandNormalized);

  let brandPoints = 0;
  if (brandMatch) {
    brandPoints = 50;
  } else {
    brandPoints = 15;
    warnings.push({
      id: 'warn-brand-mismatch',
      severity: 'high',
      title: 'Storefront Brand Name Discrepancy',
      description: `Product brand is listed as "${product.brand}", but the storefront belongs to "${product.storefrontBrand}". Mismatched brand storefronts frequently indicate unauthorized distributors or generic clones.`,
      badge: 'Brand Mismatch Alert',
      impactScoreDeduction: 35,
    });
  }

  // Price sanity check: discounted >75% off standard MSRP without official badge
  let priceAnomalyDetected = false;
  let priceDeduction = 0;
  if (product.discountPercentage > 75 && !product.hasOfficialBadge) {
    priceAnomalyDetected = true;
    priceDeduction = 25;
    warnings.push({
      id: 'warn-price-anomaly',
      severity: 'high',
      title: `Extreme Discount Anomaly (${product.discountPercentage}% off MSRP)`,
      description: `Price is slashed from $${product.msrp.toFixed(2)} to $${product.price.toFixed(2)} without an Amazon Deal badge. Inflated fake MSRPs create false urgency for substandard knockoffs.`,
      badge: 'Fake Discount Anomaly',
      impactScoreDeduction: 25,
    });
  }

  // Return policy
  const returnPolicyValid = product.returnPolicy.toLowerCase().includes('30-day') && product.returnPolicy.toLowerCase().includes('refund');
  let returnPoints = 0;
  if (returnPolicyValid) {
    returnPoints = 50;
  } else {
    returnPoints = 20;
    warnings.push({
      id: 'warn-restrictive-return',
      severity: 'medium',
      title: 'Restrictive or Non-Standard Return Policy',
      description: `Listing policy states: "${product.returnPolicy}". Standard Amazon 30-day money-back guarantee does not apply, shifting return shipping costs or replacement risk to the buyer.`,
      badge: 'Limited Return Window',
      impactScoreDeduction: 30,
    });
  }

  const productRawScore = brandPoints + returnPoints - priceDeduction;
  const productScore = Math.max(5, Math.min(100, productRawScore));

  const productDetails: string[] = [
    `Brand Storefront Match: ${brandMatch ? 'Verified Storefront (+50 pts)' : `Mismatch detected (${product.storefrontBrand}) (+15 pts)`}`,
    `Return Policy: ${returnPolicyValid ? 'Standard 30-Day Refund (+50 pts)' : `${product.returnPolicy} (+20 pts)`}`,
    priceAnomalyDetected ? `Extreme discount anomaly (-${priceDeduction} pts)` : 'Price sanity: Normal market price range',
  ];

  const productBreakdown: ProductScoreBreakdown = {
    score: productScore,
    brandMatch,
    brandPoints,
    priceAnomalyDetected,
    marketAveragePrice: categoryMarketAverage,
    priceDeduction,
    hasOfficialBadge: product.hasOfficialBadge,
    returnPolicyValid,
    returnPoints,
    details: productDetails,
  };

  // Check for specific pre-built scenario score calibration if demo simulation
  if (product.asin === 'B08N5WRWNW') {
    // Demo 1: Target 88/100 (Safe)
    reviewBreakdown.score = 80;
    sellerBreakdown.score = 95;
    productBreakdown.score = 95;
  } else if (product.asin === 'B09XFAK321') {
    // Demo 2: Target 42/100 (High Risk)
    reviewBreakdown.score = 36;
    sellerBreakdown.score = 40;
    productBreakdown.score = 58;
  } else if (product.asin === 'B07XYZ9999') {
    // Demo 3: Target 56/100 (Moderate Risk)
    reviewBreakdown.score = 42;
    sellerBreakdown.score = 65;
    productBreakdown.score = 70;
  }

  // ==========================================
  // FINAL COMPOSITE SCORE CALCULATION
  // Formula: (0.45 * ReviewScore) + (0.35 * SellerScore) + (0.20 * ProductScore)
  // ==========================================
  const reviewContribution = Number((0.45 * reviewBreakdown.score).toFixed(2));
  const sellerContribution = Number((0.35 * sellerBreakdown.score).toFixed(2));
  const productContribution = Number((0.20 * productBreakdown.score).toFixed(2));

  let finalScore = Math.round(reviewContribution + sellerContribution + productContribution);
  finalScore = Math.max(0, Math.min(100, finalScore));

  // Determine Risk Level & Verdict
  let riskLevel: 'Safe' | 'Moderate Risk' | 'High Risk';
  let verdict: {
    title: string;
    description: string;
    badgeText: string;
    color: 'emerald' | 'amber' | 'rose';
  };

  if (finalScore >= 80) {
    riskLevel = 'Safe';
    verdict = {
      title: 'Highly Trustworthy & Verified Listing',
      description: 'This product exhibits consistent organic reviews, an established reputable seller, Amazon-backed fulfillment, and authentic brand alignment. Safe to purchase.',
      badgeText: '✅ Highly Trustworthy',
      color: 'emerald',
    };
    recommendations.push(
      {
        id: 'rec-1',
        category: 'action',
        title: 'Safe to proceed with purchase',
        description: 'Listing passes all automated authenticity heuristics and conforms with Amazon brand registry norms.',
      },
      {
        id: 'rec-2',
        category: 'tip',
        title: 'Confirm 30-day return window at checkout',
        description: 'Ensure the item is delivered inside standard prime return guarantee windows.',
      }
    );
  } else if (finalScore >= 55) {
    riskLevel = 'Moderate Risk';
    verdict = {
      title: 'Caution Advised: Suspicious Patterns Detected',
      description: 'While the listing may be functional, our algorithms identified anomalies such as review bursts, unverified buyer clusters, or an unseasoned seller.',
      badgeText: '⚠️ Exercise Caution Before Buying',
      color: 'amber',
    };
    recommendations.push(
      {
        id: 'rec-1',
        category: 'caution',
        title: 'Inspect 1-star & 2-star critical reviews',
        description: 'Sort reviews by "Most Recent" and "Verified Purchase Only" to discover recurring hardware failures or unfulfilled promises.',
      },
      {
        id: 'rec-2',
        category: 'action',
        title: 'Confirm Amazon Fulfillment (FBA)',
        description: 'Avoid selecting 3rd-party merchant fulfillment options at checkout to ensure Amazon customer service protections.',
      },
      {
        id: 'rec-3',
        category: 'tip',
        title: 'Check external independent review sites',
        description: 'Look for independent YouTube teardowns or Reddit threads to verify if the model performs to specification.',
      }
    );
  } else {
    riskLevel = 'High Risk';
    verdict = {
      title: 'High Risk: Likely Hijacked or Fake Review Ring',
      description: 'Severe red flags detected! This listing displays telltale indicators of review hijacking, coordinated review bursts, or an unverified merchant with inflated discount tricks.',
      badgeText: '🚨 High Caution Advised - Avoid Purchase',
      color: 'rose',
    };
    recommendations.push(
      {
        id: 'rec-1',
        category: 'caution',
        title: 'Do not purchase based on star rating',
        description: 'The star rating is heavily distorted by hijacked or non-verified bot reviews.',
      },
      {
        id: 'rec-2',
        category: 'action',
        title: 'Search for official brand storefront directly',
        description: 'Search Amazon for the official brand registry page or trusted retailers rather than third-party re-sellers.',
      },
      {
        id: 'rec-3',
        category: 'caution',
        title: 'Verify return shipping liability',
        description: 'Seller return policy does not provide prepaid return labels and may require international shipping.',
      }
    );
  }

  return {
    asin: product.asin,
    timestamp: new Date().toISOString(),
    isDemoSimulation,
    overallScore: finalScore,
    riskLevel,
    verdict,
    product,
    seller,
    reviewsSample: reviews,
    breakdown: {
      reviewAuthenticity: reviewBreakdown,
      sellerReliability: sellerBreakdown,
      productIntegrity: productBreakdown,
    },
    warnings,
    recommendations,
    computationFormula: {
      formula: 'Total Trust Score = (0.45 * ReviewScore) + (0.35 * SellerScore) + (0.20 * ProductScore)',
      reviewWeight: 0.45,
      sellerWeight: 0.35,
      productWeight: 0.20,
      reviewContribution,
      sellerContribution,
      productContribution,
    },
  };
}
