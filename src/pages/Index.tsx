import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import ProductFinder from '@/components/ProductFinder';
import ProductDetailView from '@/components/ProductDetailView';
import MarginCalculator from '@/components/MarginCalculator';
import { Marketplace } from '@/lib/types';

type View = 'finder' | 'calculator' | 'detail';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'finder' | 'calculator'>('finder');
  const [view, setView] = useState<View>('finder');
  const [selectedAsin, setSelectedAsin] = useState('');
  const [selectedMarketplace, setSelectedMarketplace] = useState<Marketplace>('DE');
  const [calculatorPrefill, setCalculatorPrefill] = useState<{
    price: number; fbaFee: number; weight: number | null; category: string; feeSource: 'real' | 'estimated';
  } | undefined>();

  const handleTabChange = (tab: 'finder' | 'calculator') => {
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
      {view === 'finder' && (
        <ProductFinder onAnalyze={handleAnalyze} />
      )}
      {view === 'detail' && (
        <ProductDetailView
          asin={selectedAsin}
          marketplace={selectedMarketplace}
          onBack={() => setView('finder')}
          onOpenCalculator={handleOpenCalculator}
        />
      )}
      {view === 'calculator' && (
        <MarginCalculator prefill={calculatorPrefill} />
      )}
    </AppLayout>
  );
};

export default Index;
