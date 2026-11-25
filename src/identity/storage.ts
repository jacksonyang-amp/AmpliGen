export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface MemoryStorage extends StorageLike {
  dump(): Record<string, string>;
}

export function createMemoryStorage(initial: Record<string, string> = {}): MemoryStorage {
  const items = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => {
      items.set(key, value);
    },
    removeItem: (key) => {
      items.delete(key);
    },
    dump: () => Object.fromEntries(items),
  };
}
