import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, TrendingUp, UserMinus, Search, Package, Key, RefreshCw } from 'lucide-react';
import { fetchTokenStatus } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const METRICS = [
  { label: 'Total Users', value: '247', icon: Users, change: '+12 this week', color: 'text-primary' },
  { label: 'Active Subscriptions', value: '183', icon: CreditCard, change: '74% conversion', color: 'text-emerald-400' },
  { label: 'Trial Users', value: '38', icon: TrendingUp, change: '15 expire this week', color: 'text-amber-400' },
  { label: 'Churned (Month)', value: '7', icon: UserMinus, change: '2.8% churn rate', color: 'text-destructive' },
  { label: 'MRR', value: '€6,430', icon: CreditCard, change: '+€340 vs last month', color: 'text-emerald-400' },
  { label: 'Searches Today', value: '1,284', icon: Search, change: '312 products analyzed', color: 'text-primary' },
];

function ApiStatusCard() {
  const [tokenData, setTokenData] = useState<{ tokensLeft: number; refillIn: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await fetchTokenStatus();
      setTokenData(data);
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const tokensLeft = tokenData?.tokensLeft ?? 0;
  const isCritical = tokensLeft < 50;
  const isWarning = tokensLeft >= 50 && tokensLeft <= 200;
  const estimatedSearches = Math.floor(tokensLeft / 3);

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Key className="w-4 h-4 text-primary" />
          API Status — Keepa
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={refresh} disabled={loading}>
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Tokens Remaining</p>
            <p className={cn(
              "text-2xl font-bold font-mono",
              isCritical ? "text-destructive" : isWarning ? "text-amber-500" : "text-emerald-500"
            )}>
              {tokensLeft}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Est. Searches Left</p>
            <p className="text-2xl font-bold font-mono">{estimatedSearches}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Refill In</p>
            <p className="text-sm font-mono">
              {tokenData?.refillIn ? `${Math.round(tokenData.refillIn)} min` : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="text-sm">
              {isCritical ? '🔴 Critical' : isWarning ? '⚠️ Low' : '🟢 Healthy'}
            </p>
          </div>
        </div>
        {isCritical && (
          <div className="text-xs text-destructive bg-destructive/10 rounded px-2 py-1.5">
            ⚠️ Tokens critically low — app is using mock data fallback.
          </div>
        )}
        {lastRefresh && (
          <p className="text-xs text-muted-foreground">
            Last refreshed: {lastRefresh.toLocaleTimeString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <p className="text-muted-foreground text-sm">Real-time platform metrics and activity</p>
      </div>

      <ApiStatusCard />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {METRICS.map(m => (
          <Card key={m.label} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{m.label}</CardTitle>
              <m.icon className={`w-4 h-4 ${m.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{m.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{m.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-sm">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { time: '2 min ago', text: 'New user signup: maria.silva@email.com (Free)' },
            { time: '15 min ago', text: 'Plan upgrade: john.doe@email.com → Pro (€49/mo)' },
            { time: '1 hour ago', text: 'User suspended: spam.user@email.com by Admin Pablinio' },
            { time: '3 hours ago', text: 'New user signup: carlos.m@email.com (Trial)' },
            { time: '5 hours ago', text: 'Plan downgrade: ana.costa@email.com Pro → Free' },
          ].map((a, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <span className="text-muted-foreground text-xs whitespace-nowrap w-20">{a.time}</span>
              <span>{a.text}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
