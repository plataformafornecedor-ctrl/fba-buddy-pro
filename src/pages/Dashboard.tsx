import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Bell, Bookmark, Search, Calculator, Truck, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface DashboardProps {
  onNavigate: (tab: 'finder' | 'calculator' | 'suppliers') => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [stats, setStats] = useState({ analyzed: 0, savedCount: 0, listings: 0, avgScore: 0 });
  const [recent, setRecent] = useState<Array<{ keyword: string; results: number; time: string }>>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: saved }, { data: listings }] = await Promise.all([
        supabase.from('saved_products').select('asin,title,opportunity_score,created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('saved_listings').select('id').eq('user_id', user.id),
      ]);
      const items = saved || [];
      const avg = items.length ? Math.round(items.reduce((s, x) => s + (x.opportunity_score || 0), 0) / items.length) : 0;
      setStats({ analyzed: items.length, savedCount: items.length, listings: (listings || []).length, avgScore: avg });
      setRecent(items.slice(0, 5).map(x => ({
        keyword: x.title || x.asin,
        results: x.opportunity_score || 0,
        time: new Date(x.created_at).toLocaleDateString(),
      })));
    })();
  }, [user]);

  const METRICS = [
    { label: t('dashboard.productsAnalyzed'), value: String(stats.analyzed), icon: BarChart3, trend: t('dashboard.thisWeek') },
    { label: t('dashboard.avgMargin'), value: stats.avgScore ? `${stats.avgScore}/100` : '—', icon: TrendingUp, trend: 'Score médio' },
    { label: t('dashboard.activeAlerts'), value: String(stats.listings), icon: Bell, trend: 'Listings criados' },
    { label: t('dashboard.savedProducts'), value: String(stats.savedCount), icon: Bookmark, trend: t('dashboard.addedRecently') },
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
            {recent.length === 0 && (
              <div className="text-sm text-muted-foreground py-4 text-center">
                Nenhum produto guardado ainda. Faz uma análise e guarda-a para a veres aqui.
              </div>
            )}
            {recent.map((s) => (
              <div key={s.keyword} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium truncate">{s.keyword}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant="secondary" className="text-xs">Score {s.results}</Badge>
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
