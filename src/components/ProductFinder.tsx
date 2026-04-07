import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, ChevronDown, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Marketplace, MARKETPLACE_CONFIG, filterValidProducts, calculateOpportunityScore } from '@/lib/types';
import { searchProducts, searchByCategory } from '@/lib/api';
import ProductRow from '@/components/ProductRow';
import { ProductTableSkeleton } from '@/components/Skeletons';
import { MockDataBanner } from '@/components/MockDataBanner';
import { useLanguage } from '@/lib/i18n';

interface ProductFinderProps {
  onAnalyze: (asin: string, marketplace: Marketplace) => void;
}

const CATEGORIES = [
  { id: 3, icon: '🍳', label: 'Cozinha', key: 'Kitchen & Dining' },
  { id: 16318, icon: '🏃', label: 'Desporto', key: 'Sports & Outdoors' },
  { id: 340852031, icon: '🐾', label: 'Animais', key: 'Pet Supplies' },
  { id: 64, icon: '💄', label: 'Beleza', key: 'Beauty' },
  { id: 77, icon: '👶', label: 'Bebé', key: 'Baby' },
  { id: 80, icon: '🏠', label: 'Casa', key: 'Home & Garden' },
  { id: 192, icon: '💼', label: 'Escritório', key: 'Office Products' },
  { id: 228013, icon: '🔧', label: 'Ferramentas', key: 'Tools' },
  { id: 36, icon: '🎮', label: 'Brinquedos', key: 'Toys' },
  { id: 67, icon: '💊', label: 'Saúde', key: 'Health' },
] as const;

type SortOption = 'score' | 'reviews' | 'margin' | 'bsr';

export default function ProductFinder({ onAnalyze }: ProductFinderProps) {
  const { t } = useLanguage();
  const [keyword, setKeyword] = useState('');
  const [marketplace, setMarketplace] = useState<Marketplace>('DE');
  const [mode, setMode] = useState<'search' | 'category'>('search');
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number] | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('score');
  const [visibleCount, setVisibleCount] = useState(10);

  // Keyword search trigger
  const [searchTrigger, setSearchTrigger] = useState<{ keyword: string; marketplace: Marketplace } | null>(null);

  // Category search trigger
  const [categoryTrigger, setCategoryTrigger] = useState<{ categoryId: number; marketplace: Marketplace } | null>(null);

  const keywordQuery = useQuery({
    queryKey: ['product-search', searchTrigger],
    queryFn: () => searchProducts(searchTrigger!.keyword, searchTrigger!.marketplace),
    enabled: !!searchTrigger && mode === 'search',
    staleTime: 60000,
  });

  const categoryQuery = useQuery({
    queryKey: ['category-search', categoryTrigger],
    queryFn: () => searchByCategory(categoryTrigger!.categoryId, categoryTrigger!.marketplace),
    enabled: !!categoryTrigger && mode === 'category',
    staleTime: 60000,
  });

  const activeQuery = mode === 'search' ? keywordQuery : categoryQuery;
  const data = activeQuery.data;
  const isLoading = activeQuery.isLoading;
  const isFetching = activeQuery.isFetching;

  const handleSearch = () => {
    if (keyword.trim()) {
      setVisibleCount(10);
      setSearchTrigger({ keyword: keyword.trim(), marketplace });
    }
  };

  const handleCategoryClick = (cat: typeof CATEGORIES[number]) => {
    setSelectedCategory(cat);
    setMode('category');
    setVisibleCount(10);
    setCategoryTrigger({ categoryId: cat.id, marketplace });
  };

  const sortedProducts = useMemo(() => {
    if (!data?.products) return [];
    const filtered = filterValidProducts(data.products).map(p => ({
      ...p,
      opportunityScore: calculateOpportunityScore(p),
    }));

    switch (sortBy) {
      case 'reviews':
        return [...filtered].sort((a, b) => (a.reviewCount ?? 9999) - (b.reviewCount ?? 9999));
      case 'margin':
        return [...filtered].sort((a, b) => (b.currentPrice ?? 0) - (a.currentPrice ?? 0));
      case 'bsr':
        return [...filtered].sort((a, b) => (a.bsr ?? 999999) - (b.bsr ?? 999999));
      case 'score':
      default:
        return [...filtered].sort((a, b) => b.opportunityScore - a.opportunityScore);
    }
  }, [data?.products, sortBy]);

  const visibleProducts = sortedProducts.slice(0, visibleCount);
  const totalCount = sortedProducts.length;
  const hasMore = visibleCount < totalCount;
  const activeTrigger = mode === 'search' ? searchTrigger : categoryTrigger;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">{t('finder.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('finder.subtitle')}</p>
      </div>

      {/* Mode tabs */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as 'search' | 'category')}>
        <TabsList className="grid w-full grid-cols-2 max-w-xs">
          <TabsTrigger value="search">🔍 Pesquisa</TabsTrigger>
          <TabsTrigger value="category">📂 Explorar Categoria</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search bar (keyword mode) */}
      {mode === 'search' && (
        <div className="glass-card p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('finder.placeholder')}
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
                {Object.entries(MARKETPLACE_CONFIG).map(([key]) => (
                  <SelectItem key={key} value={key}>{t(`marketplace.${key}` as any)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={!keyword.trim() || isLoading}>
              {isFetching ? (
                <span className="flex items-center gap-2"><Filter className="w-4 h-4 animate-pulse-subtle" /> {t('finder.fetching')}</span>
              ) : (
                <span className="flex items-center gap-2"><Search className="w-4 h-4" /> {t('finder.search')}</span>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Category explorer */}
      {mode === 'category' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={marketplace} onValueChange={v => setMarketplace(v as Marketplace)}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MARKETPLACE_CONFIG).map(([key]) => (
                  <SelectItem key={key} value={key}>{t(`marketplace.${key}` as any)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <Button
                key={cat.id}
                variant={selectedCategory?.id === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryClick(cat)}
                disabled={isFetching}
                className="text-sm"
              >
                {cat.icon} {cat.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Banners */}
      {data?.isMock && <MockDataBanner />}
      {data && !data.isMock && data.isCached && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-1.5 w-fit">
          <span>🕐</span> Cached data
        </div>
      )}

      {/* Sort + counter bar */}
      {sortedProducts.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="text-sm text-muted-foreground">
            {mode === 'category' && selectedCategory
              ? `Top ${totalCount} produtos em ${selectedCategory.label} 🇩🇪`
              : `Mostrando ${Math.min(visibleCount, totalCount)} de ${totalCount} produtos encontrados`
            }
          </div>
          <Select value={sortBy} onValueChange={v => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-52 h-8 text-xs">
              <ArrowUpDown className="w-3 h-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Melhor Oportunidade</SelectItem>
              <SelectItem value="reviews">Menor Concorrência</SelectItem>
              <SelectItem value="margin">Maior Margem Estimada</SelectItem>
              <SelectItem value="bsr">Mais Vendido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <ProductTableSkeleton />
      ) : data?.products ? (
        <div className="space-y-3">
          {visibleProducts.map(product => (
            <ProductRow
              key={product.asin}
              product={product}
              marketplace={marketplace}
              onAnalyze={(asin) => onAnalyze(asin, marketplace)}
            />
          ))}
          {hasMore && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={() => setVisibleCount(prev => Math.min(prev + 10, 50))}
                className="gap-2"
              >
                <ChevronDown className="w-4 h-4" />
                Carregar mais 10 produtos
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                Mostrando {Math.min(visibleCount, totalCount)} de {totalCount}
              </p>
            </div>
          )}
        </div>
      ) : activeTrigger ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{t('finder.noResults')}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-sm text-muted-foreground">Experimenta:</span>
            {CATEGORIES.slice(0, 3).map(cat => (
              <Button
                key={cat.id}
                variant="ghost"
                size="sm"
                onClick={() => handleCategoryClick(cat)}
                className="text-sm"
              >
                {cat.icon} {cat.label}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">
            {mode === 'search'
              ? t('finder.emptyState')
              : 'Seleciona uma categoria para explorar os melhores produtos'}
          </p>
        </div>
      )}
    </div>
  );
}
