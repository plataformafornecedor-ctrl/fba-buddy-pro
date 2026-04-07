import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Dashboard from '@/pages/Dashboard';
import ProductFinder from '@/components/ProductFinder';
import ProductDetailView from '@/components/ProductDetailView';
import MarginCalculator from '@/components/MarginCalculator';
import Suppliers from '@/pages/Suppliers';
import DailyDeal from '@/pages/DailyDeal';
import ListingBuilder from '@/pages/ListingBuilder';
import SavedListings from '@/components/listing-builder/SavedListings';
import { Marketplace } from '@/lib/types';

type View = 'dashboard' | 'finder' | 'calculator' | 'suppliers' | 'detail' | 'dailydeal' | 'listing' | 'saved-listings';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'finder' | 'calculator' | 'suppliers' | 'dailydeal' | 'listing'>('dashboard');
  const [view, setView] = useState<View>('dashboard');
  const [selectedAsin, setSelectedAsin] = useState('');
  const [selectedMarketplace, setSelectedMarketplace] = useState<Marketplace>('DE');
  const [calculatorPrefill, setCalculatorPrefill] = useState<{
    price: number; fbaFee: number; weight: number | null; category: string; feeSource: 'real' | 'estimated';
  } | undefined>();

  const handleTabChange = (tab: 'dashboard' | 'finder' | 'calculator' | 'suppliers' | 'dailydeal' | 'listing') => {
    setActiveTab(tab);
    setView(tab);
  };

  const handleAnalyze = (asin: string, marketplace: Marketplace) => {
    setSelectedAsin(asin);
    setSelectedMarketplace(marketplace);
    setView('detail');
  };

  const handleOpenCalculator = (data: typeof calculatorPrefill) => {
    setCalculatorPrefill(data);
    setActiveTab('calculator');
    setView('calculator');
  };

  return (
    <AppLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {view === 'dashboard' && <Dashboard onNavigate={handleTabChange} />}
      {view === 'dailydeal' && <DailyDeal onAnalyze={handleAnalyze} />}
      {view === 'finder' && <ProductFinder onAnalyze={handleAnalyze} />}
      {view === 'detail' && (
        <ProductDetailView
          asin={selectedAsin}
          marketplace={selectedMarketplace}
          onBack={() => { setView('finder'); setActiveTab('finder'); }}
          onOpenCalculator={handleOpenCalculator}
        />
      )}
      {view === 'calculator' && <MarginCalculator prefill={calculatorPrefill} />}
      {view === 'suppliers' && <Suppliers />}
      {view === 'listing' && <ListingBuilder />}
      {view === 'saved-listings' && <SavedListings onBack={() => { setView('listing'); setActiveTab('listing'); }} />}
    </AppLayout>
  );
};

export default Index;
