import { describe, expect, it } from 'vitest';
import {
  BOOLEAN_NODES,
  COVER_EDGES,
  compareSubsets,
  coveringPathEdges,
  isSubset,
  relationEdges,
  subsetElements,
  subsetLabel,
  subsetRank,
} from './ch02';

describe('第2章子集编码', () => {
  it('恰好枚举三元素集合的 8 个子集', () => {
    expect(BOOLEAN_NODES).toHaveLength(8);
    expect(new Set(BOOLEAN_NODES.map((node) => node.label)).size).toBe(8);
    expect(subsetElements(0)).toEqual([]);
    expect(subsetElements(5)).toEqual(['a', 'c']);
    expect(subsetLabel(7)).toBe('{a, b, c}');
    expect(BOOLEAN_NODES.map((node) => node.rank)).toEqual([0, 1, 1, 2, 1, 2, 2, 3]);
    expect(subsetRank(7)).toBe(3);
  });

  it('覆盖边恰为 12 条，两端只相差一个元素', () => {
    expect(COVER_EDGES).toHaveLength(12);
    expect(new Set(COVER_EDGES.map((edge) => edge.id)).size).toBe(12);
    for (const edge of COVER_EDGES) {
      expect(isSubset(edge.lower, edge.upper)).toBe(true);
      expect(subsetRank(edge.upper) - subsetRank(edge.lower)).toBe(1);
      expect(edge.upper).toBe(edge.lower | (1 << edge.bit));
    }
  });

  it('按位交并与集合并交完全一致', () => {
    for (let a = 0; a < 8; a += 1) {
      for (let b = 0; b < 8; b += 1) {
        const result = compareSubsets(a, b);
        expect(subsetElements(result.intersection)).toEqual(subsetElements(a).filter((item) => subsetElements(b).includes(item)));
        expect(new Set(subsetElements(result.union))).toEqual(new Set([...subsetElements(a), ...subsetElements(b)]));
        expect(result.aSubsetB).toBe(isSubset(a, b));
      }
    }
  });

  it('区分相等、包含和不可比', () => {
    expect(compareSubsets(1, 1).relation).toBe('equal');
    expect(compareSubsets(1, 3).relation).toBe('aSubset');
    expect(compareSubsets(3, 1).relation).toBe('bSubset');
    expect(compareSubsets(1, 2).relation).toBe('incomparable');
  });
});

describe('第2章覆盖路径', () => {
  it('闭区间只包含同时位于上下界之间的覆盖边', () => {
    const edges = coveringPathEdges(0, 7);
    expect(edges.map((edge) => edge.id)).toEqual(COVER_EDGES.map((edge) => edge.id));
    expect(coveringPathEdges(1, 6)).toEqual([]);
    expect(coveringPathEdges(1, 3).map((edge) => edge.id)).toEqual(['1-3']);
    expect(coveringPathEdges(1, 7).map((edge) => edge.id)).toEqual(['1-3', '1-5', '3-7', '5-7']);
  });

  it('交并路径的并集覆盖所有单调最短路线且不重复', () => {
    const result = relationEdges(3, 5);
    expect(result.intersection.map((edge) => edge.id)).toEqual(['1-3', '1-5']);
    expect(result.union.map((edge) => edge.id)).toEqual(['3-7', '5-7']);
    expect(new Set([...result.intersection, ...result.union].map((edge) => edge.id)).size).toBe(4);
  });

  it('重合路径会被去重，交并标记仍由运算结果决定', () => {
    const result = relationEdges(1, 3);
    expect(result.intersection.map((edge) => edge.id)).toEqual(['1-3']);
    expect(result.union.map((edge) => edge.id)).toEqual(['1-3']);
    expect(compareSubsets(1, 3)).toMatchObject({ intersection: 1, union: 3 });
  });
});
