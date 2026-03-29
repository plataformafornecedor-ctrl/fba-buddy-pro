export interface KeepaProduct {
  asin: string;
  title: string;
  currentPrice: number | null;
  fbaPrice: number | null;
  bsr: number | null;
  reviewCount: number | null;
  priceHistory: number[];
  bsrHistory: number[];
  category: string;
  imageUrl: string;
  isAmazonSeller: boolean;
  opportunityScore: number;
}

export interface CompetitorOffer {
  sellerName: string;
  isFBA: boolean;
  price: number;
  stockLevel: number;
  isAmazon: boolean;
}

export interface EligibilityCheck {
  eligible: boolean;
  ipRisk: boolean;
  hazmat: boolean;
  privateLabel: boolean;
  restrictions: boolean;
  variationCount: number;
}

export interface ProductDetail extends KeepaProduct {
  priceHistoryDates: string[];
  bsrHistoryDates: string[];
  sellerCount: number;
  weight: number | null;
  dimensions: string | null;
  realFbaFee: number | null;
  feeSource: 'real' | 'estimated';
  bsrAvg30: number | null;
  bsrAvg90: number | null;
  bsrAvg180: number | null;
  estimatedMonthlySales: number;
  fbaSellers: number;
  fbmSellers: number;
  competitors: CompetitorOffer[];
  eligibility: EligibilityCheck;
}

export interface MarginCalculation {
  sellingPrice: number;
  purchasePrice: number;
  shippingCost: number;
  fbaFee: number;
  referralFee: number;
  vat: number;
  vatRate: number;
  totalCosts: number;
  profit: number;
  margin: number;
  roi: number;
  feeSource: 'real' | 'estimated';
}

export type Marketplace = 'DE' | 'FR' | 'IT' | 'ES' | 'UK';

export const MARKETPLACE_CONFIG: Record<Marketplace, { domain: number; vatRate: number; currency: string; label: string; marketplaceId: string }> = {
  DE: { domain: 3, vatRate: 0.19, currency: '€', label: 'Germany', marketplaceId: 'A1PA6795UKMFR9' },
  FR: { domain: 4, vatRate: 0.20, currency: '€', label: 'France', marketplaceId: 'A13V1IB3VIYZZH' },
  IT: { domain: 8, vatRate: 0.22, currency: '€', label: 'Italy', marketplaceId: 'APJ6JRA9NG5V4' },
  ES: { domain: 9, vatRate: 0.21, currency: '€', label: 'Spain', marketplaceId: 'A1RKKUPIHCS9HS' },
  UK: { domain: 2, vatRate: 0.20, currency: '£', label: 'United Kingdom', marketplaceId: 'A1F83G8C2ARO7P' },
};

export function calculateOpportunityScore(product: Partial<KeepaProduct>): number {
  let score = 0;
  if (product.bsr != null && product.bsr < 50000) score += 30;
  if (product.reviewCount != null && product.reviewCount < 200) score += 25;
  if (product.currentPrice != null && product.currentPrice >= 15 && product.currentPrice <= 60) score += 20;
  if (!product.isAmazonSeller) score += 25;
  return score;
}

export function getScoreClass(score: number): string {
  if (score >= 75) return 'score-excellent';
  if (score >= 50) return 'score-good';
  if (score >= 25) return 'score-medium';
  return 'score-low';
}
