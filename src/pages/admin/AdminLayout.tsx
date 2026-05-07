import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Users, BarChart3, Bell, Settings, Shield, Menu, X, ExternalLink, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const NAV = [
  { path: '/admin', label: 'Overview', icon: BarChart3 },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/keepa-health', label: 'Keepa Health', icon: Activity },
  { path: '/admin/notifications', label: 'Notifications', icon: Bell },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const { profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const roleBadge = role === 'super_admin' ? 'SUPER ADMIN' : 'ADMIN';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 bg-card border-b border-border flex items-center px-4 gap-4 sticky top-0 z-50">
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-[hsl(263,70%,58%)]" />
          <span className="font-display font-bold text-lg">FBARadar Admin</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => window.open('/', '_blank')}>
            <ExternalLink className="w-3 h-3" /> View as User
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm hidden sm:inline">{profile?.name}</span>
            <Badge className="bg-[hsl(263,70%,58%)] text-white text-[10px]">{roleBadge}</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>Logout</Button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex w-56 border-r border-border flex-col bg-card/50 p-3 gap-1">
          {NAV.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                location.pathname === item.path
                  ? 'bg-[hsl(263,70%,58%)] text-white'
                  : 'text-muted-foreground hover:bg-secondary'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </aside>

        {/* Sidebar - Mobile */}
        {mobileOpen && (
          <div className="md:hidden absolute top-14 left-0 right-0 bg-card border-b border-border p-2 z-40 flex flex-col gap-1">
            {NAV.map(item => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === item.path
                    ? 'bg-[hsl(263,70%,58%)] text-white'
                    : 'text-muted-foreground hover:bg-secondary'
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
