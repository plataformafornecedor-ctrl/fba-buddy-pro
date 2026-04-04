// Rate limiter: max 1 API call per 10 seconds, with queue

type QueuedCall<T> = {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (err: any) => void;
};

const queue: QueuedCall<any>[] = [];
let lastCallTime = 0;
let processing = false;
const MIN_INTERVAL = 10_000; // 10 seconds

let queueChangeListeners: Array<(count: number) => void> = [];

export function onQueueChange(listener: (count: number) => void) {
  queueChangeListeners.push(listener);
  return () => {
    queueChangeListeners = queueChangeListeners.filter(l => l !== listener);
  };
}

function notifyQueueChange() {
  queueChangeListeners.forEach(l => l(queue.length));
}

async function processQueue() {
  if (processing || queue.length === 0) return;
  processing = true;

  while (queue.length > 0) {
    const now = Date.now();
    const waitTime = Math.max(0, MIN_INTERVAL - (now - lastCallTime));
    
    if (waitTime > 0) {
      await new Promise(r => setTimeout(r, waitTime));
    }

    const item = queue.shift()!;
    notifyQueueChange();
    lastCallTime = Date.now();
    
    try {
      const result = await item.fn();
      item.resolve(result);
    } catch (err) {
      item.reject(err);
    }
  }

  processing = false;
}

export function enqueueApiCall<T>(fn: () => Promise<T>): Promise<T> {
  // If enough time has passed, execute immediately
  const now = Date.now();
  if (queue.length === 0 && !processing && (now - lastCallTime) >= MIN_INTERVAL) {
    lastCallTime = now;
    return fn();
  }

  return new Promise<T>((resolve, reject) => {
    queue.push({ fn, resolve, reject });
    notifyQueueChange();
    processQueue();
  });
}

export function getQueueLength(): number {
  return queue.length;
}
