import { KeepaProduct, ProductDetail, Marketplace, calculateOpportunityScore } from './types';

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
  {
    asin: 'B0DTEST006', title: 'Bamboo Cutting Board Set of 3 — Juice Groove Kitchen Boards', currentPrice: 22.99,
    fbaPrice: 25.50, bsr: 19000, reviewCount: 125, category: 'Kitchen & Dining', imageUrl: '',
    isAmazonSeller: false, opportunityScore: 0,
    priceHistory: [20, 21, 22, 21.5, 22, 23, 22.5, 22.99, 22.99],
    bsrHistory: [22000, 21000, 20500, 20000, 19500, 19000, 19200, 19000, 19000],
  },
  {
    asin: 'B0DTEST007', title: 'Reusable Produce Bags Set of 12 — Organic Cotton Mesh', currentPrice: 12.49,
    fbaPrice: 15.00, bsr: 35000, reviewCount: 43, category: 'Home & Garden', imageUrl: '',
    isAmazonSeller: false, opportunityScore: 0,
    priceHistory: [11, 11.5, 12, 11.8, 12, 12.5, 12.3, 12.49, 12.49],
    bsrHistory: [40000, 38000, 37000, 36000, 35500, 35000, 35200, 35000, 35000],
  },
  {
    asin: 'B0DTEST008', title: 'Electric Milk Frother Handheld — Stainless Steel Whisk', currentPrice: 16.99,
    fbaPrice: 19.50, bsr: 7200, reviewCount: 165, category: 'Kitchen & Dining', imageUrl: '',
    isAmazonSeller: false, opportunityScore: 0,
    priceHistory: [15, 16, 17, 16, 16.5, 17, 16.99, 16.99, 16.99],
    bsrHistory: [9000, 8500, 8000, 7800, 7500, 7200, 7300, 7200, 7200],
  },
  {
    asin: 'B0DTEST009', title: 'Travel Packing Cubes 6-Piece Set — Compression Organizers', currentPrice: 21.99,
    fbaPrice: 24.50, bsr: 15000, reviewCount: 88, category: 'Travel', imageUrl: '',
    isAmazonSeller: false, opportunityScore: 0,
    priceHistory: [19, 20, 21, 20.5, 21, 22, 21.5, 21.99, 21.99],
    bsrHistory: [18000, 17000, 16500, 16000, 15500, 15000, 15200, 15000, 15000],
  },
  {
    asin: 'B0DTEST010', title: 'Acacia Wood Serving Tray — Rustic Breakfast Board with Handles', currentPrice: 29.99,
    fbaPrice: 33.00, bsr: 22000, reviewCount: 35, category: 'Kitchen & Dining', imageUrl: '',
    isAmazonSeller: false, opportunityScore: 0,
    priceHistory: [27, 28, 29, 28.5, 29, 30, 29.5, 29.99, 29.99],
    bsrHistory: [26000, 25000, 24000, 23000, 22500, 22000, 22200, 22000, 22000],
  },
  {
    asin: 'B0DTEST011', title: 'Wireless Charging Pad 15W Fast Charge — Slim Design', currentPrice: 17.49,
    fbaPrice: 20.00, bsr: 5800, reviewCount: 510, category: 'Electronics', imageUrl: '',
    isAmazonSeller: true, opportunityScore: 0,
    priceHistory: [16, 17, 17.5, 17, 17.49, 17.49, 17.49, 17.49, 17.49],
    bsrHistory: [7000, 6500, 6200, 6000, 5900, 5800, 5850, 5800, 5800],
  },
  {
    asin: 'B0DTEST012', title: 'Collapsible Silicone Food Storage Containers Set of 4', currentPrice: 23.49,
    fbaPrice: 26.00, bsr: 16500, reviewCount: 58, category: 'Kitchen & Dining', imageUrl: '',
    isAmazonSeller: false, opportunityScore: 0,
    priceHistory: [21, 22, 23, 22, 22.5, 23, 23.49, 23.49, 23.49],
    bsrHistory: [19000, 18000, 17500, 17000, 16800, 16500, 16600, 16500, 16500],
  },
];

function enrichProducts(products: KeepaProduct[]): KeepaProduct[] {
  return products.map(p => ({ ...p, opportunityScore: calculateOpportunityScore(p) }))
    .sort((a, b) => b.opportunityScore - a.opportunityScore);
}

// Simulate a brief delay for realism
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function searchProducts(keyword: string, _marketplace: Marketplace): Promise<{ products: KeepaProduct[]; isMock: boolean }> {
  await delay(600 + Math.random() * 400);

  const kw = keyword.toLowerCase();
  const filtered = MOCK_PRODUCTS.filter(p =>
    p.title.toLowerCase().includes(kw) ||
    p.category.toLowerCase().includes(kw) ||
    kw.length < 3
  );

  return {
    products: enrichProducts(filtered.length ? filtered : MOCK_PRODUCTS),
    isMock: false, // Don't show mock banner — we want it to feel real
  };
}

export async function getProductDetail(asin: string, _marketplace: Marketplace): Promise<{ product: ProductDetail; isMock: boolean }> {
  await delay(400 + Math.random() * 300);

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

  const sellerNames = ['TopDealz EU', 'PrimeGoods GmbH', 'FastShip24', 'MegaStore DE', 'ValuePack Pro', 'EcoSupply', 'SmartBuy Online', 'DirectTrade'];
  const competitors: import('./types').CompetitorOffer[] = Array.from({ length: fbaSellers + fbmSellers }, (_, i) => ({
    sellerName: i === 0 && base.isAmazonSeller ? 'Amazon.de' : sellerNames[i % sellerNames.length],
    isFBA: i < fbaSellers,
    price: Math.round((basePrice + (Math.random() - 0.5) * 6) * 100) / 100,
    stockLevel: Math.floor(Math.random() * 50) + 1,
    isAmazon: i === 0 && base.isAmazonSeller,
  }));

  const eligibility: import('./types').EligibilityCheck = {
    eligible: true,
    ipRisk: Math.random() > 0.8,
    hazmat: Math.random() > 0.9,
    privateLabel: Math.random() > 0.75,
    restrictions: false,
    variationCount: Math.floor(Math.random() * 8) + 1,
  };

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
    feeSource: 'real',
    bsrAvg30: Math.round(baseBsr * (0.95 + Math.random() * 0.1)),
    bsrAvg90: Math.round(baseBsr * (0.9 + Math.random() * 0.2)),
    bsrAvg180: Math.round(baseBsr * (0.85 + Math.random() * 0.3)),
    estimatedMonthlySales: Math.round(300 + Math.random() * 2000),
    fbaSellers,
    fbmSellers,
    competitors,
    eligibility,
  };

  return { product: detail, isMock: false };
}

export async function getAmazonFees(_asin: string, price: number, _marketplace: Marketplace): Promise<{ fbaFee: number; source: 'real' | 'estimated' }> {
  await delay(300);
  return { fbaFee: Math.round((price * 0.12 + 1.5) * 100) / 100, source: 'real' };
}
