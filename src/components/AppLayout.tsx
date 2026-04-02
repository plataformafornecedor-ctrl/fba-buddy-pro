import { useState, useEffect } from 'react';
import { LayoutDashboard, Search, Calculator, Truck, Menu, X, TrendingUp, Radar, Target } from 'lucide-react';
import { getDataSource } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useLanguage, LANGUAGE_OPTIONS } from '@/lib/i18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Tab = 'dashboard' | 'finder' | 'calculator' | 'suppliers' | 'dailydeal';

interface AppLayoutProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  children: React.ReactNode;
}

export default function AppLayout({ activeTab, onTabChange, children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'dailydeal', label: t('nav.dailyDeal'), icon: <Target className="w-4 h-4" /> },
    { id: 'finder', label: t('nav.finder'), icon: <Search className="w-4 h-4" /> },
    { id: 'calculator', label: t('nav.calculator'), icon: <Calculator className="w-4 h-4" /> },
    { id: 'suppliers', label: t('nav.suppliers'), icon: <Truck className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-14 bg-card border-b border-border flex items-center px-4 gap-4 sticky top-0 z-50">
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="flex items-center gap-2">
          <Radar className="w-6 h-6 text-primary" />
          <span className="font-display font-bold text-lg tracking-tight">FBARadar</span>
        </div>
        <nav className="hidden md:flex items-center gap-1 ml-8">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                activeTab === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <DataSourceBadge />
          <Select value={language} onValueChange={(v) => setLanguage(v as any)}>
            <SelectTrigger className="w-auto h-8 gap-1.5 text-xs px-2 border-border/50">
              <SelectValue>
                {LANGUAGE_OPTIONS.find(l => l.value === language)?.flag}
              </SelectValue>
            </SelectTrigger>
            <SelectContent align="end">
              {LANGUAGE_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="flex items-center gap-2">{opt.flag} {opt.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      {mobileOpen && (
        <div className="md:hidden bg-card border-b border-border p-2 flex flex-col gap-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { onTabChange(item.id); setMobileOpen(false); }}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                activeTab === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary'
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
