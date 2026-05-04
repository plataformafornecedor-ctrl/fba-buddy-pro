import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ListingForm, { ListingFormData } from '@/components/listing-builder/ListingForm';
import ListingProgress from '@/components/listing-builder/ListingProgress';
import ListingResults from '@/components/listing-builder/ListingResults';
import { Sparkles, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ListingData {
  title: string;
  bullets: string[];
  description: string;
  backend_keywords: string;
  seo_score: {
    overall: number;
    title: number;
    bullets: number;
    description: number;
    keywords: number;
    suggestion: string;
  };
}

export default function ListingBuilder() {
  const { user } = useAuth();
  const [step, setStep] = useState<'form' | 'loading' | 'results'>('form');
  const [listing, setListing] = useState<ListingData | null>(null);
  const [formData, setFormData] = useState<ListingFormData | null>(null);
  const [userPlan, setUserPlan] = useState<string>('free');

  const { role } = useAuth();

  // Check user plan
  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('plan').eq('id', user.id).maybeSingle().then(({ data }) => {
        if (data?.plan) setUserPlan(data.plan);
      });
    }
  }, [user]);

  // Admins always have full access; otherwise free is locked
  const isPro = role === 'admin' || role === 'super_admin' || (userPlan !== 'free' && userPlan !== '');

  const handleGenerate = async (data: ListingFormData) => {
    if (!isPro) {
      toast.error('Upgrade para Pro para aceder ao Listing Builder AI');
      return;
    }

    setFormData(data);
    setStep('loading');

    try {
      const { data: result, error } = await supabase.functions.invoke('generate-listing', {
        body: data,
      });

      if (error) throw error;
      if (result?.error) throw new Error(result.error);

      setListing(result.listing);
      setStep('results');
      toast.success('Listing gerado com sucesso!');
    } catch (err: any) {
      console.error('Generation failed:', err);
      toast.error(err.message || 'Falha ao gerar listing. Tenta novamente.');
      setStep('form');
    }
  };

  const handleSave = async () => {
    if (!user || !listing || !formData) return;

    try {
      const { error } = await supabase.from('saved_listings').insert({
        user_id: user.id,
        product_name: formData.productName,
        category: formData.category,
        marketplace: formData.marketplace,
        language: formData.language,
        title: listing.title,
        bullets: listing.bullets as any,
        description: listing.description,
        backend_keywords: listing.backend_keywords,
        seo_score: listing.seo_score as any,
        input_data: formData as any,
      });

      if (error) throw error;
      toast.success('Listing guardado com sucesso!');
    } catch (err: any) {
      toast.error('Falha ao guardar listing');
    }
  };

  const handleRegenerate = () => {
    if (formData) handleGenerate(formData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          Listing Builder AI <Sparkles className="w-6 h-6 text-primary" />
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cria listings optimizados para Amazon Europa em segundos com Inteligência Artificial
        </p>
      </div>

      {!isPro && (
        <div className="glass-card p-6 text-center space-y-4 border-2 border-primary/20">
          <Lock className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="font-semibold text-lg">Funcionalidade Pro</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            O Listing Builder AI está disponível para utilizadores Pro.
            Gera listings otimizados para SEO e conversão em qualquer idioma europeu.
          </p>
          <Button className="bg-primary">
            Upgrade para Pro — €49/mês
          </Button>
        </div>
      )}

      {step === 'form' && <ListingForm onGenerate={handleGenerate} disabled={!isPro} />}
      {step === 'loading' && <ListingProgress />}
      {step === 'results' && listing && (
        <ListingResults
          listing={listing}
          onRegenerate={handleRegenerate}
          onSave={handleSave}
          onEdit={() => setStep('form')}
        />
      )}
    </div>
  );
}
