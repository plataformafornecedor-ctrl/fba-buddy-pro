import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, UserPlus, CreditCard, AlertTriangle, Shield } from 'lucide-react';

const NOTIFICATIONS = [
  { icon: UserPlus, title: 'New user signup', desc: 'maria.silva@email.com just created an account', time: '2 min ago', type: 'info' },
  { icon: CreditCard, title: 'Plan upgrade', desc: 'john.doe@email.com upgraded to Pro (€49/mo)', time: '15 min ago', type: 'success' },
  { icon: AlertTriangle, title: 'High API usage', desc: 'API token usage at 85% of monthly limit', time: '1 hour ago', type: 'warning' },
  { icon: Shield, title: 'Suspicious login attempt', desc: 'Multiple failed login attempts for admin@fbaradar.com', time: '3 hours ago', type: 'danger' },
  { icon: CreditCard, title: 'Payment failed', desc: 'Payment failed for user ana.costa@email.com', time: '5 hours ago', type: 'danger' },
  { icon: UserPlus, title: 'New user signup', desc: 'carlos.m@email.com joined via referral link', time: '1 day ago', type: 'info' },
];

export default function AdminNotifications() {
  const typeColor = (type: string) => {
    if (type === 'success') return 'bg-emerald-500/20 text-emerald-400';
    if (type === 'warning') return 'bg-amber-500/20 text-amber-400';
    if (type === 'danger') return 'bg-destructive/20 text-destructive';
    return 'bg-primary/20 text-primary';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-muted-foreground text-sm">Platform alerts and activity</p>
      </div>
      <div className="space-y-3">
        {NOTIFICATIONS.map((n, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="py-4 flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColor(n.type)}`}>
                <n.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium text-sm">{n.title}</h3>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{n.time}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{n.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
