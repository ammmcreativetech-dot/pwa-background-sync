/**
 * pwa-background-sync
 * -------------------
 * Tiny, dependency-free helpers for the PWA Background Sync and Periodic Background
 * Sync APIs: register deferred syncs that fire when connectivity returns — even if
 * the tab is closed — and message your Service Worker.
 *
 * Everything no-ops gracefully where the API is unsupported (Safari, Firefox), so
 * callers don't need feature-detection branches. Pair with an `online`-event
 * fallback for full coverage.
 */

async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}

/** Whether one-shot Background Sync is available in this browser. */
export async function isBackgroundSyncSupported(): Promise<boolean> {
  const reg = await getRegistration();
  return reg !== null && 'sync' in reg;
}

/** Whether Periodic Background Sync is available (Chrome/Edge, installed PWA). */
export async function isPeriodicSyncSupported(): Promise<boolean> {
  const reg = await getRegistration();
  return reg !== null && 'periodicSync' in reg;
}

/**
 * Register a one-shot Background Sync under `tag`. The browser fires the Service
 * Worker `sync` event with this tag once connectivity is restored. Returns whether
 * registration succeeded (false = unsupported or registration failed).
 *
 * @example
 * await queueOfflineMutation(data);
 * await registerBackgroundSync('flush-mutations');
 */
export async function registerBackgroundSync(tag: string): Promise<boolean> {
  const reg = await getRegistration();
  if (!reg || !('sync' in reg)) return false;
  try {
    await (reg as unknown as { sync: { register(tag: string): Promise<void> } }).sync.register(tag);
    return true;
  } catch {
    return false;
  }
}

export interface PeriodicSyncOptions {
  /** Minimum interval between syncs, in milliseconds. Default 12 hours. */
  minIntervalMs?: number;
}

/**
 * Register a Periodic Background Sync under `tag` (fires roughly every
 * `minIntervalMs` while online + idle, even with no tab open). Requires an
 * installed PWA and granted `periodic-background-sync` permission.
 */
export async function registerPeriodicSync(
  tag: string,
  options: PeriodicSyncOptions = {},
): Promise<boolean> {
  const minInterval = options.minIntervalMs ?? 12 * 60 * 60 * 1000;
  const reg = await getRegistration();
  if (!reg || !('periodicSync' in reg)) return false;
  try {
    await (reg as unknown as {
      periodicSync: { register(tag: string, opts: { minInterval: number }): Promise<void> };
    }).periodicSync.register(tag, { minInterval });
    return true;
  } catch {
    return false;
  }
}

/**
 * Unregister a previously registered Periodic Background Sync.
 */
export async function unregisterPeriodicSync(tag: string): Promise<boolean> {
  const reg = await getRegistration();
  if (!reg || !('periodicSync' in reg)) return false;
  try {
    await (reg as unknown as {
      periodicSync: { unregister(tag: string): Promise<void> };
    }).periodicSync.unregister(tag);
    return true;
  } catch {
    return false;
  }
}

/**
 * Post a message to the active Service Worker — e.g. to hand it an auth token so
 * it can make authenticated requests during a headless background sync.
 * Returns whether a message was dispatched.
 */
export async function postMessageToServiceWorker(message: unknown): Promise<boolean> {
  const reg = await getRegistration();
  if (!reg?.active) return false;
  try {
    reg.active.postMessage(message);
    return true;
  } catch {
    return false;
  }
}
