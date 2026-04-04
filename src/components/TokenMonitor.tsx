import { useState, useEffect, useCallback } from 'react';
import { Key } from 'lucide-react';
import { getTokenState, onTokenStateChange } from '@/lib/token-state';
import { getQueueLength, onQueueChange } from '@/lib/rate-limiter';
import { fetchTokenStatus } from '@/lib/api';
import { cn } from '@/lib/utils';

export function TokenMonitor() {
  const [tokens, setTokens] = useState(getTokenState());
  const [queueLen, setQueueLen] = useState(getQueueLength());

  useEffect(() => {
    // Fetch initial token status
    fetchTokenStatus();
    // Refresh every 5 minutes
    const interval = setInterval(() => fetchTokenStatus(), 5 * 60 * 1000);
    const unsub1 = onTokenStateChange(setTokens);
    const unsub2 = onQueueChange(setQueueLen);
    return () => { clearInterval(interval); unsub1(); unsub2(); };
  }, []);

  const tokensLeft = tokens.tokensLeft;
  const isWarning = tokensLeft !== null && tokensLeft < 100;
  const isCritical = tokensLeft !== null && tokensLeft < 20;

  return (
    <div className="flex items-center gap-1.5">
      <Key className={cn(
        "w-3.5 h-3.5",
        isCritical ? "text-red-500" : isWarning ? "text-amber-500" : "text-muted-foreground"
      )} />
      <span className={cn(
        "text-xs font-mono hidden sm:inline",
        isCritical ? "text-red-500" : isWarning ? "text-amber-500" : "text-muted-foreground"
      )}>
        {tokensLeft !== null ? tokensLeft : '—'}
      </span>
      {isCritical && <span className="text-xs">🔴</span>}
      {isWarning && !isCritical && <span className="text-xs">⚠️</span>}
      {queueLen > 0 && (
        <span className="text-xs text-muted-foreground ml-1">({queueLen} queued)</span>
      )}
    </div>
  );
}
