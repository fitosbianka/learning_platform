import { describe, expect, it } from 'vitest';
import { mulberry32, newSeed, seededShuffle } from '../lib/shuffle';

describe('seededShuffle', () => {
  const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  it('is deterministic for the same seed', () => {
    const first = seededShuffle(items, 42);
    const second = seededShuffle(items, 42);
    expect(first).toEqual(second);
  });

  it('always returns a permutation of the input', () => {
    for (let seed = 0; seed < 50; seed += 1) {
      const shuffled = seededShuffle(items, seed);
      expect(shuffled.slice().sort()).toEqual(items.slice().sort());
      expect(shuffled).toHaveLength(items.length);
    }
  });

  it('produces different orders for different seeds', () => {
    const orders = new Set<string>();
    for (let seed = 0; seed < 20; seed += 1) {
      orders.add(seededShuffle(items, seed).join(''));
    }
    expect(orders.size).toBeGreaterThan(10);
  });

  it('does not mutate the input', () => {
    const input = [1, 2, 3, 4];
    seededShuffle(input, 7);
    expect(input).toEqual([1, 2, 3, 4]);
  });

  it('handles empty and single element arrays', () => {
    expect(seededShuffle([], 1)).toEqual([]);
    expect(seededShuffle(['x'], 1)).toEqual(['x']);
  });
});

describe('mulberry32', () => {
  it('yields numbers in the half open unit interval', () => {
    const random = mulberry32(123);
    for (let i = 0; i < 1000; i += 1) {
      const n = random();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });

  it('newSeed returns an unsigned integer', () => {
    for (let i = 0; i < 20; i += 1) {
      const seed = newSeed();
      expect(Number.isInteger(seed)).toBe(true);
      expect(seed).toBeGreaterThanOrEqual(0);
    }
  });
});
