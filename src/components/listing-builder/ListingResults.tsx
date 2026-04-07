import { useState } from 'react';
import { Copy, Check, RefreshCw, Save, Edit, Camera, Search, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { ListingData } from '@/pages/ListingBuilder';

interface ListingResultsProps {
  listing: ListingData;
  onRegenerate: () => void;
  onSave: () => void;
  onEdit: () => void;
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copiado!');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="outline" size="sm" onClick={copy} className="gap-1.5 text-xs">
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {label || 'Copiar'}
    </Button>
  );
}

function CharCounter({ current, max }: { current: number; max: number }) {
  const ok = current <= max;
  return (
    <span className={`text-xs ${ok ? 'text-green-500' : 'text-destructive'}`}>
      {current}/{max} {ok ? '✅' : '⚠️'}
    </span>
  );
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground w-24">{label}</span>
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${score}%`,
            backgroundColor: score >= 80 ? 'hsl(var(--primary))' : score >= 60 ? 'hsl(40, 90%, 50%)' : 'hsl(0, 70%, 50%)',
          }}
        />
      </div>
      <span className="text-sm font-medium w-16 text-right">{score}/100</span>
    </div>
  );
}

const IMAGE_GUIDE = [
  { slot: 1, type: 'Principal', priority: 'Obrigatória', icon: '📷', desc: 'Produto em fundo branco puro, sem texto, sem logos, produto ocupa 85% do frame. Resolução: 2000x2000px' },
  { slot: 2, type: 'Lifestyle', priority: 'Recomendada', icon: '🌟', desc: 'Produto em uso no contexto real. Ex: pessoa a fazer yoga com o tapete em ambiente luminoso e natural' },
  { slot: 3, type: 'Características', priority: 'Recomendada', icon: '📊', desc: 'Infográfico com as 4 principais características com ícones e texto curto' },
  { slot: 4, type: 'Dimensões', priority: 'Recomendada', icon: '📐', desc: 'Diagrama técnico com medidas exactas e comparação de tamanho' },
  { slot: 5, type: 'Benefícios', priority: 'Recomendada', icon: '✨', desc: 'Antes/depois ou comparação com produto genérico da concorrência' },
  { slot: 6, type: 'Embalagem', priority: 'Recomendada', icon: '📦', desc: 'Produto com embalagem, ideal para mostrar como chegará ao cliente' },
  { slot: 7, type: 'Variações', priority: 'Opcional', icon: '🎨', desc: 'Grid com todas as cores/tamanhos disponíveis em fundo branco' },
];

export default function ListingResults({ listing, onRegenerate, onSave, onEdit }: ListingResultsProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(listing.title);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">📌 TÍTULO</h3>
          <CharCounter current={title.length} max={200} />
        </div>
        {editingTitle ? (
          <div className="space-y-2">
            <Input value={title} onChange={e => setTitle(e.target.value)} maxLength={200} />
            <Button size="sm" onClick={() => setEditingTitle(false)}>Guardar</Button>
          </div>
        ) : (
          <p className="text-sm leading-relaxed">{title}</p>
        )}
        <div className="flex gap-2">
          <CopyButton text={title} />
          <Button variant="ghost" size="sm" onClick={() => setEditingTitle(!editingTitle)} className="gap-1.5 text-xs">
            <Edit className="w-3 h-3" /> Editar
          </Button>
        </div>
      </div>

      {/* Bullets */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">🎯 BULLET POINTS</h3>
          <CopyButton text={listing.bullets.join('\n\n')} label="Copiar Todos" />
        </div>
        {listing.bullets.map((bullet, i) => (
          <div key={i} className="border border-border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">Bullet {i + 1}</Badge>
              <CharCounter current={bullet.length} max={500} />
            </div>
            <p className="text-sm leading-relaxed">{bullet}</p>
            <CopyButton text={bullet} />
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">📝 DESCRIÇÃO</h3>
          <CharCounter current={listing.description.length} max={2000} />
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{listing.description}</p>
        <CopyButton text={listing.description} />
      </div>

      {/* Backend Keywords */}
      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">🔍 BACKEND KEYWORDS</h3>
          <CharCounter current={new TextEncoder().encode(listing.backend_keywords).length} max={250} />
        </div>
        <p className="text-sm text-muted-foreground font-mono bg-secondary/50 rounded-lg p-3">
          {listing.backend_keywords}
        </p>
        <CopyButton text={listing.backend_keywords} />
      </div>

      {/* Image Guide */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Camera className="w-4 h-4" /> GUIA DE IMAGENS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {IMAGE_GUIDE.map(img => (
            <div key={img.slot} className="border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {img.icon} Imagem {img.slot} — {img.type}
                </span>
                <Badge variant={img.priority === 'Obrigatória' ? 'default' : 'secondary'} className="text-xs">
                  {img.priority === 'Obrigatória' && <Star className="w-3 h-3 mr-1" />}
                  {img.priority}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{img.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SEO Score */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Search className="w-4 h-4" /> SEO SCORE
          </h3>
          <div className="text-2xl font-bold text-primary">{listing.seo_score.overall}/100</div>
        </div>
        <div className="space-y-3">
          <ScoreBar score={listing.seo_score.title} label="Título" />
          <ScoreBar score={listing.seo_score.bullets} label="Bullets" />
          <ScoreBar score={listing.seo_score.description} label="Descrição" />
          <ScoreBar score={listing.seo_score.keywords} label="Keywords" />
        </div>
        {listing.seo_score.suggestion && (
          <div className="bg-secondary/50 rounded-lg p-3 text-sm text-muted-foreground">
            💡 {listing.seo_score.suggestion}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={onRegenerate} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Regenerar
        </Button>
        <Button onClick={onSave} className="gap-2">
          <Save className="w-4 h-4" /> Guardar Listing
        </Button>
        <Button variant="ghost" onClick={onEdit} className="gap-2">
          <Edit className="w-4 h-4" /> Editar Tudo
        </Button>
      </div>
    </div>
  );
}
