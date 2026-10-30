import { describe, expect, it } from 'vitest';
import {
  analyzeModularSystem,
  buildOperationTable,
  checkMod2HomomorphismExhaustively,
  checkMod2HomomorphismPair,
  gcd,
  mod,
  operate,
} from './ch09';

describe('第 9 章：模运算与运算表', () => {
  it('把负代表元规范化到最小非负剩余', () => {
    expect(mod(-1, 5)).toBe(4);
    expect(mod(-12, 5)).toBe(3);
    expect(mod(12, 5)).toBe(2);
    expect(() => mod(1.5, 5)).toThrow(RangeError);
    expect(() => mod(1, 1)).toThrow(RangeError);
  });

  it('大安全整数输入的中间乘积用 BigInt 保持精确', () => {
    expect(operate(Number.MAX_SAFE_INTEGER, 3, 5, 'multiply')).toBe(3);
    expect(operate(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 7, 'add')).toBe(6);
    expect(() => operate(Number.MAX_SAFE_INTEGER + 1, 1, 5, 'add')).toThrow(RangeError);
  });

  it('生成 Z_4 的加法表和乘法表', () => {
    expect(buildOperationTable(4, 'add')).toEqual([
      [0, 1, 2, 3],
      [1, 2, 3, 0],
      [2, 3, 0, 1],
      [3, 0, 1, 2],
    ]);
    expect(buildOperationTable(4, 'multiply')).toEqual([
      [0, 0, 0, 0],
      [0, 1, 2, 3],
      [0, 2, 0, 2],
      [0, 3, 2, 1],
    ]);
  });

  it('对 2 至 8 阶系统穷举封闭、结合与交换性质', () => {
    for (let modulus = 2; modulus <= 8; modulus += 1) {
      for (const operation of ['add', 'multiply'] as const) {
        const analysis = analyzeModularSystem(modulus, operation);
        expect(analysis.closure.holds).toBe(true);
        expect(analysis.associativity.checked).toBe(modulus ** 3);
        expect(analysis.associativity.holds).toBe(true);
        expect(analysis.commutativity.holds).toBe(true);
        expect(analysis.identity).toBe(operation === 'add' ? 0 : 1);
      }
    }
  });

  it('Z_6 加法中每个元素都有正确的双侧逆元', () => {
    const analysis = analyzeModularSystem(6, 'add');
    expect(analysis.allInvertible).toBe(true);
    expect(analysis.inverses.map((item) => item.inverses)).toEqual([[0], [5], [4], [3], [2], [1]]);
    for (const item of analysis.inverses) {
      const inverse = item.inverses[0];
      expect(operate(item.element, inverse, 6, 'add')).toBe(0);
      expect(operate(inverse, item.element, 6, 'add')).toBe(0);
    }
  });

  it('Z_6 乘法只让与 6 互素的元素可逆，并识别零的不可逆性', () => {
    const analysis = analyzeModularSystem(6, 'multiply');
    expect(analysis.allInvertible).toBe(false);
    expect(analysis.inverses.map((item) => item.inverses)).toEqual([[], [1], [], [], [], [5]]);
    for (const item of analysis.inverses) {
      expect(item.inverses.length > 0).toBe(gcd(item.element, 6) === 1);
    }
    expect(operate(5, 5, 6, 'multiply')).toBe(1);
  });
});

describe('第 9 章：Z_4 到 Z_2 的 mod 2 映射', () => {
  it('逐项计算映射左右两侧，而不是只判断最终布尔值', () => {
    expect(checkMod2HomomorphismPair(3, 2, 'add')).toEqual({
      a: 3,
      b: 2,
      sourceResult: 1,
      left: 1,
      right: 1,
      holds: true,
    });
    expect(checkMod2HomomorphismPair(3, 3, 'multiply')).toEqual({
      a: 3,
      b: 3,
      sourceResult: 1,
      left: 1,
      right: 1,
      holds: true,
    });
    expect(() => checkMod2HomomorphismPair(4, 0, 'add')).toThrow(RangeError);
  });

  it('对加法与乘法分别穷举全部 16 个有序对', () => {
    for (const operation of ['add', 'multiply'] as const) {
      const result = checkMod2HomomorphismExhaustively(operation);
      expect(result.total).toBe(16);
      expect(result.passed).toBe(16);
      expect(result.holds).toBe(true);
      expect(result.counterexample).toBeUndefined();
    }
  });
});
