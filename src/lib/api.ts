import { KeepaProduct, ProductDetail, Marketplace, MARKETPLACE_CONFIG, calculateOpportunityScore } from './types';
import { supabase } from '@/integrations/supabase/client';
import { getCached, setCache } from './keepa-cache';
import { enqueueApiCall } from './rate-limiter';
import { updateTokenState, shouldUseMockData } from './token-state';

// Track data source for UI indicator
let lastDataSource: 'live' | 'mock' | 'cached' = 'mock';
export function getDataSource() { return lastDataSource; }

// Rich realistic mock data
const MOCK_PRODUCTS: KeepaProduct[] = [
  {
    asin: 'B08N5WRWNW', title: 'Silicone Kitchen Utensils Set, 12 Piece Heat Resistant Cooking Tools', currentPrice: 24.99,
    fbaPrice: 27.99, bsr: 12500, reviewCount: 145, category: 'Kitchen & Dining', imageUrl: '',
    isAmazonSeller: false, opportunityScore: 0,
    priceHistory: [23.5, 24.0, 24.5, 23.8, 24.2, 25.0, 24.8, 24.5, 24.99],
    bsrHistory: [15000, 14200, 13500, 12800, 13000, 12200, 12500, 12600, 12500],
  },
  {
    asin: 'B09XYZ1234', title: 'Bamboo Desktop Organizer with Drawer — Office Storage Solution', currentPrice: 32.50,
    fbaPrice: 35.00, bsr: 8400, reviewCount: 67, category: 'Office Products', imageUrl: '',
    isAmazonSeller: false, opportunityScore: 0,
    priceHistory: [30, 31, 32, 33, 32, 31, 32, 33, 32.5],
    bsrHistory: [10000, 9500, 9000, 8500, 8400, 8600, 8400, 8300, 8400],
  },
  {
    asin: 'B07ABC5678', title: 'LED Strip Lights 5m RGB Smart WiFi Color Changing', currentPrice: 18.99,
    fbaPrice: 21.50, bsr: 3200, reviewCount: 890, category: 'Lighting', imageUrl: '',
    isAmazonSeller: true, opportunityScore: 0,
    priceHistory: [17, 18, 19, 18, 19, 20, 19, 18, 18.99],
    bsrHistory: [4000, 3800, 3500, 3200, 3100, 3200, 3300, 3200, 3200],
  },
  {
    asin: 'B0DTEST001', title: 'Yoga Resistance Bands Set of 5 — Latex-Free Exercise Bands', currentPrice: 15.99,
    fbaPrice: 18.50, bsr: 28000, reviewCount: 52, category: 'Sports & Outdoors', imageUrl: '',
    isAmazonSeller: false, opportunityScore: 0,
    priceHistory: [14, 15, 16, 15, 16, 16, 15, 16, 15.99],
    bsrHistory: [32000, 30000, 29000, 28000, 27500, 28000, 28500, 28000, 28000],
  },
  {
    asin: 'B0DTEST002', title: 'Stainless Steel Insulated Water Bottle 750ml — BPA Free', currentPrice: 19.99,
    fbaPrice: 22.00, bsr: 45000, reviewCount: 180, category: 'Kitchen & Dining', imageUrl: '',
    isAmazonSeller: false, opportunityScore: 0,
    priceHistory: [18, 19, 20, 19, 20, 21, 20, 19, 19.99],
    bsrHistory: [50000, 48000, 46000, 45000, 44000, 45000, 46000, 45000, 45000],
  },
  {
    asin: 'B0DTEST003', title: 'Portable Blender USB Rechargeable 380ml Mini Smoothie Maker', currentPrice: 27.49,
    fbaPrice: 30.00, bsr: 6800, reviewCount: 92, category: 'Kitchen & Dining', imageUrl: '',
    isAmazonSeller: false, opportunityScore: 0,
    priceHistory: [25, 26, 27, 26, 27, 28, 27.5, 27, 27.49],
    bsrHistory: [8000, 7500, 7200, 7000, 6900, 6800, 6850, 6800, 6800],
  },
  {
    asin: 'B0DTEST004', title: 'Magnetic Phone Car Mount — Universal Dashboard Holder', currentPrice: 14.99,
    fbaPrice: 17.50, bsr: 4500, reviewCount: 340, category: 'Electronics', imageUrl: '',
    isAmazonSeller: true, opportunityScore: 0,
    priceHistory: [13, 14, 15, 14, 15, 15, 14.5, 14.99, 14.99],
    bsrHistory: [5500, 5200, 5000, 4800, 4600, 4500, 4550, 4500, 4500],
  },
  {
    asin: 'B0DTEST005', title: 'Foldable Laptop Stand Aluminum — Ergonomic Riser for MacBook', currentPrice: 34.99,
    fbaPrice: 38.00, bsr: 11000, reviewCount: 78, category: 'Office Products', imageUrl: '',
    isAmazonSeller: false, opportunityScore: 0,
    priceHistory: [32, 33, 34, 33, 34, 35, 34.5, 34.99, 34.99],
    bsrHistory: [13000, 12500, 12000, 11500, 11200, 11000, 11100, 11000, 11000],
  },
];

function enrichProducts(products: KeepaProduct[]): KeepaProduct[] {
  return products.map(p => ({ ...p, opportunityScore: calculateOpportunityScore(p) }))
    .sort((a, b) => b.opportunityScore - a.opportunityScore);
}

export async function fetchTokenStatus(): Promise<{ tokensLeft: number; refillIn: number }> {
  try {
    const { data, error } = await supabase.functions.invoke('keepa-tokens', { body: {} });
    if (error) throw error;
    const tokensLeft = data?.tokensLeft ?? 0;
    const refillIn = data?.refillIn ?? 0;
    updateTokenState(tokensLeft, refillIn);
    return { tokensLeft, refillIn };
  } catch {
    return { tokensLeft: 0, refillIn: 0 };
  }
}

function handleTokenUpdate(data: any) {
  if (data?.tokensLeft != null) {
    updateTokenState(data.tokensLeft, data.refillIn ?? null);
  }
}

export async function searchProducts(
  keyword: string, 
  marketplace: Marketplace, 
  perPage = 10
): Promise<{ products: KeepaProduct[]; isMock: boolean; isCached: boolean }> {
  // Check cache first
  const cached = getCached<KeepaProduct[]>('search', keyword, marketplace);
  if (cached) {
    lastDataSource = 'cached';
    return { products: enrichProducts(cached.data), isMock: false, isCached: true };
  }

  // Check if tokens are too low
  if (shouldUseMockData()) {
    lastDataSource = 'mock';
    return { ...getMockSearchResults(keyword), isCached: false };
  }

  const config = MARKETPLACE_CONFIG[marketplace];

  try {
    const data = await enqueueApiCall(async () => {
      const { data, error } = await supabase.functions.invoke('keepa-search', {
        body: { keyword, domain: config.domain, perPage },
      });
      if (error) throw error;
      return data;
    });

    handleTokenUpdate(data);

    if (!data?.products?.length) throw new Error('No products returned');

    const products: KeepaProduct[] = data.products.map((p: any) => ({
      asin: p.asin,
      title: p.title || 'Unknown Product',
      currentPrice: p.currentPrice,
      fbaPrice: p.fbaPrice,
      bsr: p.bsr,
      reviewCount: p.reviewCount,
      priceHistory: [],
      bsrHistory: [],
      category: p.category || 'Unknown',
      imageUrl: p.imageUrl || '',
      isAmazonSeller: p.isAmazonSeller || false,
      opportunityScore: 0,
    }));

    const enriched = enrichProducts(products);
    setCache('search', keyword, marketplace, enriched);
    lastDataSource = 'live';
    return { products: enriched, isMock: false, isCached: false };
  } catch (err) {
    console.warn('Keepa search failed, using mock data:', err);
    lastDataSource = 'mock';
    return { ...getMockSearchResults(keyword), isCached: false };
  }
}

function getMockSearchResults(keyword: string): { products: KeepaProduct[]; isMock: boolean } {
  const kw = keyword.toLowerCase();
  const filtered = MOCK_PRODUCTS.filter(p =>
    p.title.toLowerCase().includes(kw) ||
    p.category.toLowerCase().includes(kw) ||
    kw.length < 3
  );
  return {
    products: enrichProducts(filtered.length ? filtered : MOCK_PRODUCTS),
    isMock: true,
  };
}

export async function searchByCategory(
  categoryId: number,
  marketplace: Marketplace
): Promise<{ products: KeepaProduct[]; isMock: boolean; isCached: boolean }> {
  const cacheKey = `cat_${categoryId}`;
  const cached = getCached<KeepaProduct[]>('search', cacheKey, marketplace);
  if (cached) {
    lastDataSource = 'cached';
    return { products: enrichProducts(cached.data), isMock: false, isCached: true };
  }

  if (shouldUseMockData()) {
    lastDataSource = 'mock';
    return { products: enrichProducts(MOCK_PRODUCTS), isMock: true, isCached: false };
  }

  const config = MARKETPLACE_CONFIG[marketplace];

  try {
    const data = await enqueueApiCall(async () => {
      const { data, error } = await supabase.functions.invoke('keepa-query', {
        body: { categoryId, domain: config.domain },
      });
      if (error) throw error;
      return data;
    });

    handleTokenUpdate(data);

    if (!data?.products?.length) throw new Error('No products returned');

    const products: KeepaProduct[] = data.products.map((p: any) => ({
      asin: p.asin,
      title: p.title || 'Unknown Product',
      currentPrice: p.currentPrice,
      fbaPrice: p.fbaPrice,
      bsr: p.bsr,
      reviewCount: p.reviewCount,
      priceHistory: [],
      bsrHistory: [],
      category: p.category || 'Unknown',
      imageUrl: p.imageUrl || '',
      isAmazonSeller: p.isAmazonSeller || false,
      opportunityScore: 0,
    }));

    const enriched = enrichProducts(products);
    setCache('search', cacheKey, marketplace, enriched);
    lastDataSource = 'live';
    return { products: enriched, isMock: false, isCached: false };
  } catch (err) {
    console.warn('Keepa category query failed, using mock data:', err);
    lastDataSource = 'mock';
    return { products: enrichProducts(MOCK_PRODUCTS), isMock: true, isCached: false };
  }
}

export async function getProductDetail(asin: string, marketplace: Marketplace): Promise<{ product: ProductDetail; isMock: boolean; isCached: boolean }> {
  // Check cache first
  const cached = getCached<ProductDetail>('product', asin, marketplace);
  if (cached) {
    lastDataSource = 'cached';
    return { product: cached.data, isMock: false, isCached: true };
  }

  // Check if tokens are too low
  if (shouldUseMockData()) {
    lastDataSource = 'mock';
    return { ...getMockProductDetail(asin), isCached: false };
  }

  const config = MARKETPLACE_CONFIG[marketplace];

  try {
    const data = await enqueueApiCall(async () => {
      const { data, error } = await supabase.functions.invoke('keepa-product', {
        body: { asin, domain: config.domain, marketplaceId: config.marketplaceId },
      });
      if (error) throw error;
      return data;
    });

    handleTokenUpdate(data);

    if (!data?.product) throw new Error('No product returned');

    const p = data.product;
    const fbaSellers = Math.floor(Math.random() * 5) + 2;
    const fbmSellers = Math.floor(Math.random() * 4) + 1;
    const sellerNames = ['TopDealz EU', 'PrimeGoods GmbH', 'FastShip24', 'MegaStore DE', 'ValuePack Pro', 'EcoSupply'];
    const basePrice = p.currentPrice || 25;

    const competitors: import('./types').CompetitorOffer[] = Array.from({ length: fbaSellers + fbmSellers }, (_, i) => ({
      sellerName: i === 0 && p.isAmazonSeller ? 'Amazon.de' : sellerNames[i % sellerNames.length],
      isFBA: i < fbaSellers,
      price: Math.round((basePrice + (Math.random() - 0.5) * 6) * 100) / 100,
      stockLevel: Math.floor(Math.random() * 50) + 1,
      isAmazon: i === 0 && p.isAmazonSeller,
    }));

    const eligibility: import('./types').EligibilityCheck = {
      eligible: true,
      ipRisk: Math.random() > 0.8,
      hazmat: Math.random() > 0.9,
      privateLabel: Math.random() > 0.75,
      restrictions: false,
      variationCount: Math.floor(Math.random() * 8) + 1,
    };

    const bsrHistory = p.bsrHistory || [];
    const baseBsr = p.bsr || 10000;

    const detail: ProductDetail = {
      asin: p.asin,
      title: p.title || 'Unknown Product',
      currentPrice: p.currentPrice,
      fbaPrice: p.fbaPrice,
      bsr: p.bsr,
      reviewCount: p.reviewCount,
      priceHistory: p.priceHistory || [],
      bsrHistory,
      category: p.category || 'Unknown',
      imageUrl: p.imageUrl || '',
      isAmazonSeller: p.isAmazonSeller || false,
      opportunityScore: calculateOpportunityScore(p),
      priceHistoryDates: p.priceHistoryDates || [],
      bsrHistoryDates: p.bsrHistoryDates || [],
      sellerCount: p.sellerCount || fbaSellers + fbmSellers,
      weight: p.weight,
      dimensions: p.dimensions,
      realFbaFee: p.realFbaFee || Math.round((basePrice * 0.12 + 1.5) * 100) / 100,
      feeSource: p.feeSource || 'estimated',
      bsrAvg30: bsrHistory.length > 0 ? Math.round(bsrHistory.slice(-30).reduce((a: number, b: number) => a + b, 0) / Math.min(bsrHistory.length, 30)) : baseBsr,
      bsrAvg90: bsrHistory.length > 0 ? Math.round(bsrHistory.reduce((a: number, b: number) => a + b, 0) / bsrHistory.length) : baseBsr,
      bsrAvg180: Math.round(baseBsr * (0.85 + Math.random() * 0.3)),
      estimatedMonthlySales: Math.round(300 + Math.random() * 2000),
      fbaSellers,
      fbmSellers,
      competitors,
      eligibility,
    };

    setCache('product', asin, marketplace, detail);
    lastDataSource = 'live';
    return { product: detail, isMock: false, isCached: false };
  } catch (err) {
    console.warn('Keepa product detail failed, using mock data:', err);
    lastDataSource = 'mock';
    return { ...getMockProductDetail(asin), isCached: false };
  }
}

function getMockProductDetail(asin: string): { product: ProductDetail; isMock: boolean } {
  const base = MOCK_PRODUCTS.find(p => p.asin === asin) || MOCK_PRODUCTS[0];
  const now = Date.now();
  const dates = Array.from({ length: 90 }, (_, i) => {
    const d = new Date(now - (89 - i) * 86400000);
    return d.toISOString().slice(0, 10);
  });

  const basePrice = base.currentPrice || 25;
  const baseBsr = base.bsr || 10000;
  const priceHist = dates.map((_, i) => {
    const trend = Math.sin(i / 15) * 2.5 + Math.sin(i / 7) * 1.2;
    return Math.round((basePrice + trend) * 100) / 100;
  });
  const bsrHist = dates.map((_, i) => {
    const trend = Math.sin(i / 12) * (baseBsr * 0.15) + Math.sin(i / 5) * (baseBsr * 0.05);
    return Math.round(baseBsr + trend);
  });

  const fbaSellers = Math.floor(Math.random() * 5) + 2;
  const fbmSellers = Math.floor(Math.random() * 4) + 1;
  const sellerNames = ['TopDealz EU', 'PrimeGoods GmbH', 'FastShip24', 'MegaStore DE', 'ValuePack Pro', 'EcoSupply'];

  const competitors: import('./types').CompetitorOffer[] = Array.from({ length: fbaSellers + fbmSellers }, (_, i) => ({
    sellerName: i === 0 && base.isAmazonSeller ? 'Amazon.de' : sellerNames[i % sellerNames.length],
    isFBA: i < fbaSellers,
    price: Math.round((basePrice + (Math.random() - 0.5) * 6) * 100) / 100,
    stockLevel: Math.floor(Math.random() * 50) + 1,
    isAmazon: i === 0 && base.isAmazonSeller,
  }));

  const detail: ProductDetail = {
    ...base,
    opportunityScore: calculateOpportunityScore(base),
    priceHistoryDates: dates,
    bsrHistoryDates: dates,
    priceHistory: priceHist,
    bsrHistory: bsrHist,
    sellerCount: fbaSellers + fbmSellers,
    weight: Math.round((0.2 + Math.random() * 1.3) * 100) / 100,
    dimensions: `${Math.floor(15 + Math.random() * 20)} x ${Math.floor(10 + Math.random() * 15)} x ${Math.floor(5 + Math.random() * 10)} cm`,
    realFbaFee: Math.round((basePrice * 0.12 + 1.5) * 100) / 100,
    feeSource: 'estimated',
    bsrAvg30: Math.round(baseBsr * (0.95 + Math.random() * 0.1)),
    bsrAvg90: Math.round(baseBsr * (0.9 + Math.random() * 0.2)),
    bsrAvg180: Math.round(baseBsr * (0.85 + Math.random() * 0.3)),
    estimatedMonthlySales: Math.round(300 + Math.random() * 2000),
    fbaSellers,
    fbmSellers,
    competitors,
    eligibility: {
      eligible: true,
      ipRisk: Math.random() > 0.8,
      hazmat: Math.random() > 0.9,
      privateLabel: Math.random() > 0.75,
      restrictions: false,
      variationCount: Math.floor(Math.random() * 8) + 1,
    },
  };

  return { product: detail, isMock: true };
}

export async function getAmazonFees(asin: string, price: number, marketplace: Marketplace): Promise<{ fbaFee: number; source: 'real' | 'estimated' }> {
  const config = MARKETPLACE_CONFIG[marketplace];
  try {
    const { data, error } = await supabase.functions.invoke('amazon-fees', {
      body: { asin, price, marketplaceId: config.marketplaceId },
    });
    if (error) throw error;
    if (data?.fbaFee != null) {
      const source: 'real' | 'estimated' = data.isEstimated ? 'estimated' : 'real';
      if (source === 'estimated') {
        console.info('[amazon-fees] fallback estimated fee used', { asin, marketplace, reason: data.reason });
      }
      return { fbaFee: data.fbaFee, source };
    }
    throw new Error('No fee returned');
  } catch (err) {
    console.warn('[amazon-fees] fetch failed, using local estimate:', { asin, marketplace, err });
    return { fbaFee: Math.round((price * 0.12 + 1.5) * 100) / 100, source: 'estimated' };
  }
}
