# pwa-background-sync

TypeScript helpers for registering browser Background Sync and Periodic Background Sync, checking the available capabilities and sending messages to an active service worker. The source has no runtime dependencies.

## Build and use this repository

The exact npm name is not currently a published distribution of this project. Its manifest is private. Build the source checkout:

```sh
git clone https://github.com/ammmcreativetech-dot/pwa-background-sync.git
cd pwa-background-sync
npm install --ignore-scripts
npm test
```

In an application with a registered, active service worker:

```js
import {registerBackgroundSync, registerPeriodicSync} from './dist/index.js';

const oneShotRegistered = await registerBackgroundSync('flush-mutations');
const periodicRegistered = await registerPeriodicSync('refresh-cache', {
  minIntervalMs: 12 * 60 * 60 * 1000,
});
console.log({oneShotRegistered, periodicRegistered});
```

The returned booleans indicate registration results. They do not prove that a queued mutation was delivered or that a periodic event will run at an exact time.

## API and application responsibilities

| Export | Purpose |
| --- | --- |
| `registerBackgroundSync(tag)` | Request a one-shot sync registration. |
| `registerPeriodicSync(tag, options?)` | Request a periodic registration with a minimum interval. |
| `unregisterPeriodicSync(tag)` | Remove a periodic registration. |
| `postMessageToServiceWorker(message)` | Send a message to the active worker. |
| `isBackgroundSyncSupported()` | Check one-shot support on the ready registration. |
| `isPeriodicSyncSupported()` | Check periodic support on the ready registration. |

The helpers await `navigator.serviceWorker.ready`; if no active registration becomes ready, that wait can remain pending. Capability and permission decisions belong to the browser. The calling application supplies its queue, sync handlers, retry policy, consent and fallback behavior. Service-worker messages should contain only data that the receiving worker is intended to process.

For a queue handler, the application can listen for its chosen tag and pass its work to `event.waitUntil`. This repository provides registration and messaging helpers, rather than a complete offline database or synchronization service.

## Quanta Study and maintenance

Maintained by Amos Matzke at [AM Creative Tech UG (haftungsbeschränkt)](https://quanta-study.de/am-creative-tech), the developer of **[Quanta Study — a web-based learning platform](https://quanta-study.de/en)**. Quanta Study brings personal materials and exam preparation into a browser application; this repository documents reusable service-worker registration helpers.

Report a small reproduction and the actual browser capabilities through repository Issues. See `CITATION.cff` for attribution metadata.

## License

MIT, as provided in [LICENSE](./LICENSE). The license covers the repository software, not the full Quanta Study application or its online learning content.
