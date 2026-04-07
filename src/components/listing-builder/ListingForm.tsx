import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ChevronDown, Rocket, Lock } from 'lucide-react';

export interface ListingFormData {
  productName: string;
  category: string;
  marketplace: string;
  language: string;
  features: string;
  targetAudience: string;
  differentials: string;
  price: string;
  keywords: string;
  tone: string;
  useEmojis: boolean;
  optimizeFor: string;
}

const CATEGORIES = [
  'Kitchen & Dining', 'Sports & Outdoors', 'Pet Supplies', 'Beauty',
  'Baby', 'Home & Garden', 'Office Products', 'Tools', 'Toys',
  'Health', 'Electronics', 'Clothing', 'Automotive', 'Books',
];

const MARKETPLACES = [
  { value: 'DE', label: '🇩🇪 Alemanha' },
  { value: 'FR', label: '🇫🇷 França' },
  { value: 'ES', label: '🇪🇸 Espanha' },
  { value: 'IT', label: '🇮🇹 Itália' },
  { value: 'UK', label: '🇬🇧 Reino Unido' },
];

const LANGUAGES = [
  { value: 'de', label: '🇩🇪 Alemão' },
  { value: 'fr', label: '🇫🇷 Francês' },
  { value: 'es', label: '🇪🇸 Espanhol' },
  { value: 'it', label: '🇮🇹 Italiano' },
  { value: 'en', label: '🇬🇧 Inglês' },
  { value: 'pt', label: '🇵🇹 Português' },
];

interface ListingFormProps {
  onGenerate: (data: ListingFormData) => void;
  disabled?: boolean;
}

export default function ListingForm({ onGenerate, disabled }: ListingFormProps) {
  const [form, setForm] = useState<ListingFormData>({
    productName: '',
    category: '',
    marketplace: 'DE',
    language: 'de',
    features: '',
    targetAudience: '',
    differentials: '',
    price: '',
    keywords: '',
    tone: 'professional',
    useEmojis: false,
    optimizeFor: 'both',
  });

  const [advancedOpen, setAdvancedOpen] = useState(false);

  const update = (field: keyof ListingFormData, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const canSubmit = form.productName.trim() && form.category && form.features.trim();

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="font-semibold text-base">Informação Básica</h3>

        <div className="space-y-2">
          <Label>Nome do produto</Label>
          <Input
            placeholder="Ex: Tapete de Yoga Antiderrapante"
            value={form.productName}
            onChange={e => update('productName', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Categoria Amazon</Label>
            <Select value={form.category} onValueChange={v => update('category', v)}>
              <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Marketplace principal</Label>
            <Select value={form.marketplace} onValueChange={v => update('marketplace', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MARKETPLACES.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Idioma do listing</Label>
            <Select value={form.language} onValueChange={v => update('language', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="font-semibold text-base">Detalhes do Produto</h3>

        <div className="space-y-2">
          <Label>Principais características</Label>
          <Textarea
            placeholder="Ex: Material TPE ecológico, 6mm espessura, 183x61cm, inclui bolsa de transporte, antiderrapante dos dois lados"
            value={form.features}
            onChange={e => update('features', e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Público alvo</Label>
          <Input
            placeholder="Ex: Mulheres 25-45 anos, praticantes de yoga e pilates"
            value={form.targetAudience}
            onChange={e => update('targetAudience', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Diferencial vs concorrência</Label>
          <Textarea
            placeholder="Ex: Mais espesso que a média, design exclusivo, certificado eco-friendly"
            value={form.differentials}
            onChange={e => update('differentials', e.target.value)}
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Preço de venda (€)</Label>
            <Input
              type="number"
              placeholder="29.99"
              value={form.price}
              onChange={e => update('price', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Keywords que quero incluir (opcional)</Label>
            <Input
              placeholder="Ex: yoga mat, tapete yoga, colchonete yoga"
              value={form.keywords}
              onChange={e => update('keywords', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Advanced */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between text-sm text-muted-foreground">
            Configurações Avançadas
            <ChevronDown className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="glass-card p-5 space-y-5 mt-2">
            <div className="space-y-3">
              <Label>Tom do listing</Label>
              <RadioGroup value={form.tone} onValueChange={v => update('tone', v)} className="flex flex-wrap gap-4">
                {[
                  { value: 'professional', label: 'Professional' },
                  { value: 'friendly', label: 'Friendly' },
                  { value: 'premium', label: 'Premium' },
                  { value: 'eco', label: 'Eco-focused' },
                ].map(t => (
                  <div key={t.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={t.value} id={`tone-${t.value}`} />
                    <Label htmlFor={`tone-${t.value}`} className="cursor-pointer text-sm">{t.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex items-center justify-between">
              <Label>Incluir emojis nos bullets</Label>
              <Switch checked={form.useEmojis} onCheckedChange={v => update('useEmojis', v)} />
            </div>

            <div className="space-y-3">
              <Label>Optimizar para</Label>
              <RadioGroup value={form.optimizeFor} onValueChange={v => update('optimizeFor', v)} className="flex flex-wrap gap-4">
                {[
                  { value: 'conversion', label: 'Conversão' },
                  { value: 'seo', label: 'SEO' },
                  { value: 'both', label: 'Ambos' },
                ].map(o => (
                  <div key={o.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={o.value} id={`opt-${o.value}`} />
                    <Label htmlFor={`opt-${o.value}`} className="cursor-pointer text-sm">{o.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Submit */}
      <Button
        onClick={() => onGenerate(form)}
        disabled={!canSubmit || disabled}
        className="w-full h-12 text-base gap-2"
        size="lg"
      >
        {disabled ? (
          <><Lock className="w-5 h-5" /> Upgrade para Pro</>
        ) : (
          <><Rocket className="w-5 h-5" /> Gerar Listing Completo</>
        )}
      </Button>
    </div>
  );
}
