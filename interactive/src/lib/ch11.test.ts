import { describe, expect, it } from 'vitest';
import {
  analyzeModularRing,
  booleanTruthTable,
  buildDivisorLattice,
  buildSubsetLattice,
  checkComplement,
  checkDeMorgan,
  checkDualIdentities,
  evaluateBoolean,
  gcd,
  isPrime,
  latticeBounds,
  mod,
  modularInverse,
  modularTable,
  type Bit,
} from './ch11';

const bits: Bit[] = [0, 1];

describe('第11章：模运算与环域判定', () => {
  it('模运算规范化负代表元并拒绝非法模数', () => {
    expect(mod(-1, 5)).toBe(4);
    expect(mod(13, 5)).toBe(3);
    expect(() => mod(1, 1)).toThrow(RangeError);
    expect(() => mod(1.5, 5)).toThrow(RangeError);
  });

  it('生成正确的加法表和乘法表', () => {
    expect(modularTable(4, 'addition')).toEqual([
      [0, 1, 2, 3],
      [1, 2, 3, 0],
      [2, 3, 0, 1],
      [3, 0, 1, 2],
    ]);
    expect(modularTable(4, 'multiplication')[3]).toEqual([0, 3, 2, 1]);
  });

  it('在 2..7 中，Z_m 是域当且仅当 m 为素数', () => {
    for (let modulus = 2; modulus <= 7; modulus += 1) {
      const analysis = analyzeModularRing(modulus);
      expect(analysis.isRing).toBe(true);
      expect(analysis.isCommutativeRing).toBe(true);
      expect(analysis.isPrime).toBe(isPrime(modulus));
      expect(analysis.isField).toBe(isPrime(modulus));
      expect(analysis.isIntegralDomain).toBe(isPrime(modulus));
      if (analysis.zeroDivisorWitness) {
        const { a, b } = analysis.zeroDivisorWitness;
        expect(a).not.toBe(0);
        expect(b).not.toBe(0);
        expect(mod(a * b, modulus)).toBe(0);
      }
    }
    expect(analyzeModularRing(6).zeroDivisorWitness).toEqual({ a: 2, b: 3 });
    expect(analyzeModularRing(6).zeroDivisors).toEqual([2, 3, 4]);
    expect(analyzeModularRing(4).units).toEqual([1, 3]);
  });

  it('计算乘法逆元和最大公因数边界', () => {
    expect(modularInverse(3, 7)).toBe(5);
    expect(modularInverse(2, 6)).toBeNull();
    expect(modularInverse(0, 7)).toBeNull();
    expect(modularInverse(-1, 5)).toBe(4);
    expect(gcd(-12, 18)).toBe(6);
    expect(gcd(0, 0)).toBe(0);
  });

  it('安全整数边界的模规范化与模逆不因中间加乘丢失精度', () => {
    const modulus = Number.MAX_SAFE_INTEGER;
    expect(mod(modulus - 1, modulus)).toBe(modulus - 1);
    expect(mod(-modulus + 1, modulus)).toBe(1);
    expect(modularInverse(modulus - 1, modulus)).toBe(modulus - 1);
    expect(() => mod(modulus + 1, 5)).toThrow(RangeError);
    expect(() => mod(1, modulus + 1)).toThrow(RangeError);
    expect(isPrime(modulus + 2)).toBe(false);
  });
});

describe('第11章：哈斯覆盖与上下确界', () => {
  it('D_12 只保留覆盖边，并计算 4 与 6 的 join/meet', () => {
    const lattice = buildDivisorLattice(12);
    expect(lattice.elements).toEqual([1, 2, 3, 4, 6, 12]);
    expect(lattice.covers).toHaveLength(7);
    expect(lattice.covers).not.toContainEqual([1, 4]);
    expect(lattice.covers).not.toContainEqual([1, 12]);
    const bounds = latticeBounds(lattice, 4, 6);
    expect(bounds.upperBounds).toEqual([12]);
    expect(bounds.lowerBounds).toEqual([1, 2]);
    expect(bounds.join).toBe(12);
    expect(bounds.meet).toBe(2);
  });

  it('子集格以并集为 join、交集为 meet', () => {
    const lattice = buildSubsetLattice(['a', 'b', 'c']);
    expect(lattice.elements).toHaveLength(8);
    expect(lattice.covers).toHaveLength(12);
    expect(lattice.labels[0]).toBe('∅');
    expect(lattice.labels[5]).toBe('{a,c}');
    const bounds = latticeBounds(lattice, 1, 6);
    expect(bounds.upperBounds).toEqual([7]);
    expect(bounds.lowerBounds).toEqual([0]);
    expect(bounds.join).toBe(7);
    expect(bounds.meet).toBe(0);
  });

  it('两个示例格的任意元素对都有唯一最小上界和最大下界', () => {
    for (const lattice of [buildDivisorLattice(12), buildSubsetLattice()]) {
      for (const a of lattice.elements) {
        for (const b of lattice.elements) {
          const bounds = latticeBounds(lattice, a, b);
          expect(bounds.join).not.toBeNull();
          expect(bounds.meet).not.toBeNull();
          expect(bounds.upperBounds[0]).toBe(bounds.join);
          expect(bounds.lowerBounds.at(-1)).toBe(bounds.meet);
          if (a === b) {
            expect(bounds.join).toBe(a);
            expect(bounds.meet).toBe(a);
          }
        }
      }
    }
    expect(() => latticeBounds(buildDivisorLattice(12), 5, 6)).toThrow(RangeError);
  });
});

describe('第11章：布尔代数', () => {
  it('AND、OR、NOT 真值表完整且结果正确', () => {
    expect(booleanTruthTable('and').map((row) => row.result)).toEqual([0, 0, 0, 1]);
    expect(booleanTruthTable('or').map((row) => row.result)).toEqual([0, 1, 1, 1]);
    expect(booleanTruthTable('not')).toEqual([
      { a: 0, b: null, result: 1 },
      { a: 1, b: null, result: 0 },
    ]);
    expect(evaluateBoolean('not', 0, 1)).toBe(1);
  });

  it('全部输入组合都满足德摩根律、对偶单位元律和互补律', () => {
    for (const a of bits) {
      expect(checkDualIdentities(a)).toEqual({ orZero: a, andOne: a, holds: true });
      expect(checkComplement(a)).toEqual({ notA: a === 0 ? 1 : 0, join: 1, meet: 0, holds: true });
      for (const b of bits) {
        const result = checkDeMorgan(a, b);
        expect(result.andLeft).toBe(result.andRight);
        expect(result.orLeft).toBe(result.orRight);
        expect(result.holds).toBe(true);
      }
    }
  });
});
