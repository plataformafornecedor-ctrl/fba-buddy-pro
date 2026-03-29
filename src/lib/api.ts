import { KeepaProduct, ProductDetail, Marketplace, MARKETPLACE_CONFIG, calculateOpportunityScore } from './types';
import { supabase } from '@/integrations/supabase/client';

// Mock data for fallback
const MOCK_PRODUCTS: KeepaProduct[] = [
  {
    asin: 'B08N5WRWNW', title: 'Silicone Kitchen Utensils Set', currentPrice: 24.99,
    fbaPrice: 27.99, bsr: 12500, reviewCount: 145, priceHistory: [23, 24, 25, 24, 25, 26, 25, 24, 25],
    bsrHistory: [15000, 14000, 13000, 12500, 13000, 12000, 12500, 12500, 12500],
    category: 'Kitchen', imageUrl: '', isAmazonSeller: false, opportunityScore: 0,
  },
  {
    asin: 'B09XYZ1234', title: 'Bamboo Desk Organizer', currentPrice: 32.50,
    fbaPrice: 35.00, bsr: 8400, reviewCount: 67, priceHistory: [30, 31, 32, 33, 32, 31, 32, 33, 32],
    bsrHistory: [10000, 9500, 9000, 8500, 8400, 8600, 8400, 8300, 8400],
    category: 'Office', imageUrl: '', isAmazonSeller: false, opportunityScore: 0,
  },
  {
    asin: 'B07ABC5678', title: 'LED Strip Lights 5m RGB', currentPrice: 18.99,
    fbaPrice: 21.50, bsr: 3200, reviewCount: 890, priceHistory: [17, 18, 19, 18, 19, 20, 19, 18, 19],
    bsrHistory: [4000, 3800, 3500, 3200, 3100, 3200, 3300, 3200, 3200],
    category: 'Lighting', imageUrl: '', isAmazonSeller: true, opportunityScore: 0,
  },
  {
    asin: 'B0DTEST001', title: 'Yoga Resistance Bands Set', currentPrice: 15.99,
    fbaPrice: 18.50, bsr: 28000, reviewCount: 52, priceHistory: [14, 15, 16, 15, 16, 16, 15, 16, 16],
    bsrHistory: [32000, 30000, 29000, 28000, 27500, 28000, 28500, 28000, 28000],
    category: 'Sports', imageUrl: '', isAmazonSeller: false, opportunityScore: 0,
  },
  {
    asin: 'B0DTEST002', title: 'Stainless Steel Water Bottle 750ml', currentPrice: 19.99,
    fbaPrice: 22.00, bsr: 45000, reviewCount: 180, priceHistory: [18, 19, 20, 19, 20, 21, 20, 19, 20],
    bsrHistory: [50000, 48000, 46000, 45000, 44000, 45000, 46000, 45000, 45000],
    category: 'Kitchen', imageUrl: '', isAmazonSeller: false, opportunityScore: 0,
  },
];

function enrichMockProducts(products: KeepaProduct[]): KeepaProduct[] {
  return products.map(p => ({ ...p, opportunityScore: calculateOpportunityScore(p) }))
    .sort((a, b) => b.opportunityScore - a.opportunityScore);
}

export async function searchProducts(keyword: string, marketplace: Marketplace): Promise<{ products: KeepaProduct[]; isMock: boolean }> {
  try {
    const { data, error } = await supabase.functions.invoke('keepa-search', {
      body: { keyword, domain: MARKETPLACE_CONFIG[marketplace].domain },
    });
    if (error) throw error;
    if (data?.products?.length) {
      const products = data.products.map((p: any) => ({
        ...p,
        opportunityScore: calculateOpportunityScore(p),
      })).sort((a: KeepaProduct, b: KeepaProduct) => b.opportunityScore - a.opportunityScore);
      return { products, isMock: false };
    }
    throw new Error('No products');
  } catch {
    const filtered = MOCK_PRODUCTS.filter(p =>
      p.title.toLowerCase().includes(keyword.toLowerCase()) || keyword.length < 3
    );
    return { products: enrichMockProducts(filtered.length ? filtered : MOCK_PRODUCTS), isMock: true };
  }
}

export async function getProductDetail(asin: string, marketplace: Marketplace): Promise<{ product: ProductDetail; isMock: boolean }> {
  try {
    const { data, error } = await supabase.functions.invoke('keepa-product', {
      body: { asin, domain: MARKETPLACE_CONFIG[marketplace].domain, marketplaceId: MARKETPLACE_CONFIG[marketplace].marketplaceId },
    });
    if (error) throw error;
    return { product: { ...data.product, opportunityScore: calculateOpportunityScore(data.product) }, isMock: false };
  } catch {
    const base = MOCK_PRODUCTS.find(p => p.asin === asin) || MOCK_PRODUCTS[0];
    const now = Date.now();
    const dates = Array.from({ length: 90 }, (_, i) => {
      const d = new Date(now - (89 - i) * 86400000);
      return d.toISOString().slice(0, 10);
    });
    const priceHist = dates.map((_, i) => (base.currentPrice || 25) + Math.sin(i / 10) * 3);
    const bsrHist = dates.map((_, i) => (base.bsr || 10000) + Math.sin(i / 8) * 2000);
    const detail: ProductDetail = {
      ...base,
      priceHistoryDates: dates,
      bsrHistoryDates: dates,
      priceHistory: priceHist,
      bsrHistory: bsrHist,
      sellerCount: 4,
      weight: 0.45,
      dimensions: '25 x 15 x 8 cm',
      realFbaFee: null,
      feeSource: 'estimated',
      opportunityScore: calculateOpportunityScore(base),
    };
    return { product: detail, isMock: true };
  }
}

export async function getAmazonFees(asin: string, price: number, marketplace: Marketplace): Promise<{ fbaFee: number; source: 'real' | 'estimated' }> {
  try {
    const { data, error } = await supabase.functions.invoke('amazon-fees', {
      body: { asin, price, marketplaceId: MARKETPLACE_CONFIG[marketplace].marketplaceId },
    });
    if (error) throw error;
    return { fbaFee: data.fbaFee, source: 'real' };
  } catch {
    // Estimated: ~15% of price as rough FBA fee
    return { fbaFee: Math.round(price * 0.15 * 100) / 100, source: 'estimated' };
  }
}
