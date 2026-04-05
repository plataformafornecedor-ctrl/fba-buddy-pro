import { useState, useEffect } from 'react';
import { Key } from 'lucide-react';
import { getTokenState, onTokenStateChange } from '@/lib/token-state';
import { getQueueLength, onQueueChange } from '@/lib/rate-limiter';
import { fetchTokenStatus } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';

export function TokenMonitor() {
  const { t } = useLanguage();
  const [tokens, setTokens] = useState(getTokenState());
  const [queueLen, setQueueLen] = useState(getQueueLength());

  useEffect(() => {
    fetchTokenStatus();
    const interval = setInterval(() => fetchTokenStatus(), 5 * 60 * 1000);
    const unsub1 = onTokenStateChange(setTokens);
    const unsub2 = onQueueChange(setQueueLen);
    return () => { clearInterval(interval); unsub1(); unsub2(); };
  }, []);

  const tokensLeft = tokens.tokensLeft;
  const isCritical = tokensLeft !== null && tokensLeft < 50;
  const isWarning = tokensLeft !== null && tokensLeft >= 50 && tokensLeft <= 200;
  const isGood = tokensLeft !== null && tokensLeft > 200;

  return (
    <div className="flex items-center gap-1.5">
      <Key className={cn(
        "w-3.5 h-3.5",
        isCritical ? "text-destructive" : isWarning ? "text-amber-500" : isGood ? "text-emerald-500" : "text-muted-foreground"
      )} />
      <span className={cn(
        "text-xs font-mono hidden sm:inline",
        isCritical ? "text-destructive" : isWarning ? "text-amber-500" : isGood ? "text-emerald-500" : "text-muted-foreground"
      )}>
        {tokensLeft !== null ? tokensLeft : '—'}
      </span>
      {isCritical && <span className="text-xs">🔴</span>}
      {isWarning && <span className="text-xs">⚠️</span>}
      {isGood && <span className="text-xs">🟢</span>}
      {queueLen > 0 && (
        <span className="text-xs text-muted-foreground ml-1">({queueLen} queued)</span>
      )}
      {isCritical && tokensLeft !== null && tokensLeft <= 0 && (
        <span className="text-xs text-destructive ml-1 hidden md:inline">Mock mode</span>
      )}
    </div>
  );
}
