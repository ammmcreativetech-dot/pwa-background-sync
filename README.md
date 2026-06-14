# pwa-background-sync

> Tiny, dependency-free helpers for the **Background Sync** and **Periodic Background Sync** APIs — register deferred syncs that fire when connectivity returns (even with the tab closed) and message your Service Worker. Graceful no-ops where unsupported.

![types](https://img.shields.io/badge/types-included-blue)
![dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)
![license](https://img.shields.io/badge/license-MIT-green)

The Background Sync APIs are powerful but verbose to use safely: every call needs a `navigator.serviceWorker.ready` await, a feature-detection guard, and a try/catch (registration throws on unsupported browsers and when permission is denied). This wraps all of that into four one-liners that simply return `true`/`false`.

```bash
npm install pwa-background-sync
```

## Usage

```ts
import {
  registerBackgroundSync,
  registerPeriodicSync,
  postMessageToServiceWorker,
  isBackgroundSyncSupported,
} from 'pwa-background-sync';

// 1. After queuing an offline mutation, ask the browser to retry it when back online
await queueOfflineMutation(data);
await registerBackgroundSync('flush-mutations');   // → SW gets a `sync` event with this tag

// 2. Keep an offline cache fresh roughly every 12h (installed PWA, Chrome/Edge)
await registerPeriodicSync('refresh-cache', { minIntervalMs: 12 * 60 * 60 * 1000 });

// 3. Hand the SW an auth token so it can sync headlessly (no tab open)
await postMessageToServiceWorker({ type: 'STORE_AUTH_TOKEN', token });

// 4. Branch on support if you want a custom fallback
if (!(await isBackgroundSyncSupported())) startOnlineEventFallback();
```

Then in your Service Worker:

```js
self.addEventListener('sync', (event) => {
  if (event.tag === 'flush-mutations') event.waitUntil(flushQueue());
});
```

## API

| Function | Returns | |
| --- | --- | --- |
| `registerBackgroundSync(tag)` | `Promise<boolean>` | one-shot sync on reconnect |
| `registerPeriodicSync(tag, { minIntervalMs? })` | `Promise<boolean>` | recurring sync (default 12h) |
| `unregisterPeriodicSync(tag)` | `Promise<boolean>` | remove a periodic sync |
| `postMessageToServiceWorker(message)` | `Promise<boolean>` | message the active SW |
| `isBackgroundSyncSupported()` / `isPeriodicSyncSupported()` | `Promise<boolean>` | feature detection |

Every function returns `false` instead of throwing when the API is unavailable, so you never need a guard.

## Browser support

Background Sync: Chrome, Edge, Opera, most Chromium browsers. Periodic Sync additionally needs an installed PWA. Safari and Firefox return `false` — fall back to the `online` event.

## Why this exists

Extracted from the offline-first PWA layer of **[quanta-study.de](https://quanta-study.de)**, where answers queued offline sync back automatically the moment the device reconnects, tab open or not.

## License

MIT © [Amos Matzke](https://www.linkedin.com/in/amos-matzke-71a73139a) · [quanta-study.de](https://quanta-study.de)
