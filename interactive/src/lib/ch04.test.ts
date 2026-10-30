import { describe, expect, it } from 'vitest';
import {
  analyzeMapping,
  checkPartialOrder,
  createMapping,
  doublingPreview,
  hasseCovers,
  isCover,
  pairBounds,
} from './ch04';

describe('第4章整除偏序与哈斯图', () => {
  it('12 的正因数覆盖边不含自反边和传递冗余边', () => {
    expect(hasseCovers()).toEqual([
      { lower: 1, upper: 2 },
      { lower: 1, upper: 3 },
      { lower: 2, upper: 4 },
      { lower: 2, upper: 6 },
      { lower: 3, upper: 6 },
      { lower: 4, upper: 12 },
      { lower: 6, upper: 12 },
    ]);
    expect(isCover(2, 4)).toBe(true);
    expect(isCover(1, 4)).toBe(false);
    expect(isCover(3, 4)).toBe(false);
    expect(isCover(6, 6)).toBe(false);
  });

  it('4 与 6 的全部上下界以及 meet/join 正确', () => {
    expect(pairBounds(4, 6)).toEqual({
      upperBounds: [12],
      lowerBounds: [1, 2],
      join: 12,
      meet: 2,
    });
  });

  it('2 与 3 不可比，但 join 是 6，meet 是 1', () => {
    expect(pairBounds(2, 3)).toEqual({
      upperBounds: [6, 12],
      lowerBounds: [1],
      join: 6,
      meet: 1,
    });
  });

  it('整除关系通过偏序三公理，恒真关系则失去反对称', () => {
    expect(checkPartialOrder().holds).toBe(true);
    expect(checkPartialOrder([1, 2], () => true)).toMatchObject({ antisymmetric: false, holds: false });
  });
});

describe('第4章有限映射', () => {
  it('一一对应同时是函数、单射、满射和双射', () => {
    const analysis = analyzeMapping(createMapping(3, 3, [[0, 0], [1, 1], [2, 2]]), 3);
    expect(analysis).toMatchObject({ isFunction: true, isInjective: true, isSurjective: true, isBijective: true });
    expect(analysis.uncoveredOutputs).toEqual([]);
  });

  it('3 到 2 的覆盖映射是满射但非单射', () => {
    const analysis = analyzeMapping(createMapping(3, 2, [[0, 0], [1, 1], [2, 1]]), 2);
    expect(analysis).toMatchObject({ isFunction: true, isInjective: false, isSurjective: true, isBijective: false });
    expect(analysis.injectionConflicts).toEqual([{ rows: [1, 2], output: 1 }]);
  });

  it('2 到 3 的不同像映射是单射但非满射', () => {
    const analysis = analyzeMapping(createMapping(2, 3, [[0, 0], [1, 1]]), 3);
    expect(analysis).toMatchObject({ isFunction: true, isInjective: true, isSurjective: false, isBijective: false });
    expect(analysis.uncoveredOutputs).toEqual([2]);
  });

  it('一对多不是函数，不继续宣称单射或满射', () => {
    const analysis = analyzeMapping(createMapping(3, 3, [[0, 0], [0, 1], [1, 1], [2, 2]]), 3);
    expect(analysis.isFunction).toBe(false);
    expect(analysis.issues).toEqual([{ row: 0, kind: 'multiple', outputs: [0, 1] }]);
    expect(analysis.isInjective).toBe(false);
    expect(analysis.isSurjective).toBe(false);
    expect(analysis.isBijective).toBe(false);
  });

  it('定义域中有缺像输入时不是函数', () => {
    const analysis = analyzeMapping(createMapping(3, 3, [[0, 0], [1, 1]]), 3);
    expect(analysis.issues).toEqual([{ row: 2, kind: 'missing', outputs: [] }]);
    expect(analysis.isFunction).toBe(false);
  });

  it('空定义域到非空陪域是单射而非满射；空集到空集是双射', () => {
    expect(analyzeMapping([], 3)).toMatchObject({ isFunction: true, isInjective: true, isSurjective: false, isBijective: false });
    expect(analyzeMapping([], 0)).toMatchObject({ isFunction: true, isInjective: true, isSurjective: true, isBijective: true });
  });

  it('拒绝负维数、越界有序对和矩阵形状不一致', () => {
    expect(() => createMapping(-1, -1)).toThrow(RangeError);
    expect(() => createMapping(2, 2, [[0.5, 0]])).toThrow(RangeError);
    expect(() => analyzeMapping([], -1)).toThrow(RangeError);
    expect(() => analyzeMapping([[true, false]], 3)).toThrow(RangeError);
  });
});

describe('无限对应预览', () => {
  it('逐项给出 n 与 2n，并安全处理非正长度', () => {
    expect(doublingPreview(4)).toEqual([
      { input: 0, output: 0 },
      { input: 1, output: 2 },
      { input: 2, output: 4 },
      { input: 3, output: 6 },
    ]);
    expect(doublingPreview(-1)).toEqual([]);
  });
});
