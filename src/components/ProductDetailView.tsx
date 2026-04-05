import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Package, BarChart3,
  DollarSign, Users, ShieldCheck, TrendingUp, Brain, Save, Download,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Marketplace, MARKETPLACE_CONFIG, getScoreClass } from '@/lib/types';
import { getProductDetail, getAmazonFees } from '@/lib/api';
import { DetailSkeleton } from '@/components/Skeletons';
import PriceHistoryChart from '@/components/PriceHistoryChart';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';

interface ProductDetailViewProps {
  asin: string;
  marketplace: Marketplace;
  onBack: () => void;
  onOpenCalculator: (data: { price: number; fbaFee: number; weight: number | null; category: string; feeSource: 'real' | 'estimated' }) => void;
}

function Panel({ title, icon, color, children, defaultOpen = true }: {
  title: string; icon: React.ReactNode; color: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="glass-card overflow-hidden flex flex-col">
      <CollapsibleTrigger className={cn('flex items-center gap-2 px-4 py-3 text-sm font-display font-semibold text-primary-foreground w-full', color)}>
        {icon}
        <span className="flex-1 text-left">{title}</span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4 flex-1">{children}</CollapsibleContent>
    </Collapsible>
  );
}

function StatRow({ label, value, accent }: { label: string; value: React.ReactNode; accent?: string }) {
  return (
    <div className="flex justify-between items-center py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-medium', accent)}>{value}</span>
    </div>
  );
}

export default function ProductDetailView({ asin, marketplace, onBack, onOpenCalculator }: ProductDetailViewProps) {
  const { t } = useLanguage();
  const currency = MARKETPLACE_CONFIG[marketplace].currency;
  const cfg = MARKETPLACE_CONFIG[marketplace];

  const { data, isLoading } = useQuery({
    queryKey: ['product-detail', asin, marketplace],
    queryFn: () => getProductDetail(asin, marketplace),
  });

  const [costPrice, setCostPrice] = useState(8);
  const [inboundShipping, setInboundShipping] = useState(3);
  const [calcMarketplace, setCalcMarketplace] = useState<Marketplace>(marketplace);
  const [fulfillment, setFulfillment] = useState<'FBA' | 'FBM'>('FBA');

  const [aiResult, setAiResult] = useState<null | {
    recommendation: string; confidence: number; reasons: string[]; risks: string[]; suggestedPrice: number;
  }>(null);
  const [aiLoading, setAiLoading] = useState(false);

  if (isLoading) return <DetailSkeleton />;
  const product = data?.product;
  if (!product) return <div className="text-center py-12 text-muted-foreground">{t('general.productNotFound')}</div>;

  const calcCfg = MARKETPLACE_CONFIG[calcMarketplace];
  const sellingPrice = product.currentPrice || 0;
  const fbaFee = product.realFbaFee || sellingPrice * 0.12 + 1.5;
  const referralFee = sellingPrice * 0.15;
  const vat = sellingPrice * calcCfg.vatRate;
  const totalCosts = costPrice + inboundShipping + (fulfillment === 'FBA' ? fbaFee : 0) + referralFee + vat;
  const netProfit = sellingPrice - totalCosts;
  const roi = costPrice > 0 ? (netProfit / costPrice) * 100 : 0;
  const margin = sellingPrice > 0 ? (netProfit / sellingPrice) * 100 : 0;
  const breakEvenCost = sellingPrice - (fulfillment === 'FBA' ? fbaFee : 0) - referralFee - vat - inboundShipping;
  const maxCostFor30ROI = (sellingPrice - (fulfillment === 'FBA' ? fbaFee : 0) - referralFee - vat - inboundShipping) / 1.3;

  const handleAiAnalysis = async () => {
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    const isBuy = product.opportunityScore >= 50 && !product.isAmazonSeller && roi > 20;
    setAiResult({
      recommendation: isBuy ? 'BUY' : 'NO BUY',
      confidence: isBuy ? 72 + Math.floor(Math.random() * 20) : 30 + Math.floor(Math.random() * 25),
      reasons: isBuy
        ? ['Strong BSR with upward trend', 'Low competition — no Amazon seller', `Healthy ${roi.toFixed(0)}% ROI at current pricing`]
        : ['Amazon is a direct seller on this listing', 'High competition with established brands', 'Thin margins below 15% threshold'],
      risks: ['Price volatility in last 30 days', 'Category trending towards saturation', 'Potential seasonal demand drop Q1'],
      suggestedPrice: Math.round((costPrice * 2.5 + inboundShipping) * 100) / 100,
    });
    setAiLoading(false);
  };

  const handleExportCSV = () => {
    const rows = [
      ['Field', 'Value'],
      ['ASIN', product.asin],
      ['Title', product.title],
      ['Price', `${currency}${sellingPrice}`],
      ['BSR', product.bsr?.toString() || ''],
      ['Category', product.category],
      ['FBA Sellers', product.fbaSellers.toString()],
      ['FBM Sellers', product.fbmSellers.toString()],
      ['ROI', `${roi.toFixed(1)}%`],
      ['Net Profit', `${currency}${netProfit.toFixed(2)}`],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${product.asin}_analysis.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-display font-bold truncate">{product.title}</h1>
          <span className="text-xs text-muted-foreground">ASIN: {product.asin} • {product.category}</span>
        </div>
        <div className={`score-badge text-sm px-3 py-1 ${getScoreClass(product.opportunityScore)}`}>
          {product.opportunityScore}/100
        </div>
        <Button variant="outline" size="sm" onClick={() => {}}><Save className="w-3.5 h-3.5 mr-1" />{t('btn.save')}</Button>
        <Button variant="outline" size="sm" onClick={handleExportCSV}><Download className="w-3.5 h-3.5 mr-1" />{t('btn.csv')}</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">

        {/* PANEL 1 */}
        <Panel title={t('panel.canYouSell')} icon={<ShieldCheck className="w-4 h-4" />} color="bg-primary">
          <div className="space-y-2.5">
            <EligBadge ok={product.eligibility.eligible} label={t('panel.eligible')} />
            <EligBadge ok={!product.eligibility.ipRisk} warn={product.eligibility.ipRisk} label={product.eligibility.ipRisk ? t('panel.ipRisk') : t('panel.noIpIssues')} />
            <EligBadge ok={!product.eligibility.hazmat} bad={product.eligibility.hazmat} label={product.eligibility.hazmat ? t('panel.hazmat') : t('panel.notHazmat')} />
            <EligBadge ok={!product.eligibility.privateLabel} warn={product.eligibility.privateLabel} label={product.eligibility.privateLabel ? t('panel.privateLabel') : t('panel.notPrivateLabel')} />
            <EligBadge ok={!product.eligibility.restrictions} label={t('panel.noRestrictions')} />
            <div className="pt-2 border-t border-border">
              <StatRow label={t('panel.variations')} value={product.eligibility.variationCount} />
            </div>
          </div>
        </Panel>

        {/* PANEL 2 */}
        <Panel title={t('panel.doesItSell')} icon={<TrendingUp className="w-4 h-4" />} color="bg-accent">
          <div className="space-y-2">
            <StatRow label={t('panel.currentBsr')} value={`#${product.bsr?.toLocaleString() ?? '—'}`} />
            <StatRow label={t('panel.category')} value={product.category} />
            <div className="border-t border-border pt-2 mt-2">
              <StatRow label={t('panel.bsrAvg30')} value={`#${product.bsrAvg30?.toLocaleString() ?? '—'}`} />
              <StatRow label={t('panel.bsrAvg90')} value={`#${product.bsrAvg90?.toLocaleString() ?? '—'}`} />
              <StatRow label={t('panel.bsrAvg180')} value={`#${product.bsrAvg180?.toLocaleString() ?? '—'}`} />
            </div>
            <div className="border-t border-border pt-2 mt-2">
              <StatRow label={t('panel.estMonthlySales')} value={<span className="font-bold">{product.estimatedMonthlySales} {t('panel.units')}</span>} />
              <StatRow label={t('panel.fbaSellers')} value={product.fbaSellers} />
              <StatRow label={t('panel.fbmSellers')} value={product.fbmSellers} />
              <StatRow
                label={t('panel.amazonSelling')}
                value={product.isAmazonSeller
                  ? <span className="text-destructive font-semibold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />{t('panel.yes')}</span>
                  : <span className="text-success font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />{t('panel.no')}</span>}
              />
            </div>
            <div className="border-t border-border pt-2 mt-2">
              <p className="text-xs text-muted-foreground mb-1 font-medium">{t('panel.top3Stock')}</p>
              {product.competitors.slice(0, 3).map((c, i) => (
                <StatRow key={i} label={c.sellerName} value={`${c.stockLevel} ${t('panel.units')}`} />
              ))}
            </div>
          </div>
          <div className="mt-3 space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">{t('panel.priceHistory')}</p>
              <PriceHistoryChart
                dates={product.priceHistoryDates || []}
                prices={product.priceHistory}
                bsr={product.bsrHistory}
                currency={currency}
              />
            </div>
          </div>
        </Panel>

        {/* PANEL 3 */}
        <Panel title={t('panel.isItProfitable')} icon={<DollarSign className="w-4 h-4" />} color="bg-warning text-warning-foreground">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('panel.input')}</p>
              <div>
                <Label className="text-xs">{t('panel.costPrice')} ({calcCfg.currency})</Label>
                <Input type="number" step="0.01" value={costPrice} onChange={e => setCostPrice(parseFloat(e.target.value) || 0)} className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">{t('panel.inboundShipping')} ({calcCfg.currency})</Label>
                <Input type="number" step="0.01" value={inboundShipping} onChange={e => setInboundShipping(parseFloat(e.target.value) || 0)} className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">{t('calc.marketplace')}</Label>
                <Select value={calcMarketplace} onValueChange={v => setCalcMarketplace(v as Marketplace)}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(MARKETPLACE_CONFIG).map(([k]) => (
                      <SelectItem key={k} value={k}>{k}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-1">
                {(['FBA', 'FBM'] as const).map(f => (
                  <button key={f} onClick={() => setFulfillment(f)}
                    className={cn('flex-1 py-1.5 text-xs font-medium rounded-md transition-colors',
                      fulfillment === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                    )}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('panel.results')}</p>
              <StatRow label={t('calc.fbaFee')} value={`${calcCfg.currency}${fbaFee.toFixed(2)}`} />
              <StatRow label={t('panel.referral15')} value={`${calcCfg.currency}${referralFee.toFixed(2)}`} />
              <StatRow label={`VAT (${(calcCfg.vatRate * 100).toFixed(0)}%)`} value={`${calcCfg.currency}${vat.toFixed(2)}`} />
              <div className="border-t border-border pt-2 mt-1">
                <StatRow label={t('calc.netProfit')} value={<span className={netProfit > 0 ? 'text-success font-bold' : 'text-destructive font-bold'}>{calcCfg.currency}{netProfit.toFixed(2)}</span>} />
                <StatRow label={t('calc.roi')} value={<span className={roi > 0 ? 'text-success font-bold' : 'text-destructive font-bold'}>{roi.toFixed(1)}%</span>} />
                <StatRow label={t('calc.margin')} value={<span className={margin > 0 ? 'text-success font-bold' : 'text-destructive font-bold'}>{margin.toFixed(1)}%</span>} />
              </div>
              <div className="border-t border-border pt-2 mt-1">
                <StatRow label={t('panel.breakEvenCost')} value={`${calcCfg.currency}${breakEvenCost.toFixed(2)}`} />
                <StatRow label={t('panel.maxCost30ROI')} value={<span className="text-primary font-bold">{calcCfg.currency}{maxCostFor30ROI.toFixed(2)}</span>} />
              </div>
            </div>
          </div>
        </Panel>

        {/* PANEL 4 */}
        <Panel title={t('panel.competition')} icon={<Users className="w-4 h-4" />} color="bg-destructive">
          <div className="space-y-2">
            <div className="flex gap-3 text-xs mb-2">
              <Badge variant="secondary">{product.fbaSellers} FBA</Badge>
              <Badge variant="secondary">{product.fbmSellers} FBM</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-1.5 font-medium">{t('panel.seller')}</th>
                    <th className="text-center py-1.5 font-medium">{t('panel.type')}</th>
                    <th className="text-right py-1.5 font-medium">{t('product.price')}</th>
                    <th className="text-right py-1.5 font-medium">{t('panel.stock')}</th>
                  </tr>
                </thead>
                <tbody>
                  {product.competitors.map((c, i) => (
                    <tr key={i} className={cn('border-b border-border/50', c.isAmazon && 'bg-destructive/10')}>
                      <td className={cn('py-1.5', c.isAmazon && 'text-destructive font-semibold')}>
                        {c.sellerName}
                        {c.isAmazon && <span className="ml-1 text-[10px]">⚠️</span>}
                      </td>
                      <td className="text-center">
                        <Badge variant={c.isFBA ? 'default' : 'outline'} className="text-[10px] px-1.5 py-0">
                          {c.isFBA ? 'FBA' : 'FBM'}
                        </Badge>
                      </td>
                      <td className="text-right font-medium">{currency}{c.price.toFixed(2)}</td>
                      <td className="text-right">{c.stockLevel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {product.isAmazonSeller && (
              <div className="mt-2 px-2 py-1.5 rounded-md bg-destructive/10 text-destructive text-xs font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> {t('panel.amazonSelling.warning')}
              </div>
            )}
          </div>
        </Panel>

        {/* PANEL 5 */}
        <Panel title={t('panel.aiRecommendation')} icon={<Brain className="w-4 h-4" />} color="bg-info">
          {!aiResult ? (
            <div className="flex flex-col items-center justify-center py-6 gap-3">
              <Brain className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground text-center">{t('panel.aiDescription')}</p>
              <Button onClick={handleAiAnalysis} disabled={aiLoading} className="gap-2">
                {aiLoading ? <span className="animate-spin">⏳</span> : <Brain className="w-4 h-4" />}
                {aiLoading ? t('panel.analyzing') : t('panel.getAiAnalysis')}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className={cn(
                'text-center py-3 rounded-lg font-display font-bold text-lg',
                aiResult.recommendation === 'BUY' ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'
              )}>
                {aiResult.recommendation === 'BUY' ? '✅' : '❌'} {aiResult.recommendation === 'BUY' ? t('panel.buy') : t('panel.noBuy')}
                <span className="ml-2 text-sm font-normal opacity-75">{aiResult.confidence}% {t('panel.confidence')}</span>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">{t('panel.topReasons')}</p>
                {aiResult.reasons.map((r, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs py-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">{t('panel.riskFactors')}</p>
                {aiResult.risks.map((r, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs py-0.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>

              <StatRow label={t('panel.suggestedPrice')} value={<span className="text-primary font-bold">{currency}{aiResult.suggestedPrice}</span>} />

              <Button variant="outline" size="sm" className="w-full" onClick={handleAiAnalysis}>
                {t('panel.reAnalyze')}
              </Button>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function EligBadge({ ok, warn, bad, label }: { ok: boolean; warn?: boolean; bad?: boolean; label: string }) {
  if (bad) return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">
      <XCircle className="w-3.5 h-3.5" /> {label}
    </div>
  );
  if (warn) return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warning/10 text-warning text-xs font-medium">
      <AlertTriangle className="w-3.5 h-3.5" /> {label}
    </div>
  );
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-medium">
      <CheckCircle2 className="w-3.5 h-3.5" /> {label}
    </div>
  );
}
