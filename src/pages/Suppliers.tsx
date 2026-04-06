import { Star, Clock, Package, DollarSign, ExternalLink, ShoppingBag, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import { toast } from 'sonner';

interface Supplier {
  name: string;
  type: string;
  typeIcon: string;
  country: string;
  flag: string;
  moq: string;
  leadTime: string;
  priceRange: string;
  rating: number;
  tags: string[];
  url: string;
  color: string;
  initial: string;
  description: string;
  section: 'eu' | 'international';
  fastEu?: boolean;
}

const SUPPLIERS: Supplier[] = [
  {
    name: 'Qogita',
    type: 'Wholesale 🇪🇺',
    typeIcon: '🇪🇺',
    country: 'Holanda',
    flag: '🇳🇱',
    moq: '1 caixa (varia)',
    leadTime: '3–7 dias',
    priceRange: '€5–€50/unit',
    rating: 5,
    tags: ['EU Stock', 'Fast Shipping', 'No MOQ Min', 'OA/RA Friendly'],
    url: 'https://qogita.com',
    color: 'bg-purple-500',
    initial: 'Q',
    description: 'Plataforma europeia de wholesale. Ideal para Online Arbitrage — stock EU imediato.',
    section: 'eu',
    fastEu: true,
  },
  {
    name: 'BigBuy',
    type: 'Dropshipping / Wholesale 🇪🇺',
    typeIcon: '🇪🇺',
    country: 'Espanha',
    flag: '🇪🇸',
    moq: '1 unidade / caixa',
    leadTime: '1–5 dias',
    priceRange: '€3–€100/unit',
    rating: 5,
    tags: ['EU Stock', 'Dropshipping OK', 'Spanish Seller Friendly', 'Multi-language'],
    url: 'https://bigbuy.eu',
    color: 'bg-green-500',
    initial: 'B',
    description: 'Líder europeu em dropshipping e wholesale. Perfeito para sellers em ES, PT e IT.',
    section: 'eu',
    fastEu: true,
  },
  {
    name: 'Zentrada',
    type: 'Wholesale Marketplace 🇪🇺',
    typeIcon: '🇪🇺',
    country: 'Alemanha',
    flag: '🇩🇪',
    moq: 'Varia por fornecedor',
    leadTime: '5–14 dias',
    priceRange: '€2–€80/unit',
    rating: 4,
    tags: ['EU Wholesale', 'German Market', 'Verified Suppliers', 'B2B Only'],
    url: 'https://zentrada.eu',
    color: 'bg-blue-500',
    initial: 'Z',
    description: 'Marketplace B2B europeu com milhares de fornecedores verificados. Ideal para mercado alemão e central europeu.',
    section: 'eu',
    fastEu: true,
  },
  {
    name: 'Alibaba.com',
    type: 'Marketplace 🌐',
    typeIcon: '🌐',
    country: 'China',
    flag: '🇨🇳',
    moq: '50–1000 units',
    leadTime: '15–45 dias',
    priceRange: '€1–€20/unit',
    rating: 4,
    tags: ['Verified Suppliers', 'Trade Assurance', 'Most Popular'],
    url: 'https://alibaba.com',
    color: 'bg-orange-500',
    initial: 'A',
    description: 'Maior marketplace de fornecedores mundiais. Ideal para private label e grandes volumes.',
    section: 'international',
  },
  {
    name: 'Brands Distribution',
    type: 'Fashion Wholesale 🇪🇺',
    typeIcon: '🇪🇺',
    country: 'Itália',
    flag: '🇮🇹',
    moq: '1 peça',
    leadTime: '3–7 dias',
    priceRange: '€10–€200/unit',
    rating: 4,
    tags: ['Fashion & Apparel', 'EU Stock', 'Italian Brands', 'No MOQ'],
    url: 'https://brandsdistribution.com',
    color: 'bg-pink-500',
    initial: 'B',
    description: 'Especializado em moda e marcas europeias. Ideal para sellers de vestuário e acessórios em Amazon Europa.',
    section: 'international',
  },
  {
    name: 'Mercateo',
    type: 'B2B Marketplace 🇪🇺',
    typeIcon: '🇪🇺',
    country: 'Alemanha',
    flag: '🇩🇪',
    moq: '1 unidade',
    leadTime: '2–7 dias',
    priceRange: '€5–€500/unit',
    rating: 4,
    tags: ['B2B', 'Office & Industrial', 'EU Verified', 'Wide Catalog'],
    url: 'https://mercateo.com',
    color: 'bg-teal-500',
    initial: 'M',
    description: 'Marketplace B2B europeu focado em escritório, industrial e ferramentas. Excelente para nichos técnicos.',
    section: 'international',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'text-warning fill-warning' : 'text-muted-foreground/30'}`} />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{rating}/5</span>
    </div>
  );
}

function SupplierCard({ s }: { s: Supplier }) {
  return (
    <Card className="border-border/50 hover:border-primary/40 transition-colors">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className={`${s.color} w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0`}>
            {s.initial}
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-sm">{s.name}</h3>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{s.type}</Badge>
              {s.fastEu && <Badge className="text-[10px] px-1.5 py-0 bg-green-100 text-green-700 border-green-200">Entrega Rápida EU ✅</Badge>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-base">{s.flag}</span>
          <span className="text-xs text-muted-foreground">{s.country}</span>
        </div>

        <StarRating rating={s.rating} />

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Package className="w-3 h-3 shrink-0" />
            <span>MOQ: {s.moq}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-3 h-3 shrink-0" />
            <span>{s.leadTime}</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2 text-muted-foreground">
            <DollarSign className="w-3 h-3 shrink-0" />
            <span>{s.priceRange}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>

        <div className="flex flex-wrap gap-1">
          {s.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">{tag}</Badge>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          <Button size="sm" variant="default" className="flex-1 text-xs" asChild>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3 h-3 mr-1" />
              Visitar Site
            </a>
          </Button>
          <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => toast.info('Em breve! Catálogo de produtos coming soon.')}>
            <ShoppingBag className="w-3 h-3 mr-1" />
            Ver Produtos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Suppliers() {
  const { t } = useLanguage();
  const euSuppliers = SUPPLIERS.filter(s => s.section === 'eu');
  const intlSuppliers = SUPPLIERS.filter(s => s.section === 'international');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold">{t('suppliers.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('suppliers.subtitle')}</p>
      </div>

      {/* EU Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🇪🇺</span>
          <h2 className="text-lg font-display font-semibold">Fornecedores Europeus</h2>
          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Entrega Rápida EU ✅</Badge>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {euSuppliers.map(s => <SupplierCard key={s.name} s={s} />)}
        </div>
      </div>

      {/* International Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌍</span>
          <h2 className="text-lg font-display font-semibold">Fornecedores Internacionais</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {intlSuppliers.map(s => <SupplierCard key={s.name} s={s} />)}
        </div>
      </div>
    </div>
  );
}
