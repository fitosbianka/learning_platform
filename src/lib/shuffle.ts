/**
 * Small seeded random number generator (mulberry32) and a deterministic
 * Fisher Yates shuffle. The quiz uses a fixed seed per attempt so the
 * question and option order stays stable across re renders and only
 * changes when a new attempt starts.
 */

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Returns a new shuffled array, the input stays untouched. */
export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const random = mulberry32(seed);
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const a = result[i] as T;
    result[i] = result[j] as T;
    result[j] = a;
  }
  return result;
}

/** Seed for a fresh quiz attempt. */
export function newSeed(): number {
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}
