import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, TrendingUp, UserMinus, Search, Package } from 'lucide-react';

const METRICS = [
  { label: 'Total Users', value: '247', icon: Users, change: '+12 this week', color: 'text-primary' },
  { label: 'Active Subscriptions', value: '183', icon: CreditCard, change: '74% conversion', color: 'text-emerald-400' },
  { label: 'Trial Users', value: '38', icon: TrendingUp, change: '15 expire this week', color: 'text-amber-400' },
  { label: 'Churned (Month)', value: '7', icon: UserMinus, change: '2.8% churn rate', color: 'text-destructive' },
  { label: 'MRR', value: '€6,430', icon: CreditCard, change: '+€340 vs last month', color: 'text-emerald-400' },
  { label: 'Searches Today', value: '1,284', icon: Search, change: '312 products analyzed', color: 'text-primary' },
];

export default function AdminOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <p className="text-muted-foreground text-sm">Real-time platform metrics and activity</p>
      </div>

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
