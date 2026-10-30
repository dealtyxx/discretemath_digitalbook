import { describe, expect, it } from 'vitest';
import {
  CH8_PRESETS,
  analyzeEuler,
  generateKruskalSteps,
  rootFromParent,
  sortEdgesForKruskal,
  type UndirectedWeightedGraph,
} from './ch08';

function last<T>(items: T[]): T {
  return items[items.length - 1];
}

function preset(id: string) {
  const result = CH8_PRESETS.find((item) => item.id === id);
  if (!result) throw new Error(`缺少预设 ${id}`);
  return result;
}

describe('Kruskal 与并查集', () => {
  it('校园网得到 6 条 MST 边、总权 12，并完整展示 6 次成环拒绝', () => {
    const steps = generateKruskalSteps(preset('campus').graph);
    const done = last(steps);
    expect(done.decision).toBe('done');
    expect(done.currentEdge).toBeNull();
    expect(done.roots).toBeNull();
    expect(done.cycleEdges).toEqual([]);
    expect(done.accepted).toEqual(['C-D', 'A-B', 'A-G', 'B-D', 'E-F', 'C-E']);
    expect(done.totalWeight).toBe(12);
    expect(done.rejected).toHaveLength(6);
    expect(done.components).toEqual([['A', 'B', 'C', 'D', 'E', 'F', 'G']]);
    expect(steps.filter((step) => step.decision === 'inspect')).toHaveLength(12);
  });

  it('每个拒绝快照都给出已选路径和闭合边，而不只改变颜色', () => {
    const steps = generateKruskalSteps(preset('campus').graph);
    const rejected = steps.filter((step) => step.decision === 'reject');
    expect(rejected.length).toBeGreaterThan(0);
    for (const step of rejected) {
      expect(step.currentEdge).not.toBeNull();
      expect(step.roots?.u).toBe(step.roots?.v);
      expect(step.cyclePath.length).toBeGreaterThanOrEqual(2);
      expect(step.cyclePath[0]).toBe(step.currentEdge?.u);
      expect(last(step.cyclePath)).toBe(step.currentEdge?.v);
      expect(step.cycleEdges).toContain(step.currentEdge?.id);
      expect(step.cycleEdges.length).toBeGreaterThanOrEqual(2);
      expect(step.explanation).toMatch(/成环|闭合为环/);
    }
  });

  it('同权边使用规范化端点字母序，输入排列不影响结果', () => {
    const graph: UndirectedWeightedGraph = {
      nodes: ['A', 'B', 'C'],
      edges: [
        { id: 'ca', u: 'C', v: 'A', weight: 2 },
        { id: 'bc', u: 'B', v: 'C', weight: 2 },
        { id: 'ab', u: 'A', v: 'B', weight: 2 },
      ],
    };
    expect(sortEdgesForKruskal(graph).map((edge) => edge.id)).toEqual(['ab', 'ca', 'bc']);
  });

  it('同秩合并无论边方向如何都选字母较小根并增加秩', () => {
    const graph: UndirectedWeightedGraph = {
      nodes: ['A', 'B'],
      edges: [{ id: 'B-A', u: 'B', v: 'A', weight: 1 }],
    };
    const done = last(generateKruskalSteps(graph));
    expect(done.parent.B).toBe('A');
    expect(done.rank.A).toBe(1);
    expect(rootFromParent(done.parent, 'B')).toBe('A');
  });

  it('非连通图生成最小生成森林而非虚构一棵连通树', () => {
    const graph: UndirectedWeightedGraph = {
      nodes: ['A', 'B', 'C', 'D'],
      edges: [
        { id: 'A-B', u: 'A', v: 'B', weight: 1 },
        { id: 'C-D', u: 'C', v: 'D', weight: 2 },
      ],
    };
    const done = last(generateKruskalSteps(graph));
    expect(done.components).toEqual([['A', 'B'], ['C', 'D']]);
    expect(done.accepted).toEqual(['A-B', 'C-D']);
    expect(done.totalWeight).toBe(3);
    expect(done.title).toBe('最小生成森林完成');
  });

  it('历史父指针、秩和决策数组不会被后续 union 改写', () => {
    const steps = generateKruskalSteps(preset('campus').graph);
    const initial = steps[0];
    expect(initial.parent).toEqual({ A: 'A', B: 'B', C: 'C', D: 'D', E: 'E', F: 'F', G: 'G' });
    expect(last(steps).accepted).toHaveLength(6);
    expect(initial.accepted).toEqual([]);
    for (let index = 1; index < steps.length; index += 1) {
      expect(steps[index].parent).not.toBe(steps[index - 1].parent);
      expect(steps[index].rank).not.toBe(steps[index - 1].rank);
      expect(steps[index].accepted).not.toBe(steps[index - 1].accepted);
      expect(steps[index].components).not.toBe(steps[index - 1].components);
    }
  });
});

describe('无向图欧拉性', () => {
  it('校园网有 4 个奇度顶点，连通但仍无欧拉通路', () => {
    const result = analyzeEuler(preset('campus').graph);
    expect(result.connected).toBe(true);
    expect(result.oddNodes).toEqual(['A', 'B', 'F', 'G']);
    expect(result.kind).toBe('none');
    expect(result.trail).toBeNull();
  });

  it('环城网全偶度，实际回路使用每条边恰好一次并回到起点', () => {
    const graph = preset('ring').graph;
    const result = analyzeEuler(graph);
    expect(result.oddNodes).toEqual([]);
    expect(result.kind).toBe('circuit');
    expect(result.trail).not.toBeNull();
    expect(result.trail?.edgeIds).toHaveLength(graph.edges.length);
    expect(new Set(result.trail?.edgeIds).size).toBe(graph.edges.length);
    expect(result.trail?.vertices[0]).toBe(last(result.trail?.vertices ?? []));
  });

  it('巡检网恰有两个奇度点，通路以它们为起终点且覆盖全部边', () => {
    const graph = preset('trail').graph;
    const result = analyzeEuler(graph);
    expect(result.oddNodes).toEqual(['A', 'C']);
    expect(result.kind).toBe('path');
    expect(result.trail?.vertices[0]).toBe('A');
    expect(last(result.trail?.vertices ?? [])).toBe('C');
    expect(new Set(result.trail?.edgeIds).size).toBe(graph.edges.length);
    for (let index = 0; index < (result.trail?.edgeIds.length ?? 0); index += 1) {
      const edgeId = result.trail?.edgeIds[index];
      const edge = graph.edges.find((item) => item.id === edgeId);
      const from = result.trail?.vertices[index];
      const to = result.trail?.vertices[index + 1];
      expect(edge && ((edge.u === from && edge.v === to) || (edge.u === to && edge.v === from))).toBe(true);
    }
  });

  it('先检查有边部分连通：两个偶度环仍不能一笔走遍', () => {
    const graph: UndirectedWeightedGraph = {
      nodes: ['A', 'B', 'C', 'D', 'E', 'F'],
      edges: [
        { id: 'A-B', u: 'A', v: 'B', weight: 1 },
        { id: 'B-C', u: 'B', v: 'C', weight: 1 },
        { id: 'C-A', u: 'C', v: 'A', weight: 1 },
        { id: 'D-E', u: 'D', v: 'E', weight: 1 },
        { id: 'E-F', u: 'E', v: 'F', weight: 1 },
        { id: 'F-D', u: 'F', v: 'D', weight: 1 },
      ],
    };
    const result = analyzeEuler(graph);
    expect(result.oddNodes).toEqual([]);
    expect(result.connected).toBe(false);
    expect(result.kind).toBe('none');
  });

  it('孤立点不妨碍有边环的欧拉性，空图按本实验约定不展示回路', () => {
    const withIsolated: UndirectedWeightedGraph = {
      nodes: ['A', 'B', 'C', 'Z'],
      edges: [
        { id: 'A-B', u: 'A', v: 'B', weight: 1 },
        { id: 'B-C', u: 'B', v: 'C', weight: 1 },
        { id: 'C-A', u: 'C', v: 'A', weight: 1 },
      ],
    };
    const result = analyzeEuler(withIsolated);
    expect(result.degrees.Z).toBe(0);
    expect(result.connected).toBe(true);
    expect(result.kind).toBe('circuit');
    expect(analyzeEuler({ nodes: ['Z'], edges: [] }).kind).toBe('none');
  });

  it('自环贡献 2 度，并可作为只含一条边的欧拉回路', () => {
    const graph: UndirectedWeightedGraph = {
      nodes: ['A'],
      edges: [{ id: 'loop', u: 'A', v: 'A', weight: 1 }],
    };
    const result = analyzeEuler(graph);
    expect(result.degrees.A).toBe(2);
    expect(result.kind).toBe('circuit');
    expect(result.trail).toEqual({ vertices: ['A', 'A'], edgeIds: ['loop'] });
    const done = last(generateKruskalSteps(graph));
    expect(done.accepted).toEqual([]);
    expect(done.rejected).toEqual(['loop']);
  });

  it('拒绝非有限边权、重复边 ID 与未知端点', () => {
    for (const weight of [NaN, Infinity, -Infinity]) {
      const graph: UndirectedWeightedGraph = {
        nodes: ['A', 'B'],
        edges: [{ id: 'e', u: 'A', v: 'B', weight }],
      };
      expect(() => generateKruskalSteps(graph)).toThrow(RangeError);
      expect(() => sortEdgesForKruskal(graph)).toThrow(RangeError);
      expect(() => analyzeEuler(graph)).toThrow(RangeError);
    }
    const duplicate: UndirectedWeightedGraph = {
      nodes: ['A', 'B'],
      edges: [
        { id: 'e', u: 'A', v: 'B', weight: 1 },
        { id: 'e', u: 'A', v: 'B', weight: 2 },
      ],
    };
    expect(() => generateKruskalSteps(duplicate)).toThrow(/重复/);
    expect(() => analyzeEuler(duplicate)).toThrow(/重复/);
    expect(() => analyzeEuler({ nodes: ['A'], edges: [{ id: 'e', u: 'A', v: 'Z', weight: 1 }] })).toThrow(/端点/);
  });

  it('负有限权仍可求 MST，不同 ID 的平行边可形成欧拉回路', () => {
    const negative: UndirectedWeightedGraph = {
      nodes: ['A', 'B', 'C'],
      edges: [
        { id: 'A-B', u: 'A', v: 'B', weight: -2 },
        { id: 'B-C', u: 'B', v: 'C', weight: 1 },
        { id: 'A-C', u: 'A', v: 'C', weight: 2 },
      ],
    };
    expect(last(generateKruskalSteps(negative)).totalWeight).toBe(-1);
    const parallel: UndirectedWeightedGraph = {
      nodes: ['A', 'B'],
      edges: [
        { id: 'e1', u: 'A', v: 'B', weight: 1 },
        { id: 'e2', u: 'A', v: 'B', weight: 2 },
      ],
    };
    const result = analyzeEuler(parallel);
    expect(result.kind).toBe('circuit');
    expect(result.trail?.edgeIds).toHaveLength(2);
    expect(new Set(result.trail?.edgeIds).size).toBe(2);
    expect(result.trail?.vertices).toHaveLength(3);
    expect(result.trail?.vertices[0]).toBe(result.trail?.vertices[2]);
  });
});
