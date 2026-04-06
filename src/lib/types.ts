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

/** Clean product title: remove dimensions, truncate to 60 chars */
export function cleanTitle(title: string): string {
  let cleaned = title
    .replace(/\b\d{1,4}\s*[xX×]\s*\d{1,4}(\s*[xX×]\s*\d{1,4})?\s*(cm|mm|m|inch|in|zoll)?\b/gi, '')
    .replace(/\b\d{1,4}\s*(cm|mm|m|inch|in|zoll)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  if (cleaned.length > 60) {
    cleaned = cleaned.substring(0, 57) + '…';
  }
  return cleaned;
}

/** Detect if title is likely German */
export function isGermanTitle(title: string): boolean {
  const germanWords = /\b(für|mit|und|aus|oder|nicht|Küche|Stück|Edelstahl|Silikon|Haushalt|Zubehör|Geschenk|Klein|Groß)\b/i;
  return germanWords.test(title);
}

/** Filter out bad products */
export function filterValidProducts(products: KeepaProduct[]): KeepaProduct[] {
  return products.filter(p => {
    if (!p.asin) return false;
    if (!p.title || p.title.length < 10) return false;
    if (p.currentPrice != null && p.currentPrice <= 0) return false;
    return true;
  });
}

const KITCHEN_CATEGORIES = ['kitchen', 'küche', 'cocina', 'cucina', 'cuisine'];

export function calculateOpportunityScore(product: Partial<KeepaProduct>): number {
  let score = 0;

  // BSR: +30 if has BSR data and < 50000
  if (product.bsr != null && product.bsr > 0) {
    score += product.bsr < 50000 ? 30 : 15;
  }
  // No BSR = +0

  // Reviews
  if (product.reviewCount != null) {
    if (product.reviewCount < 300) score += 25;
    else if (product.reviewCount < 1000) score += 10;
  } else {
    score += 10; // unknown = neutral
  }

  // Price range
  if (product.currentPrice != null) {
    if (product.currentPrice >= 15 && product.currentPrice <= 60) score += 20;
    else score += 10;
  }

  // Category not kitchen-dominated
  const cat = (product.category || '').toLowerCase();
  const isKitchen = KITCHEN_CATEGORIES.some(k => cat.includes(k));
  if (!isKitchen) score += 25;
  else score += 5;

  // Amazon not selling
  if (!product.isAmazonSeller) score += 0; // removed from score to allow variation

  return Math.min(score, 100);
}

export function getScoreClass(score: number): string {
  if (score >= 75) return 'score-excellent';
  if (score >= 50) return 'score-good';
  if (score >= 25) return 'score-medium';
  return 'score-low';
}
