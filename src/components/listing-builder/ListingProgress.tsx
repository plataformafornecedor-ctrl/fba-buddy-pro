import { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';

const STEPS = [
  'A analisar produto...',
  'A pesquisar keywords relevantes...',
  'A gerar título optimizado...',
  'A criar bullet points...',
  'A escrever descrição...',
  'A compilar backend keywords...',
  'A finalizar listing...',
];

export default function ListingProgress() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= STEPS.length - 1) return prev;
        return prev + 1;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card p-8 max-w-lg mx-auto">
      <div className="space-y-4">
        {STEPS.map((step, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            {i < currentStep ? (
              <Check className="w-5 h-5 text-green-500 shrink-0" />
            ) : i === currentStep ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-full border border-border shrink-0" />
            )}
            <span className={i <= currentStep ? 'text-foreground' : 'text-muted-foreground'}>
              {step}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center mt-6">
        Tempo estimado: ~15 segundos
      </p>
    </div>
  );
}
