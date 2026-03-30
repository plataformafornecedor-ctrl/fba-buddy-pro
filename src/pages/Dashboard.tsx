import { BarChart3, TrendingUp, Bell, Bookmark, Search, Calculator, Truck, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n';

interface DashboardProps {
  onNavigate: (tab: 'finder' | 'calculator' | 'suppliers') => void;
}

const RECENT_SEARCHES = [
  { keyword: 'silicone kitchen utensils', results: 42, time: '2 min ago' },
  { keyword: 'bamboo cutting board', results: 28, time: '1 hour ago' },
  { keyword: 'LED desk lamp', results: 65, time: '3 hours ago' },
  { keyword: 'yoga mat premium', results: 31, time: 'Yesterday' },
  { keyword: 'stainless steel water bottle', results: 54, time: 'Yesterday' },
];

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { t } = useLanguage();

  const METRICS = [
    { label: t('dashboard.productsAnalyzed'), value: '147', icon: BarChart3, trend: t('dashboard.thisWeek') },
    { label: t('dashboard.avgMargin'), value: '34.2%', icon: TrendingUp, trend: t('dashboard.vsLastWeek') },
    { label: t('dashboard.activeAlerts'), value: '5', icon: Bell, trend: t('dashboard.newToday') },
    { label: t('dashboard.savedProducts'), value: '23', icon: Bookmark, trend: t('dashboard.addedRecently') },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((m) => (
          <Card key={m.label} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground text-xs font-medium">{m.label}</span>
                <m.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="text-2xl font-display font-bold">{m.value}</div>
              <span className="text-xs text-accent">{m.trend}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('dashboard.recentSearches')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {RECENT_SEARCHES.map((s) => (
              <div key={s.keyword} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Search className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium">{s.keyword}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-xs">{s.results} {t('dashboard.results')}</Badge>
                  <span className="text-xs text-muted-foreground">{s.time}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('dashboard.quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start gap-2" variant="secondary" onClick={() => onNavigate('finder')}>
                <Search className="w-4 h-4" /> {t('dashboard.searchProduct')}
              </Button>
              <Button className="w-full justify-start gap-2" variant="secondary" onClick={() => onNavigate('calculator')}>
                <Calculator className="w-4 h-4" /> {t('dashboard.openCalculator')}
              </Button>
              <Button className="w-full justify-start gap-2" variant="secondary" onClick={() => onNavigate('suppliers')}>
                <Truck className="w-4 h-4" /> {t('dashboard.viewSuppliers')}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">{t('dashboard.aiInsight')}</span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {t('dashboard.aiTip')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
