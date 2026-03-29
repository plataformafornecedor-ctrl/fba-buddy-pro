import { BarChart3, TrendingUp, Bell, Bookmark, Search, Calculator, Truck, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DashboardProps {
  onNavigate: (tab: 'finder' | 'calculator' | 'suppliers') => void;
}

const METRICS = [
  { label: 'Products Analyzed', value: '147', icon: BarChart3, trend: '+12 this week' },
  { label: 'Avg Margin %', value: '34.2%', icon: TrendingUp, trend: '+2.1% vs last week' },
  { label: 'Active Alerts', value: '5', icon: Bell, trend: '2 new today' },
  { label: 'Saved Products', value: '23', icon: Bookmark, trend: '3 added recently' },
];

const RECENT_SEARCHES = [
  { keyword: 'silicone kitchen utensils', results: 42, time: '2 min ago' },
  { keyword: 'bamboo cutting board', results: 28, time: '1 hour ago' },
  { keyword: 'LED desk lamp', results: 65, time: '3 hours ago' },
  { keyword: 'yoga mat premium', results: 31, time: 'Yesterday' },
  { keyword: 'stainless steel water bottle', results: 54, time: 'Yesterday' },
];

export default function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Your FBA research overview</p>
      </div>

      {/* Metric cards */}
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
        {/* Recent searches */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Searches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {RECENT_SEARCHES.map((s) => (
              <div key={s.keyword} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Search className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium">{s.keyword}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-xs">{s.results} results</Badge>
                  <span className="text-xs text-muted-foreground">{s.time}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <div className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start gap-2" variant="secondary" onClick={() => onNavigate('finder')}>
                <Search className="w-4 h-4" /> Search Product
              </Button>
              <Button className="w-full justify-start gap-2" variant="secondary" onClick={() => onNavigate('calculator')}>
                <Calculator className="w-4 h-4" /> Open Calculator
              </Button>
              <Button className="w-full justify-start gap-2" variant="secondary" onClick={() => onNavigate('suppliers')}>
                <Truck className="w-4 h-4" /> View Suppliers
              </Button>
            </CardContent>
          </Card>

          {/* AI Insight */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">AI Insight</span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Today's tip: Products with BSR under 20,000 and under 150 reviews represent the best opportunities for new FBA sellers entering the European market.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
