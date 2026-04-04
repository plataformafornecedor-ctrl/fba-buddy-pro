// Token state management
interface TokenState {
  tokensLeft: number | null;
  refillIn: number | null;
  lastUpdated: number | null;
}

let state: TokenState = { tokensLeft: null, refillIn: null, lastUpdated: null };
let listeners: Array<(s: TokenState) => void> = [];

export function getTokenState(): TokenState {
  return state;
}

export function updateTokenState(tokensLeft: number | null, refillIn: number | null) {
  state = { tokensLeft, refillIn, lastUpdated: Date.now() };
  listeners.forEach(l => l(state));
}

export function onTokenStateChange(listener: (s: TokenState) => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

export function shouldUseMockData(): boolean {
  return state.tokensLeft !== null && state.tokensLeft < 20;
}
