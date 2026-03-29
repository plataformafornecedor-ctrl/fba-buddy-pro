import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, AlertTriangle, Package, BarChart3, DollarSign, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Marketplace, MARKETPLACE_CONFIG, getScoreClass } from '@/lib/types';
import { getProductDetail } from '@/lib/api';
import { DetailSkeleton } from '@/components/Skeletons';
import { MockDataBanner } from '@/components/MockDataBanner';
import PriceHistoryChart from '@/components/PriceHistoryChart';

interface ProductDetailViewProps {
  asin: string;
  marketplace: Marketplace;
  onBack: () => void;
  onOpenCalculator: (data: { price: number; fbaFee: number; weight: number | null; category: string; feeSource: 'real' | 'estimated' }) => void;
}

export default function ProductDetailView({ asin, marketplace, onBack, onOpenCalculator }: ProductDetailViewProps) {
  const currency = MARKETPLACE_CONFIG[marketplace].currency;

  const { data, isLoading } = useQuery({
    queryKey: ['product-detail', asin, marketplace],
    queryFn: () => getProductDetail(asin, marketplace),
  });

  if (isLoading) return <DetailSkeleton />;

  const product = data?.product;
  if (!product) return <div className="text-center py-12 text-muted-foreground">Product not found</div>;

  const stats = [
    { label: 'Current Price', value: product.currentPrice != null ? `${currency}${product.currentPrice.toFixed(2)}` : '—', icon: <DollarSign className="w-4 h-4" /> },
    { label: 'BSR', value: product.bsr?.toLocaleString() ?? '—', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Reviews', value: product.reviewCount?.toString() ?? '—', icon: <Users className="w-4 h-4" /> },
    { label: 'Sellers', value: product.sellerCount?.toString() ?? '—', icon: <Package className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-display font-bold truncate">{product.title}</h1>
          <span className="text-sm text-muted-foreground">ASIN: {product.asin} • {product.category}</span>
        </div>
        <div className={`score-badge text-base px-4 py-1.5 ${getScoreClass(product.opportunityScore)}`}>
          Score: {product.opportunityScore}
        </div>
      </div>

      {data?.isMock && <MockDataBanner />}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="glass-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">{s.icon}{s.label}</div>
            <div className="text-xl font-display font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Flags */}
      <div className="flex flex-wrap gap-3">
        {product.isAmazonSeller && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5" /> Amazon is a seller — High Competition
          </div>
        )}
        {!product.isAmazonSeller && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Amazon is not selling
          </div>
        )}
        {product.weight && (
          <div className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium">
            Weight: {product.weight} kg
          </div>
        )}
        {product.dimensions && (
          <div className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium">
            {product.dimensions}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="glass-card p-4">
        <h2 className="font-display font-semibold mb-4">Price & BSR History (90 days)</h2>
        <PriceHistoryChart
          dates={product.priceHistoryDates || []}
          prices={product.priceHistory}
          bsr={product.bsrHistory}
          currency={currency}
        />
      </div>

      {/* Open calculator */}
      <Button
        className="w-full"
        size="lg"
        onClick={() => onOpenCalculator({
          price: product.currentPrice || 0,
          fbaFee: product.realFbaFee || (product.currentPrice ? product.currentPrice * 0.15 : 5),
          weight: product.weight,
          category: product.category,
          feeSource: product.feeSource,
        })}
      >
        Open in Margin Calculator
      </Button>
    </div>
  );
}
