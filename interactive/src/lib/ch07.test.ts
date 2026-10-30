import { describe, expect, it } from 'vitest';
import {
  CH7_GRAPH,
  formatDistance,
  generateTraversalSteps,
  pathFromPredecessors,
  sortedNeighbors,
  type WeightedGraph,
} from './ch07';

function last<T>(items: T[]): T {
  return items[items.length - 1];
}

describe('第 7 章固定图与遍历快照', () => {
  it('邻居始终按顶点字母排序，图权满足 Dijkstra 前提', () => {
    expect(CH7_GRAPH.edges.every((edge) => edge.weight >= 0)).toBe(true);
    expect(sortedNeighbors(CH7_GRAPH, 'B').map((item) => item.node)).toEqual(['A', 'C', 'D', 'E']);
  });

  it('BFS 使用队列并得到按边数的最短距离', () => {
    const steps = generateTraversalSteps(CH7_GRAPH, 'bfs', 'D');
    const done = last(steps);
    expect(done.kind).toBe('done');
    expect(done.order).toEqual(['D', 'B', 'C', 'E', 'A']);
    expect(done.distances).toEqual({ A: 2, B: 1, C: 1, D: 0, E: 1 });
    expect(done.predecessors.A).toBe('B');
    expect(done.frontier).toEqual([]);
    expect(steps.some((step) => step.kind === 'update' && step.changedNode === 'A')).toBe(true);
  });

  it('DFS 用栈帧保持字母序，距离明确表示树深度', () => {
    const steps = generateTraversalSteps(CH7_GRAPH, 'dfs', 'D');
    const done = last(steps);
    expect(done.order).toEqual(['D', 'B', 'A', 'C', 'E']);
    expect(done.distances).toEqual({ A: 2, B: 1, C: 3, D: 0, E: 2 });
    expect(done.predecessors.C).toBe('A');
    expect(done.predecessors.E).toBe('B');
    expect(steps.some((step) => step.kind === 'backtrack')).toBe(true);
    expect(done.frontier).toEqual([]);
  });

  it('Dijkstra 得到原书示例的最小权距离和确定顺序', () => {
    const steps = generateTraversalSteps(CH7_GRAPH, 'dijkstra', 'A');
    const done = last(steps);
    expect(done.order).toEqual(['A', 'C', 'B', 'D', 'E']);
    expect(done.distances).toEqual({ A: 0, B: 3, C: 1, D: 3, E: 4 });
    expect(done.predecessors).toEqual({ A: null, B: 'A', C: 'A', D: 'C', E: 'B' });
    expect(done.discovered).toEqual(['A', 'B', 'C', 'D', 'E']);
    expect(pathFromPredecessors(done.predecessors, 'A', 'E')).toEqual(['A', 'B', 'E']);
  });

  it('每个快照都深拷贝关键状态，后续更新不会污染历史', () => {
    const steps = generateTraversalSteps(CH7_GRAPH, 'dijkstra', 'A');
    const initial = steps[0];
    expect(initial.distances.B).toBe(Infinity);
    expect(initial.predecessors.B).toBeNull();
    expect(last(steps).distances.B).toBe(3);
    expect(initial.distances.B).toBe(Infinity);
    for (let index = 1; index < steps.length; index += 1) {
      expect(steps[index].distances).not.toBe(steps[index - 1].distances);
      expect(steps[index].predecessors).not.toBe(steps[index - 1].predecessors);
      expect(steps[index].frontier).not.toBe(steps[index - 1].frontier);
      expect(steps[index].visited).not.toBe(steps[index - 1].visited);
    }
  });
});

describe('第 7 章关键边界', () => {
  it('不可达顶点保持 ∞，前驱路径返回空数组', () => {
    const graph: WeightedGraph = {
      nodes: ['A', 'B', 'C'],
      edges: [{ id: 'A-B', u: 'A', v: 'B', weight: 2 }],
    };
    for (const mode of ['bfs', 'dfs', 'dijkstra'] as const) {
      const done = last(generateTraversalSteps(graph, mode, 'A'));
      expect(done.order).toEqual(['A', 'B']);
      expect(done.distances.C).toBe(Infinity);
      expect(done.discovered).toEqual(['A', 'B']);
      expect(pathFromPredecessors(done.predecessors, 'A', 'C')).toEqual([]);
    }
    expect(formatDistance(Infinity)).toBe('∞');
  });

  it('Dijkstra 拒绝负权与非有限权，BFS/DFS 不把权重当距离', () => {
    const negative: WeightedGraph = {
      nodes: ['A', 'B'],
      edges: [{ id: 'A-B', u: 'A', v: 'B', weight: -1 }],
    };
    expect(() => generateTraversalSteps(negative, 'dijkstra', 'A')).toThrow(/非负权/);
    expect(last(generateTraversalSteps(negative, 'bfs', 'A')).distances.B).toBe(1);
    expect(last(generateTraversalSteps(negative, 'dfs', 'A')).distances.B).toBe(1);
    expect(() => generateTraversalSteps({
      nodes: ['A', 'B'],
      edges: [{ id: 'A-B', u: 'A', v: 'B', weight: Infinity }],
    }, 'dijkstra', 'A')).toThrow(/有限非负权/);
  });

  it('允许零权边，并用顶点字母打破同距离并列', () => {
    const graph: WeightedGraph = {
      nodes: ['A', 'B', 'C'],
      edges: [
        { id: 'A-C', u: 'A', v: 'C', weight: 3 },
        { id: 'A-B', u: 'A', v: 'B', weight: 0 },
        { id: 'B-C', u: 'B', v: 'C', weight: 2 },
      ],
    };
    const done = last(generateTraversalSteps(graph, 'dijkstra', 'A'));
    expect(done.order).toEqual(['A', 'B', 'C']);
    expect(done.distances.C).toBe(2);
    expect(done.predecessors.C).toBe('B');
  });

  it('前驱异常成环时安全停止，起点到自身是单点路径', () => {
    expect(pathFromPredecessors({ A: 'B', B: 'A' }, 'A', 'B')).toEqual([]);
    expect(pathFromPredecessors({ A: null }, 'A', 'A')).toEqual(['A']);
    expect(() => generateTraversalSteps(CH7_GRAPH, 'bfs', 'Z')).toThrow(/不在图中/);
  });
});
