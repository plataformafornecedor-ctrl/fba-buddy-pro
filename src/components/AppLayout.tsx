import { useState } from 'react';
import { Search, Radar, TrendingUp, Calculator, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'finder' | 'calculator';

interface AppLayoutProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  children: React.ReactNode;
}

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'finder', label: 'Product Finder', icon: <Search className="w-4 h-4" /> },
  { id: 'calculator', label: 'Margin Calculator', icon: <Calculator className="w-4 h-4" /> },
];

export default function AppLayout({ activeTab, onTabChange, children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
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
        <div className="ml-auto flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent" />
          <span className="text-xs text-muted-foreground hidden sm:inline">Live Market Data</span>
        </div>
      </header>

      {/* Mobile nav */}
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
