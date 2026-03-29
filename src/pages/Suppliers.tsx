import { Star, MapPin, Clock, Package, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SUPPLIERS = [
  { name: 'EuroLogix GmbH', country: 'Germany', flag: '🇩🇪', moq: 500, leadTime: '7-10 days', pricePerUnit: '€2.40', rating: 4.8, tags: ['Kitchenware', 'Homeware', 'Fast Shipping'] },
  { name: 'IberiaPack S.L.', country: 'Spain', flag: '🇪🇸', moq: 300, leadTime: '10-14 days', pricePerUnit: '€1.95', rating: 4.5, tags: ['Packaging', 'Eco-Friendly'] },
  { name: 'Milano Goods Srl', country: 'Italy', flag: '🇮🇹', moq: 200, leadTime: '8-12 days', pricePerUnit: '€3.10', rating: 4.7, tags: ['Premium', 'Fashion Accessories'] },
  { name: 'NordPack OY', country: 'Finland', flag: '🇫🇮', moq: 1000, leadTime: '5-7 days', pricePerUnit: '€1.20', rating: 4.9, tags: ['Bulk', 'Sustainable', 'Fast Shipping'] },
  { name: 'ShenZen FastSource Co.', country: 'China', flag: '🇨🇳', moq: 100, leadTime: '18-25 days', pricePerUnit: '€0.85', rating: 4.3, tags: ['Electronics', 'Low MOQ', 'Budget'] },
  { name: 'GuangZhou TradeLink', country: 'China', flag: '🇨🇳', moq: 200, leadTime: '20-30 days', pricePerUnit: '€0.65', rating: 4.1, tags: ['General Merch', 'Budget'] },
  { name: 'FrancePack SARL', country: 'France', flag: '🇫🇷', moq: 400, leadTime: '6-9 days', pricePerUnit: '€2.80', rating: 4.6, tags: ['Cosmetics', 'Premium Packaging'] },
  { name: 'PolskaDist Sp.z.o.o', country: 'Poland', flag: '🇵🇱', moq: 250, leadTime: '5-8 days', pricePerUnit: '€1.50', rating: 4.4, tags: ['Toys', 'Home & Garden', 'Fast Shipping'] },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'text-warning fill-warning' : 'text-muted-foreground/30'}`} />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{rating}</span>
    </div>
  );
}

export default function Suppliers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Suppliers</h1>
        <p className="text-muted-foreground text-sm mt-1">Verified suppliers for FBA sourcing</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {SUPPLIERS.map((s) => (
          <Card key={s.name} className="border-border/50 hover:border-primary/40 transition-colors">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-semibold text-sm">{s.name}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-base">{s.flag}</span>
                    <span className="text-xs text-muted-foreground">{s.country}</span>
                  </div>
                </div>
              </div>

              <StarRating rating={s.rating} />

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Package className="w-3 h-3" />
                  <span>MOQ: {s.moq}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{s.leadTime}</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2 text-muted-foreground">
                  <DollarSign className="w-3 h-3" />
                  <span>{s.pricePerUnit}/unit</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {s.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
