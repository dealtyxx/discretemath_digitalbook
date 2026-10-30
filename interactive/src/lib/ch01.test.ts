import { describe, expect, it } from 'vitest';
import {
  combination,
  countingRuleTotal,
  createRsaDemo,
  enumerateSelections,
  euclideanSnapshots,
  extendedGcd,
  gcd,
  modInverse,
  modPow,
  permutation,
  positiveMod,
  validPublicExponents,
} from './ch01';

describe('第1章计数模型', () => {
  it('区分排列与组合，并正确处理空选取', () => {
    expect(permutation(4, 2)).toBe(12);
    expect(combination(4, 2)).toBe(6);
    expect(permutation(8, 0)).toBe(1);
    expect(combination(8, 0)).toBe(1);
    expect(combination(8, 8)).toBe(1);
    expect(() => combination(4, 5)).toThrow(RangeError);
  });

  it('按字典序枚举且不重复、不越界', () => {
    expect(enumerateSelections(3, 2, 'combination')).toEqual([[0, 1], [0, 2], [1, 2]]);
    expect(enumerateSelections(3, 2, 'permutation', 4)).toEqual([[0, 1], [0, 2], [1, 0], [1, 2]]);
    expect(enumerateSelections(3, 0, 'combination')).toEqual([[]]);
    expect(enumerateSelections(3, 2, 'permutation', 0)).toEqual([]);
  });

  it('加法法则对应互斥合并，乘法法则对应分步搭配', () => {
    expect(countingRuleTotal(3, 2, 'addition')).toBe(5);
    expect(countingRuleTotal(3, 2, 'multiplication')).toBe(6);
  });
});

describe('第1章数论模型', () => {
  it('欧几里得快照保留每次带余除法并以非零余数确定 gcd', () => {
    const snapshots = euclideanSnapshots(48, 18);
    expect(snapshots.map(({ a, b, quotient, remainder }) => ({ a, b, quotient, remainder }))).toEqual([
      { a: 48, b: 18, quotient: null, remainder: null },
      { a: 48, b: 18, quotient: 2, remainder: 12 },
      { a: 18, b: 12, quotient: 1, remainder: 6 },
      { a: 12, b: 6, quotient: 2, remainder: 0 },
    ]);
    expect(snapshots.at(-1)?.gcd).toBe(6);
    expect(gcd(-48, 18)).toBe(6);
    expect(gcd(0, 0)).toBe(0);
  });

  it('扩展欧几里得系数满足 Bézout 等式', () => {
    for (const [a, b] of [[20, 7], [7, 20], [0, 9], [9, 0]] as const) {
      const result = extendedGcd(a, b);
      expect(a * result.x + b * result.y).toBe(result.gcd);
      expect(result.gcd).toBe(gcd(a, b));
    }
  });

  it('模逆与模幂处理规范化、负底数和不存在的逆元', () => {
    expect(modInverse(7, 20)).toBe(3);
    expect((7 * modInverse(7, 20)) % 20).toBe(1);
    expect(() => modInverse(2, 4)).toThrow(RangeError);
    expect(modPow(-2, 3, 5)).toBe(2);
    expect(modPow(5, 0, 7)).toBe(1);
    expect(modPow(5, 0, 1)).toBe(0);
    const modulus = Number.MAX_SAFE_INTEGER;
    expect(positiveMod(modulus - 1, modulus)).toBe(modulus - 1);
    expect(modInverse(modulus - 1, modulus)).toBe(modulus - 1);
    expect(modPow(4503599627370495, 2, modulus)).toBe(2251799813685248);
  });

  it('公钥指数只保留与 φ(n) 互素的候选', () => {
    expect(validPublicExponents(20)).toEqual([3, 7, 9, 11, 13, 17, 19]);
  });
});

describe('第1章小整数 RSA', () => {
  it('所有消息都完成加解密往返，包括与 n 不互素的消息', () => {
    const demo = createRsaDemo(3, 11, 7, 0);
    expect(demo).toMatchObject({ n: 33, phi: 20, d: 3, inverseProof: 1 });
    for (let message = 0; message < demo.n; message += 1) {
      const result = createRsaDemo(3, 11, 7, message);
      expect(result.decrypted).toBe(message);
    }
  });

  it('拒绝相同素数、不互素指数与越界消息', () => {
    expect(() => createRsaDemo(3, 3, 7, 0)).toThrow(RangeError);
    expect(() => createRsaDemo(3, 11, 5, 0)).toThrow(RangeError);
    expect(() => createRsaDemo(3, 11, 7, 33)).toThrow(RangeError);
  });
});
