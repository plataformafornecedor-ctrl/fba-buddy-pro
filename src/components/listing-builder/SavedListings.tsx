import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Eye, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface SavedListing {
  id: string;
  product_name: string;
  marketplace: string;
  language: string;
  seo_score: any;
  created_at: string;
}

interface SavedListingsProps {
  onBack: () => void;
}

export default function SavedListings({ onBack }: SavedListingsProps) {
  const { user } = useAuth();
  const [listings, setListings] = useState<SavedListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('saved_listings')
      .select('id, product_name, marketplace, language, seo_score, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setListings(data);
        setLoading(false);
      });
  }, [user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('saved_listings').delete().eq('id', id);
    if (!error) {
      setListings(prev => prev.filter(l => l.id !== id));
      toast.success('Listing eliminado');
    }
  };

  const langFlags: Record<string, string> = { de: '🇩🇪', fr: '🇫🇷', es: '🇪🇸', it: '🇮🇹', en: '🇬🇧', pt: '🇵🇹' };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-xl font-display font-bold">Listings Guardados</h2>
          <p className="text-sm text-muted-foreground">{listings.length} listings</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">A carregar...</div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum listing guardado ainda. Cria o teu primeiro listing!
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map(listing => (
            <div key={listing.id} className="glass-card p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{listing.product_name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {langFlags[listing.language] || ''} {listing.marketplace}
                  </Badge>
                  {listing.seo_score?.overall && (
                    <Badge variant="outline" className="text-xs">
                      SEO: {listing.seo_score.overall}/100
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(listing.created_at).toLocaleDateString('pt-PT')}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(listing.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
