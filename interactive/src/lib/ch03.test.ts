import { describe, expect, it } from 'vitest';
import {
  analyzeRelation,
  countOrderedPairs,
  createRelation,
  reflexiveClosure,
  symmetricClosure,
  transitiveClosure,
  warshallSnapshots,
} from './ch03';

describe('第3章关系性质', () => {
  it('非空集合上的空关系不自反，但对称、反对称、传递均空真成立', () => {
    const analysis = analyzeRelation(createRelation());
    expect(analysis.reflexive.holds).toBe(false);
    expect(analysis.reflexive.violations).toHaveLength(4);
    expect(analysis.symmetric.holds).toBe(true);
    expect(analysis.antisymmetric.holds).toBe(true);
    expect(analysis.transitive.holds).toBe(true);
  });

  it('空集上的空关系四性质均空真成立，非法维度与下标受控拒绝', () => {
    const analysis = analyzeRelation(createRelation([], 0));
    expect(Object.values(analysis).every((property) => property.holds)).toBe(true);
    expect(() => createRelation([[0.5, 0]], 4)).toThrow(RangeError);
    expect(() => createRelation([[0, 4]], 4)).toThrow(RangeError);
    expect(() => createRelation([], -1)).toThrow(RangeError);
  });

  it('恒等关系同时满足四个性质，自环不破坏反对称', () => {
    const analysis = analyzeRelation(createRelation([[0, 0], [1, 1], [2, 2], [3, 3]]));
    expect(Object.values(analysis).every((property) => property.holds)).toBe(true);
  });

  it('对称反例指出缺少的逆对', () => {
    const analysis = analyzeRelation(createRelation([[0, 1]]));
    expect(analysis.symmetric.holds).toBe(false);
    expect(analysis.symmetric.violations[0]).toEqual({
      premises: [{ from: 0, to: 1 }],
      missing: { from: 1, to: 0 },
    });
    expect(analysis.antisymmetric.holds).toBe(true);
  });

  it('不同元素间的双向边破坏反对称', () => {
    const analysis = analyzeRelation(createRelation([[0, 1], [1, 0]]));
    expect(analysis.symmetric.holds).toBe(true);
    expect(analysis.antisymmetric.holds).toBe(false);
    expect(analysis.antisymmetric.violations[0].premises).toEqual([
      { from: 0, to: 1 },
      { from: 1, to: 0 },
    ]);
  });

  it('传递反例保留两段前提和缺失的直达对', () => {
    const analysis = analyzeRelation(createRelation([[0, 1], [1, 2]]));
    expect(analysis.transitive.violations).toContainEqual({
      premises: [{ from: 0, to: 1 }, { from: 1, to: 2 }],
      missing: { from: 0, to: 2 },
    });
  });
});

describe('第3章闭包', () => {
  it('自反闭包只补主对角线，且不修改输入', () => {
    const original = createRelation([[0, 1]]);
    const snapshot = JSON.stringify(original);
    const result = reflexiveClosure(original);
    expect(result.added).toHaveLength(4);
    expect(result.matrix.every((row, i) => row[i])).toBe(true);
    expect(result.matrix[0][1]).toBe(true);
    expect(JSON.stringify(original)).toBe(snapshot);
  });

  it('对称闭包只补逆对且幂等', () => {
    const result = symmetricClosure(createRelation([[0, 1], [1, 2]]));
    expect(result.added).toEqual([{ from: 1, to: 0 }, { from: 2, to: 1 }]);
    expect(symmetricClosure(result.matrix).added).toEqual([]);
  });

  it('链的传递闭包恰好包含所有向前可达对，不额外补自环', () => {
    const original = createRelation([[0, 1], [1, 2], [2, 3]]);
    const result = transitiveClosure(original);
    expect(countOrderedPairs(result.matrix)).toBe(6);
    expect(result.added).toHaveLength(3);
    expect([0, 1, 2, 3].every((i) => !result.matrix[i][i])).toBe(true);
    expect(analyzeRelation(result.matrix).transitive.holds).toBe(true);
    expect(transitiveClosure(result.matrix).added).toEqual([]);
  });

  it('回路产生的正长度可达路径会补入相应自环', () => {
    const result = transitiveClosure(createRelation([[0, 1], [1, 0]]));
    expect(result.matrix[0][0]).toBe(true);
    expect(result.matrix[1][1]).toBe(true);
    expect(result.matrix[2][2]).toBe(false);
    expect(countOrderedPairs(result.matrix)).toBe(4);
  });
});

describe('Warshall 快照', () => {
  it('包含初始矩阵和全部 4×4×4 次更新，最终等于传递闭包', () => {
    const original = createRelation([[0, 1], [1, 2], [2, 3]]);
    const before = JSON.stringify(original);
    const snapshots = warshallSnapshots(original);
    expect(snapshots).toHaveLength(65);
    expect(snapshots[0].matrix).toEqual(original);
    expect(snapshots.at(-1)?.matrix).toEqual(transitiveClosure(original).matrix);
    expect(JSON.stringify(original)).toBe(before);
  });

  it('每张快照只执行当前单元的布尔递推，其余单元不变', () => {
    const snapshots = warshallSnapshots(createRelation([[0, 1], [1, 0], [1, 2]]));
    for (let index = 1; index < snapshots.length; index += 1) {
      const previous = snapshots[index - 1];
      const current = snapshots[index];
      const expected = current.previous || (current.left && current.right);
      expect(current.value).toBe(expected);
      expect(current.matrix[current.i][current.j]).toBe(expected);
      expect(current.added).toBe(!current.previous && expected);
      for (let i = 0; i < 4; i += 1) {
        for (let j = 0; j < 4; j += 1) {
          if (i !== current.i || j !== current.j) expect(current.matrix[i][j]).toBe(previous.matrix[i][j]);
        }
      }
    }
  });
});
