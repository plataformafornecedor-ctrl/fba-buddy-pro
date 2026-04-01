import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function AdminSettings() {
  const { isSuperAdmin } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Platform configuration</p>
      </div>

      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-sm">General</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Allow new registrations</Label>
              <p className="text-xs text-muted-foreground">Users can create accounts via signup page</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-assign Free plan on signup</Label>
              <p className="text-xs text-muted-foreground">New users start on the Free plan</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Daily Opportunity emails</Label>
              <p className="text-xs text-muted-foreground">Send daily opportunity alerts to Pro users</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-sm">API Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Keepa API Key</Label>
            <Input type="password" defaultValue="••••••••••••" readOnly />
            <p className="text-xs text-muted-foreground">Managed via backend secrets</p>
          </div>
          <div className="space-y-2">
            <Label>Daily API Token Limit</Label>
            <Input type="number" defaultValue="1000" />
          </div>
        </CardContent>
      </Card>

      {isSuperAdmin && (
        <Card className="border-border/50 border-destructive/30">
          <CardHeader><CardTitle className="text-sm text-destructive">Danger Zone</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Maintenance Mode</Label>
                <p className="text-xs text-muted-foreground">Disable app access for all users</p>
              </div>
              <Switch />
            </div>
            <Button variant="destructive" size="sm" onClick={() => toast.info('Not available in demo')}>
              Reset All User Data
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
