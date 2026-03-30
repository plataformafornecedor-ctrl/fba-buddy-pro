import { KeepaProduct, getScoreClass, Marketplace, MARKETPLACE_CONFIG } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { TrendingUp, Eye } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface ProductRowProps {
  product: KeepaProduct;
  marketplace: Marketplace;
  onAnalyze: (asin: string) => void;
}

export default function ProductRow({ product, marketplace, onAnalyze }: ProductRowProps) {
  const { t } = useLanguage();
  const currency = MARKETPLACE_CONFIG[marketplace].currency;

  return (
    <div className="glass-card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-semibold text-sm truncate">{product.title}</h3>
        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span>ASIN: {product.asin}</span>
          <span>{product.category}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="text-center px-3">
          <div className="text-xs text-muted-foreground">{t('product.price')}</div>
          <div className="font-semibold">{product.currentPrice != null ? `${currency}${product.currentPrice.toFixed(2)}` : '—'}</div>
        </div>
        <div className="text-center px-3">
          <div className="text-xs text-muted-foreground">{t('product.bsr')}</div>
          <div className="font-semibold">{product.bsr != null ? product.bsr.toLocaleString() : '—'}</div>
        </div>
        <div className="text-center px-3">
          <div className="text-xs text-muted-foreground">{t('product.reviews')}</div>
          <div className="font-semibold">{product.reviewCount ?? '—'}</div>
        </div>
        <div className="text-center px-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {t('product.score')}</div>
          <div className={`score-badge ${getScoreClass(product.opportunityScore)}`}>
            {product.opportunityScore}
          </div>
        </div>
      </div>

      <Button size="sm" onClick={() => onAnalyze(product.asin)} className="shrink-0">
        <Eye className="w-3.5 h-3.5 mr-1" />
        {t('finder.analyze')}
      </Button>
    </div>
  );
}
