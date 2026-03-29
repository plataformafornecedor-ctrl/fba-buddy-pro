import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Marketplace, MARKETPLACE_CONFIG } from '@/lib/types';
import { searchProducts } from '@/lib/api';
import ProductRow from '@/components/ProductRow';
import { ProductTableSkeleton } from '@/components/Skeletons';
import { MockDataBanner } from '@/components/MockDataBanner';

interface ProductFinderProps {
  onAnalyze: (asin: string, marketplace: Marketplace) => void;
}

export default function ProductFinder({ onAnalyze }: ProductFinderProps) {
  const [keyword, setKeyword] = useState('');
  const [marketplace, setMarketplace] = useState<Marketplace>('DE');
  const [searchTrigger, setSearchTrigger] = useState<{ keyword: string; marketplace: Marketplace } | null>(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['product-search', searchTrigger],
    queryFn: () => searchProducts(searchTrigger!.keyword, searchTrigger!.marketplace),
    enabled: !!searchTrigger,
    staleTime: 60000,
  });

  const handleSearch = () => {
    if (keyword.trim()) {
      setSearchTrigger({ keyword: keyword.trim(), marketplace });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Product Finder</h1>
        <p className="text-sm text-muted-foreground mt-1">Search Amazon products and discover opportunities</p>
      </div>

      {/* Search bar */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search keywords (e.g. silicone kitchen utensils)"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Select value={marketplace} onValueChange={v => setMarketplace(v as Marketplace)}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MARKETPLACE_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSearch} disabled={!keyword.trim() || isLoading}>
            {isFetching ? (
              <span className="flex items-center gap-2"><Filter className="w-4 h-4 animate-pulse-subtle" /> Fetching...</span>
            ) : (
              <span className="flex items-center gap-2"><Search className="w-4 h-4" /> Search</span>
            )}
          </Button>
        </div>
      </div>

      {/* Results */}
      {data?.isMock && <MockDataBanner />}

      {isLoading ? (
        <ProductTableSkeleton />
      ) : data?.products ? (
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">{data.products.length} products found</div>
          {data.products.map(product => (
            <ProductRow
              key={product.asin}
              product={product}
              marketplace={marketplace}
              onAnalyze={(asin) => onAnalyze(asin, marketplace)}
            />
          ))}
        </div>
      ) : searchTrigger ? (
        <div className="text-center py-12 text-muted-foreground">No products found. Try a different keyword.</div>
      ) : (
        <div className="text-center py-20">
          <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Enter a keyword to search for Amazon FBA product opportunities</p>
        </div>
      )}
    </div>
  );
}
