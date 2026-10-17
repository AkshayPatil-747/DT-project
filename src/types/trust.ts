export interface AmazonProduct {
  asin: string;
  title: string;
  brand: string;
  storefrontBrand: string;
  category: string;
  price: number;
  msrp: number;
  discountPercentage: number;
  imageUrl: string;
  productUrl: string;
  returnPolicy: string; // e.g. "Eligible for 30-day replacement/refund"
  hasOfficialBadge: boolean;
  listingAgeMonths: number;
  ratingAverage: number;
  totalRatingsCount: number;
}

export interface AmazonSeller {
  name: string;
  isFBA: boolean; // Fulfilled by Amazon
  isSoldByAmazon: boolean;
  positiveFeedbackRate: number; // e.g. 96 for 96%
  totalRatings: number;
  accountAgeMonths: number;
  shipsFrom: string;
  businessAddress?: string;
}

export interface AmazonReview {
  id: string;
  author: string;
  rating: number; // 1-5
  date: string; // ISO date
  title: string;
  content: string;
  isVerified: boolean;
  helpfulVotes: number;
  detectedKeywords?: string[];
  isFlaggedSuspicious?: boolean;
  suspicionReason?: string;
}

export interface RatingDistribution {
  fiveStar: number; // percentage, e.g. 68
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
}

export interface ReviewScoreBreakdown {
  score: number; // 0 - 100
  verifiedRatio: number; // 0 - 100%
  verifiedPenalty: number;
  burstDetected: boolean;
  burstPercentage: number;
  burstWindowHours: number;
  burstPenalty: number;
  repeatedPhraseCount: number;
  repeatedPhrases: { phrase: string; count: number }[];
  repetitionPenalty: number;
  hijackingDetected: boolean;
  hijackedKeywordsFound: string[];
  hijackingPenalty: number;
  bimodalDetected: boolean;
  bimodalPenalty: number;
  ratingDistribution: RatingDistribution;
  details: string[];
}

export interface SellerScoreBreakdown {
  score: number; // 0 - 100
  fulfillmentType: 'Sold & Shipped by Amazon' | 'Fulfilled by Amazon (FBA)' | 'Third-Party Merchant (FBM)';
  fulfillmentPoints: number; // up to 30
  sellerRating: number; // percentage
  sellerRatingPoints: number; // up to 40
  sellerMaturityPoints: number; // up to 30
  sellerTotalRatings: number;
  details: string[];
}

export interface ProductScoreBreakdown {
  score: number; // 0 - 100
  brandMatch: boolean;
  brandPoints: number; // up to 50
  priceAnomalyDetected: boolean;
  marketAveragePrice: number;
  priceDeduction: number;
  hasOfficialBadge: boolean;
  returnPolicyValid: boolean;
  returnPoints: number; // up to 50
  details: string[];
}

export interface TrustWarning {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  badge: string;
  impactScoreDeduction: number;
}

export interface BuyerRecommendation {
  id: string;
  category: 'caution' | 'tip' | 'action';
  title: string;
  description: string;
}

export interface TrustAnalysisResult {
  asin: string;
  timestamp: string;
  isDemoSimulation: boolean;
  overallScore: number; // 0 - 100
  riskLevel: 'Safe' | 'Moderate Risk' | 'High Risk';
  verdict: {
    title: string;
    description: string;
    badgeText: string;
    color: 'emerald' | 'amber' | 'rose';
  };
  product: AmazonProduct;
  seller: AmazonSeller;
  reviewsSample: AmazonReview[];
  breakdown: {
    reviewAuthenticity: ReviewScoreBreakdown;
    sellerReliability: SellerScoreBreakdown;
    productIntegrity: ProductScoreBreakdown;
  };
  warnings: TrustWarning[];
  recommendations: BuyerRecommendation[];
  computationFormula: {
    formula: string;
    reviewWeight: number;
    sellerWeight: number;
    productWeight: number;
    reviewContribution: number;
    sellerContribution: number;
    productContribution: number;
  };
}

export interface HistoryItem {
  id: string;
  asin: string;
  productTitle: string;
  productImage: string;
  price: number;
  overallScore: number;
  riskLevel: 'Safe' | 'Moderate Risk' | 'High Risk';
  analyzedAt: string;
  sellerName: string;
}
