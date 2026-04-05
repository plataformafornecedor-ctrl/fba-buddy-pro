// Keepa API cache with localStorage persistence

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const SEARCH_TTL = 24 * 60 * 60 * 1000; // 24 hours
const PRODUCT_TTL = 12 * 60 * 60 * 1000; // 12 hours

function getCacheKey(type: 'search' | 'product', id: string, marketplace: string): string {
  return `keepa_${type}_${id.toLowerCase().trim()}_${marketplace}`;
}

export function getCached<T>(type: 'search' | 'product', id: string, marketplace: string): { data: T; isCached: true } | null {
  try {
    const key = getCacheKey(type, id, marketplace);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > entry.ttl) {
      localStorage.removeItem(key);
      return null;
    }
    return { data: entry.data, isCached: true };
  } catch {
    return null;
  }
}

export function setCache<T>(type: 'search' | 'product', id: string, marketplace: string, data: T): void {
  try {
    const key = getCacheKey(type, id, marketplace);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: type === 'search' ? SEARCH_TTL : PRODUCT_TTL,
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    clearOldCache();
  }
}

function clearOldCache() {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('keepa_'));
    const entries = keys.map(k => {
      try {
        const raw = localStorage.getItem(k);
        const parsed = raw ? JSON.parse(raw) : null;
        return { key: k, timestamp: parsed?.timestamp || 0 };
      } catch {
        return { key: k, timestamp: 0 };
      }
    }).sort((a, b) => a.timestamp - b.timestamp);
    
    const toRemove = entries.slice(0, Math.ceil(entries.length / 2));
    toRemove.forEach(e => localStorage.removeItem(e.key));
  } catch { /* ignore */ }
}
