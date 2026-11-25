import { actionRegistry } from '../contract/registry.ts';
import type { FlowContext } from '../flow/handlers.ts';
import { createRandomIds } from '../identity/ids.ts';
import { createMemoryStorage } from '../identity/storage.ts';
import type { StorageLike } from '../identity/storage.ts';

function browserStorage(read: () => Storage): StorageLike {
  try {
    const storage = read();
    const probe = 'ampligen.storage.probe';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return storage;
  } catch {
    return createMemoryStorage();
  }
}

let context: FlowContext | undefined;

export function getBrowserContext(): FlowContext {
  context ??= {
    identityStorage: browserStorage(() => window.localStorage),
    navigationStorage: browserStorage(() => window.sessionStorage),
    ids: createRandomIds((length) => window.crypto.getRandomValues(new Uint8Array(length))),
    registry: actionRegistry,
    origin: 'browser',
  };
  return context;
}
