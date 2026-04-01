import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Ban, Trash2, KeyRound, Search, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [role, setRole] = useState('user');
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from('profiles').select('*').eq('id', id).maybeSingle().then(({ data }) => setProfile(data));
    supabase.from('user_roles').select('role').eq('user_id', id).maybeSingle().then(({ data }) => {
      if (data) setRole((data as any).role);
    });
  }, [id]);

  if (!profile) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>;

  const handlePlanChange = async (plan: string) => {
    await supabase.from('profiles').update({ plan }).eq('id', id);
    setProfile({ ...profile, plan });
    toast.success('Plan updated');
  };

  const handleToggleSuspend = async () => {
    const newStatus = profile.status === 'suspended' ? 'active' : 'suspended';
    await supabase.from('profiles').update({ status: newStatus }).eq('id', id);
    setProfile({ ...profile, status: newStatus });
    toast.success(`User ${newStatus}`);
  };

  const handleDelete = async () => {
    await supabase.from('profiles').delete().eq('id', id);
    toast.success('User deleted');
    navigate('/admin/users');
  };

  const mockActivity = [
    { time: '2 hours ago', action: 'Searched "silicone kitchen set" on DE' },
    { time: '3 hours ago', action: 'Analyzed ASIN B08N5WRWNW' },
    { time: '1 day ago', action: 'Saved product "LED Strip Lights"' },
    { time: '2 days ago', action: 'Used Margin Calculator for IT marketplace' },
    { time: '3 days ago', action: 'Searched "yoga mats" on FR' },
  ];

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/admin/users')} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="border-border/50 lg:col-span-1">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary mx-auto">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{profile.name}</h2>
              <p className="text-muted-foreground text-sm">{profile.email}</p>
            </div>
            <div className="flex justify-center gap-2">
              <Badge className={role === 'super_admin' ? 'bg-[hsl(263,70%,58%)] text-white' : role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-secondary'}>{role.replace('_', ' ')}</Badge>
              <Badge className={profile.plan === 'pro' ? 'bg-primary/20 text-primary' : profile.plan === 'beta' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-secondary'}>{profile.plan}</Badge>
              <Badge className={profile.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-destructive/20 text-destructive'}>{profile.status}</Badge>
            </div>
            <div className="text-xs text-muted-foreground space-y-1 pt-2">
              <p>Joined: {new Date(profile.created_at).toLocaleDateString()}</p>
              <p>Last active: {new Date(profile.last_active).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader><CardTitle>Manage User</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Plan</label>
                <Select value={profile.plan} onValueChange={handlePlanChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="beta">Beta (€19/mo)</SelectItem>
                    <SelectItem value="pro">Pro (€49/mo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {isSuperAdmin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select value={role} onValueChange={async (v: string) => {
                    await supabase.from('user_roles').update({ role: v as any }).eq('user_id', id);
                    setRole(v);
                    toast.success('Role updated');
                  }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleToggleSuspend} className="gap-2">
                <Ban className="w-4 h-4" /> {profile.status === 'suspended' ? 'Activate' : 'Suspend'}
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => toast.success('Password reset email sent')}>
                <KeyRound className="w-4 h-4" /> Reset Password
              </Button>
              {isSuperAdmin && (
                <Button variant="destructive" className="gap-2" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="w-4 h-4" /> Delete Account
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Log */}
      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-sm">Recent Activity</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {mockActivity.map((a, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground text-xs w-24">{a.time}</span>
              <Search className="w-3 h-3 text-muted-foreground" />
              <span>{a.action}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete User</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to permanently delete <strong>{profile.name}</strong>? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
