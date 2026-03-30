import { useState, useEffect } from 'react';
import { Calculator, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Marketplace, MARKETPLACE_CONFIG, MarginCalculation } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';

interface MarginCalculatorProps {
  prefill?: {
    price: number;
    fbaFee: number;
    weight: number | null;
    category: string;
    feeSource: 'real' | 'estimated';
  };
}

export default function MarginCalculator({ prefill }: MarginCalculatorProps) {
  const { t } = useLanguage();
  const [marketplace, setMarketplace] = useState<Marketplace>('DE');
  const [sellingPrice, setSellingPrice] = useState(prefill?.price || 29.99);
  const [purchasePrice, setPurchasePrice] = useState(8);
  const [shippingCost, setShippingCost] = useState(3);
  const [fbaFee, setFbaFee] = useState(prefill?.fbaFee || 4.5);
  const [feeSource, setFeeSource] = useState<'real' | 'estimated'>(prefill?.feeSource || 'estimated');

  useEffect(() => {
    if (prefill) {
      setSellingPrice(prefill.price);
      setFbaFee(prefill.fbaFee);
      setFeeSource(prefill.feeSource);
    }
  }, [prefill]);

  const cfg = MARKETPLACE_CONFIG[marketplace];
  const referralFee = sellingPrice * 0.15;
  const vat = sellingPrice * cfg.vatRate;
  const totalCosts = purchasePrice + shippingCost + fbaFee + referralFee + vat;
  const profit = sellingPrice - totalCosts;
  const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
  const roi = purchasePrice > 0 ? (profit / purchasePrice) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Calculator className="w-6 h-6 text-primary" /> {t('calc.title')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t('calc.subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-display font-semibold">{t('calc.inputData')}</h2>

          <div>
            <Label>{t('calc.marketplace')}</Label>
            <Select value={marketplace} onValueChange={v => setMarketplace(v as Marketplace)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(MARKETPLACE_CONFIG).map(([key, c]) => (
                  <SelectItem key={key} value={key}>{t(`marketplace.${key}` as any)} (VAT {(c.vatRate * 100).toFixed(0)}%)</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t('calc.sellingPrice')} ({cfg.currency})</Label>
            <Input type="number" step="0.01" value={sellingPrice} onChange={e => setSellingPrice(parseFloat(e.target.value) || 0)} />
          </div>

          <div>
            <Label>{t('calc.purchasePrice')} ({cfg.currency})</Label>
            <Input type="number" step="0.01" value={purchasePrice} onChange={e => setPurchasePrice(parseFloat(e.target.value) || 0)} />
          </div>

          <div>
            <Label>{t('calc.shippingCost')} ({cfg.currency})</Label>
            <Input type="number" step="0.01" value={shippingCost} onChange={e => setShippingCost(parseFloat(e.target.value) || 0)} />
          </div>

          <div>
            <Label className="flex items-center gap-2">
              {t('calc.fbaFee')} ({cfg.currency})
              {feeSource === 'real' ? (
                <span className="flex items-center gap-1 text-xs text-success"><CheckCircle2 className="w-3 h-3" /> {t('calc.realData')}</span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-warning"><AlertTriangle className="w-3 h-3" /> {t('calc.estimated')}</span>
              )}
            </Label>
            <Input type="number" step="0.01" value={fbaFee} onChange={e => { setFbaFee(parseFloat(e.target.value) || 0); setFeeSource('estimated'); }} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-6">
            <h2 className="font-display font-semibold mb-4">{t('calc.costBreakdown')}</h2>
            <div className="space-y-3 text-sm">
              <CostRow label={t('calc.purchasePrice')} value={purchasePrice} currency={cfg.currency} />
              <CostRow label={t('calc.shippingCost')} value={shippingCost} currency={cfg.currency} />
              <CostRow label={t('calc.fbaFee')} value={fbaFee} currency={cfg.currency} badge={feeSource} />
              <CostRow label={t('calc.referralFee')} value={referralFee} currency={cfg.currency} />
              <CostRow label={`VAT (${(cfg.vatRate * 100).toFixed(0)}%)`} value={vat} currency={cfg.currency} />
              <div className="border-t border-border pt-3 flex justify-between font-semibold">
                <span>{t('calc.totalCosts')}</span>
                <span>{cfg.currency}{totalCosts.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className={`glass-card p-6 ${profit > 0 ? 'ring-2 ring-success/30' : 'ring-2 ring-destructive/30'}`}>
            <h2 className="font-display font-semibold mb-4">{t('calc.profitAnalysis')}</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-muted-foreground">{t('calc.profit')}</div>
                <div className={`text-2xl font-display font-bold ${profit > 0 ? 'text-success' : 'text-destructive'}`}>
                  {cfg.currency}{profit.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{t('calc.margin')}</div>
                <div className={`text-2xl font-display font-bold ${margin > 0 ? 'text-success' : 'text-destructive'}`}>
                  {margin.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{t('calc.roi')}</div>
                <div className={`text-2xl font-display font-bold ${roi > 0 ? 'text-success' : 'text-destructive'}`}>
                  {roi.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CostRow({ label, value, currency, badge }: { label: string; value: number; currency: string; badge?: 'real' | 'estimated' }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground flex items-center gap-1.5">
        {label}
        {badge === 'real' && <CheckCircle2 className="w-3 h-3 text-success" />}
        {badge === 'estimated' && <AlertTriangle className="w-3 h-3 text-warning" />}
      </span>
      <span className="font-medium">{currency}{value.toFixed(2)}</span>
    </div>
  );
}
