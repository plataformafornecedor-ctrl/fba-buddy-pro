import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLanguage } from '@/lib/i18n';
import { Marketplace } from '@/lib/types';
import { Target, Clock, TrendingUp, ShieldCheck, Flame, Star, Package, ChevronDown, ChevronUp, Mail, MessageSquare, Eye, BookmarkPlus, ArrowRight, AlertTriangle } from 'lucide-react';

interface DailyDealProps {
  onAnalyze: (asin: string, marketplace: Marketplace) => void;
}

const TODAY_OPPORTUNITY = {
  product: 'Silicone Kitchen Utensil Set',
  marketplace: 'DE' as Marketplace,
  asin: 'B08N5WRWNW',
  imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop',
  bsr: 8400,
  bsrTrend: 'improving' as const,
  monthlySales: 320,
  avgPrice: 24.99,
  reviews: 127,
  amazonSelling: false,
  sellingPrice: 24.99,
  fbaFee: 3.20,
  referralFee: 3.75,
  vat: 3.99,
  suggestedCost: 8.00,
  netProfit: 6.05,
  margin: 34.2,
  roi: 75.6,
  opportunityScore: 94,
  supplier: { name: 'ShenZen FastSource Co.', moq: 100, leadTime: 18, totalInvestment: 800, monthlyProfit: 1936 },
};

const HISTORY = [
  { product: 'Bamboo Cutting Board Set', marketplace: 'FR' as Marketplace, flag: '🇫🇷', margin: 28.5, score: 82, date: 'Yesterday' },
  { product: 'Stainless Steel Water Bottle', marketplace: 'DE' as Marketplace, flag: '🇩🇪', margin: 31.0, score: 88, date: '2 days ago' },
  { product: 'LED Desk Lamp USB', marketplace: 'ES' as Marketplace, flag: '🇪🇸', margin: 26.3, score: 76, date: '3 days ago' },
  { product: 'Yoga Mat Non-Slip', marketplace: 'IT' as Marketplace, flag: '🇮🇹', margin: 33.1, score: 91, date: '4 days ago' },
  { product: 'Phone Stand Adjustable', marketplace: 'UK' as Marketplace, flag: '🇬🇧', margin: 29.7, score: 79, date: '5 days ago' },
  { product: 'Glass Food Storage Set', marketplace: 'DE' as Marketplace, flag: '🇩🇪', margin: 35.2, score: 93, date: '6 days ago' },
  { product: 'Resistance Bands Pack', marketplace: 'FR' as Marketplace, flag: '🇫🇷', margin: 27.8, score: 74, date: '7 days ago' },
];

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const next7am = new Date(now);
      next7am.setHours(7, 0, 0, 0);
      if (now >= next7am) next7am.setDate(next7am.getDate() + 1);
      const diff = next7am.getTime() - now.getTime();
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setTimeLeft(`${h}:${m}:${s}`);
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);
  return timeLeft;
}

export default function DailyDeal({ onAnalyze }: DailyDealProps) {
  const { t } = useLanguage();
  const countdown = useCountdown();
  const [saved, setSaved] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [emailPreview, setEmailPreview] = useState(false);
  const [dailyEmail, setDailyEmail] = useState(true);
  const [whatsapp, setWhatsapp] = useState(false);
  const [minMargin, setMinMargin] = useState([25]);
  const [maxBudget, setMaxBudget] = useState([2000]);
  const [historyTab, setHistoryTab] = useState('yesterday');
  const o = TODAY_OPPORTUNITY;

  const filteredHistory = historyTab === 'yesterday'
    ? HISTORY.slice(0, 1)
    : HISTORY;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Target className="w-7 h-7 text-primary" />
            {t('daily.title')}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{t('daily.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-secondary/50 rounded-lg px-4 py-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">{t('daily.nextIn')}</span>
            <span className="font-mono font-bold text-primary text-lg">{countdown}</span>
          </div>
        </div>
      </div>

      {/* Main Opportunity Card */}
      <Card className="border-primary/30 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Product Info */}
            <div className="lg:col-span-2 space-y-5">
              <div className="flex gap-4">
                <img src={o.imageUrl} alt={o.product} className="w-24 h-24 rounded-lg object-cover border border-border" />
                <div className="flex-1">
                  <h2 className="font-display font-bold text-xl">{o.product}</h2>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span>🇩🇪 {t('marketplace.DE')}</span>
                    <span className="text-border">•</span>
                    <span className="font-mono text-xs">ASIN: {o.asin}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-primary/15 text-primary border-0">
                      <Flame className="w-3 h-3 mr-1" /> {t('daily.score')}: {o.opportunityScore}/100
                    </Badge>
                    <Badge variant="outline" className="border-warning text-warning">
                      <AlertTriangle className="w-3 h-3 mr-1" /> {t('daily.urgency')}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { label: 'BSR', value: o.bsr.toLocaleString(), sub: '↗️ ' + t('daily.improving') },
                  { label: t('daily.monthlySales'), value: `~${o.monthlySales}`, sub: t('panel.units') },
                  { label: t('daily.avgPrice'), value: `€${o.avgPrice}`, sub: '' },
                  { label: t('product.reviews'), value: o.reviews.toString(), sub: t('daily.lowComp') + ' ✅' },
                  { label: 'Amazon', value: t('panel.no'), sub: '✅' },
                ].map((m) => (
                  <div key={m.label} className="bg-secondary/40 rounded-lg p-3 text-center">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.label}</div>
                    <div className="font-bold text-lg">{m.value}</div>
                    {m.sub && <div className="text-[10px] text-muted-foreground">{m.sub}</div>}
                  </div>
                ))}
              </div>

              {/* Margin Breakdown */}
              <Card className="bg-secondary/30 border-border/50">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-semibold">{t('daily.marginBreakdown')}</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">{t('calc.sellingPrice')}</span><span>€{o.sellingPrice}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">{t('calc.fbaFee')}</span><span className="text-destructive">-€{o.fbaFee}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">{t('panel.referral15')}</span><span className="text-destructive">-€{o.referralFee}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">VAT (19%)</span><span className="text-destructive">-€{o.vat}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">{t('daily.yourCost')}</span><span>€{o.suggestedCost}</span></div>
                    <div />
                    <div className="col-span-2 border-t border-border/50 my-1" />
                    <div className="flex justify-between font-bold text-accent"><span>{t('daily.netProfit')}</span><span>€{o.netProfit} ✅</span></div>
                    <div className="flex justify-between font-bold"><span>{t('calc.margin')}</span><span className="text-accent">{o.margin}% ✅</span></div>
                    <div className="flex justify-between font-bold"><span>ROI</span><span className="text-accent">{o.roi}% ✅</span></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Supplier + CTAs */}
            <div className="space-y-4">
              <Card className="bg-secondary/30 border-border/50">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" /> {t('daily.supplierSuggestion')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2 text-sm">
                  <div className="font-bold">🇨🇳 {o.supplier.name}</div>
                  <div className="text-muted-foreground">MOQ: {o.supplier.moq} {t('panel.units')} | {t('daily.leadTime')}: {o.supplier.leadTime}d</div>
                  <div className="text-muted-foreground">{t('daily.totalInvestment')}: <span className="text-foreground font-semibold">€{o.supplier.totalInvestment}</span></div>
                  <div className="text-accent font-bold">{t('daily.estMonthlyProfit')}: €{o.supplier.monthlyProfit.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Button className="w-full" onClick={() => onAnalyze(o.asin, o.marketplace)}>
                <ArrowRight className="w-4 h-4 mr-2" /> {t('daily.analyzeDetail')}
              </Button>
              <Button
                variant={saved ? 'secondary' : 'outline'}
                className="w-full"
                onClick={() => setSaved(!saved)}
              >
                <BookmarkPlus className="w-4 h-4 mr-2" />
                {saved ? t('daily.saved') : t('daily.saveOpportunity')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Tabs */}
      <div>
        <Tabs value={historyTab} onValueChange={setHistoryTab}>
          <TabsList>
            <TabsTrigger value="yesterday">{t('daily.yesterday')}</TabsTrigger>
            <TabsTrigger value="week">{t('daily.thisWeek')}</TabsTrigger>
          </TabsList>
          <TabsContent value="yesterday" className="mt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredHistory.map((h, i) => (
                <HistoryCard key={i} item={h} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="week" className="mt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredHistory.map((h, i) => (
                <HistoryCard key={i} item={h} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Settings Collapsibles */}
      <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between text-sm">
            {t('daily.preferences')}
            {settingsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-2">
            <CardContent className="p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label className="text-xs">{t('daily.prefMarketplace')}</Label>
                  <Select defaultValue="DE">
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(['DE', 'FR', 'IT', 'ES', 'UK'] as Marketplace[]).map(m => (
                        <SelectItem key={m} value={m}>{t(`marketplace.${m}` as any)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">{t('daily.prefCategories')}</Label>
                  <Select defaultValue="kitchen">
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kitchen">Kitchen</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="home">Home & Garden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">{t('daily.minMargin')}: {minMargin[0]}%</Label>
                <Slider value={minMargin} onValueChange={setMinMargin} min={10} max={60} step={1} className="mt-2" />
              </div>
              <div>
                <Label className="text-xs">{t('daily.maxBudget')}: €{maxBudget[0].toLocaleString()}</Label>
                <Slider value={maxBudget} onValueChange={setMaxBudget} min={100} max={10000} step={100} className="mt-2" />
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={notifOpen} onOpenChange={setNotifOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between text-sm">
            {t('daily.notifications')}
            {notifOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-2">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /><span className="text-sm">{t('daily.emailToggle')}</span></div>
                <Switch checked={dailyEmail} onCheckedChange={setDailyEmail} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-accent" /><span className="text-sm">{t('daily.whatsappToggle')}</span></div>
                <Switch checked={whatsapp} onCheckedChange={setWhatsapp} />
              </div>
              {whatsapp && (
                <Input placeholder="+351 912 345 678" className="mt-1" />
              )}
              <Button variant="outline" size="sm" onClick={() => setEmailPreview(true)}>
                <Eye className="w-4 h-4 mr-2" /> {t('daily.previewEmail')}
              </Button>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Email Preview Modal */}
      {emailPreview && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEmailPreview(false)}>
          <Card className="max-w-md w-full" onClick={e => e.stopPropagation()}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{t('daily.emailPreviewTitle')}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {t('daily.emailSubject')}
              </p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="bg-secondary/40 rounded-lg p-4 space-y-3">
                <div className="w-full h-32 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
                  📷 Product Image
                </div>
                <table className="w-full text-xs">
                  <tbody>
                    <tr><td className="text-muted-foreground py-1">BSR</td><td className="text-right font-mono">8,400</td></tr>
                    <tr><td className="text-muted-foreground py-1">{t('calc.margin')}</td><td className="text-right font-mono text-accent">34.2%</td></tr>
                    <tr><td className="text-muted-foreground py-1">ROI</td><td className="text-right font-mono text-accent">75.6%</td></tr>
                    <tr><td className="text-muted-foreground py-1">{t('daily.netProfit')}</td><td className="text-right font-mono text-accent">€6.05</td></tr>
                  </tbody>
                </table>
                <Button size="sm" className="w-full">{t('daily.viewFullAnalysis')}</Button>
                <p className="text-[10px] text-center text-muted-foreground underline cursor-pointer">Unsubscribe</p>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => setEmailPreview(false)}>
                {t('btn.cancel')}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function HistoryCard({ item }: { item: typeof HISTORY[number] }) {
  const { t } = useLanguage();
  return (
    <Card className="bg-secondary/20 border-border/30 hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-semibold text-sm">{item.product}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{item.flag} {t(`marketplace.${item.marketplace}` as any)} · {item.date}</div>
          </div>
          <Badge variant="outline" className="text-[10px]">
            <Star className="w-3 h-3 mr-1" /> {item.score}
          </Badge>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs">
          <span className="text-accent font-bold">{item.margin}% {t('calc.margin')}</span>
          <span className="text-muted-foreground">{t('daily.missed')}</span>
        </div>
      </CardContent>
    </Card>
  );
}
