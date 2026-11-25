export interface IdGenerator {
  next(prefix: string): string;
}

export function createSequentialIds(): IdGenerator {
  const counts = new Map<string, number>();
  return {
    next(prefix) {
      const count = (counts.get(prefix) ?? 0) + 1;
      counts.set(prefix, count);
      return `${prefix}_${count.toString(16).padStart(12, '0')}`;
    },
  };
}

export function createRandomIds(randomBytes: (length: number) => Uint8Array): IdGenerator {
  return {
    next(prefix) {
      const hex = Array.from(randomBytes(6), (byte) => byte.toString(16).padStart(2, '0')).join('');
      return `${prefix}_${hex}`;
    },
  };
}
