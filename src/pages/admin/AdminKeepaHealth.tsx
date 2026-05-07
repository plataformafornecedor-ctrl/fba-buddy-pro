import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Activity, Database, TrendingUp, Users } from 'lucide-react';

const KEEPA_DAILY_LIMIT = 72000;

export default function AdminKeepaHealth() {
  const [stats, setStats] = useState({
    tokensToday: 0,
    cacheHitsToday: 0,
    realCallsToday: 0,
    uniqueUsersToday: 0,
    tokensSavedTotal: 0,
  });
  const [topAsins, setTopAsins] = useState<Array<{ asin: string; count: number; cacheHits: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const todayStart = new Date(); todayStart.setUTCHours(0, 0, 0, 0);

      const { data: usage } = await supabase
        .from('keepa_token_usage')
        .select('tokens_consumed, cache_hit, user_id, asin')
        .gte('created_at', todayStart.toISOString());

      if (usage) {
        const tokensToday = usage.reduce((s, u) => s + (u.tokens_consumed ?? 0), 0);
        const cacheHits = usage.filter(u => u.cache_hit).length;
        const realCalls = usage.filter(u => !u.cache_hit).length;
        const uniqueUsers = new Set(usage.map(u => u.user_id).filter(Boolean)).size;

        // Top ASINs
        const asinMap = new Map<string, { count: number; cacheHits: number }>();
        usage.forEach(u => {
          const cur = asinMap.get(u.asin) ?? { count: 0, cacheHits: 0 };
          cur.count++;
          if (u.cache_hit) cur.cacheHits++;
          asinMap.set(u.asin, cur);
        });
        const top = Array.from(asinMap.entries())
          .map(([asin, v]) => ({ asin, ...v }))
          .sort((a, b) => b.count - a.count).slice(0, 10);
        setTopAsins(top);

        setStats(s => ({ ...s, tokensToday, cacheHitsToday: cacheHits, realCallsToday: realCalls, uniqueUsersToday: uniqueUsers }));
      }

      const { data: cache } = await supabase
        .from('keepa_product_cache')
        .select('tokens_total_saved');
      const saved = cache?.reduce((s, c) => s + (c.tokens_total_saved ?? 0), 0) ?? 0;
      setStats(s => ({ ...s, tokensSavedTotal: saved }));

      setLoading(false);
    })();
  }, []);

  const pctUsed = (stats.tokensToday / KEEPA_DAILY_LIMIT) * 100;
  const total = stats.cacheHitsToday + stats.realCallsToday;
  const hitRatio = total > 0 ? (stats.cacheHitsToday / total) * 100 : 0;

  const barColor = pctUsed > 90 ? 'bg-destructive' : pctUsed > 75 ? 'bg-orange-500' : pctUsed > 50 ? 'bg-amber-500' : 'bg-emerald-500';
  const alertMsg = pctUsed > 90 ? '🔴 CRÍTICO: considere upgrade do plano Keepa'
    : pctUsed > 75 ? '🟠 Ação preventiva: monitor de perto'
    : pctUsed > 50 ? '🟡 Atenção: 50% do limite diário consumido' : null;

  if (loading) return <div className="p-6 text-muted-foreground">Carregando…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Keepa API Health</h1>
        <p className="text-muted-foreground text-sm">Monitoramento de consumo, cache e quota.</p>
      </div>

      {alertMsg && (
        <div className={cn(
          'rounded-lg border p-3 text-sm',
          pctUsed > 90 ? 'border-destructive bg-destructive/10 text-destructive' :
          pctUsed > 75 ? 'border-orange-500 bg-orange-500/10 text-orange-500' :
          'border-amber-500 bg-amber-500/10 text-amber-500'
        )}>{alertMsg}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Activity className="w-4 h-4" />Tokens Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{stats.tokensToday.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">/ {KEEPA_DAILY_LIMIT.toLocaleString()}</p>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div className={cn('h-full transition-all', barColor)} style={{ width: `${Math.min(pctUsed, 100)}%` }} />
            </div>
            <p className="text-xs mt-1">{pctUsed.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Database className="w-4 h-4" />Cache Hit Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn('text-2xl font-bold font-mono', hitRatio >= 75 ? 'text-emerald-500' : 'text-amber-500')}>
              {hitRatio.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">{stats.cacheHitsToday} hits / {total} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4" />Economia Acumulada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-500">{stats.tokensSavedTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">tokens salvos pelo cache</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Users className="w-4 h-4" />Usuários Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{stats.uniqueUsersToday}</div>
            <p className="text-xs text-muted-foreground">últimas 24h</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Top 10 ASINs Pesquisados (hoje)</CardTitle></CardHeader>
        <CardContent>
          {topAsins.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma pesquisa hoje.</p>
          ) : (
            <div className="space-y-2">
              {topAsins.map(a => (
                <div key={a.asin} className="flex items-center justify-between text-sm border-b border-border/50 pb-2">
                  <span className="font-mono">{a.asin}</span>
                  <span className="text-muted-foreground">{a.count} ({a.cacheHits} cache)</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
