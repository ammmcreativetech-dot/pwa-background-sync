import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isBackgroundSyncSupported,
  registerBackgroundSync,
  registerPeriodicSync,
  postMessageToServiceWorker,
} from '../dist/index.js';

test('no-ops gracefully when Service Worker is unavailable', async () => {
  assert.equal(await isBackgroundSyncSupported(), false);
  assert.equal(await registerBackgroundSync('x'), false);
  assert.equal(await postMessageToServiceWorker({ a: 1 }), false);
});

test('registers sync + periodic and posts a message when supported', async () => {
  const calls = { sync: null, periodic: null, msg: null };
  globalThis.navigator = {
    serviceWorker: {
      ready: Promise.resolve({
        sync: { register: async (tag) => { calls.sync = tag; } },
        periodicSync: { register: async (tag, opts) => { calls.periodic = { tag, opts }; } },
        active: { postMessage: (m) => { calls.msg = m; } },
      }),
    },
  };
  try {
    assert.equal(await isBackgroundSyncSupported(), true);

    assert.equal(await registerBackgroundSync('flush-mutations'), true);
    assert.equal(calls.sync, 'flush-mutations');

    assert.equal(await registerPeriodicSync('refresh', { minIntervalMs: 1000 }), true);
    assert.deepEqual(calls.periodic, { tag: 'refresh', opts: { minInterval: 1000 } });

    assert.equal(await postMessageToServiceWorker({ type: 'STORE_TOKEN', v: 1 }), true);
    assert.deepEqual(calls.msg, { type: 'STORE_TOKEN', v: 1 });
  } finally {
    delete globalThis.navigator;
  }
});
