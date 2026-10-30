export interface GraphEdge {
  id: string;
  u: string;
  v: string;
  weight: number;
}

export interface UndirectedWeightedGraph {
  readonly nodes: readonly string[];
  readonly edges: readonly GraphEdge[];
}

export interface GraphPreset {
  id: string;
  name: string;
  description: string;
  graph: UndirectedWeightedGraph;
}

export type KruskalDecision = 'init' | 'inspect' | 'accept' | 'reject' | 'done';

export interface KruskalSnapshot {
  decision: KruskalDecision;
  currentEdge: GraphEdge | null;
  roots: { u: string; v: string } | null;
  accepted: string[];
  rejected: string[];
  parent: Record<string, string>;
  rank: Record<string, number>;
  components: string[][];
  cyclePath: string[];
  cycleEdges: string[];
  totalWeight: number;
  line: number;
  title: string;
  explanation: string;
}

export type EulerKind = 'circuit' | 'path' | 'none';

export interface EulerTrail {
  vertices: string[];
  edgeIds: string[];
}

export interface EulerAnalysis {
  degrees: Record<string, number>;
  oddNodes: string[];
  nonIsolated: string[];
  connected: boolean;
  kind: EulerKind;
  reason: string;
  trail: EulerTrail | null;
}

export const CH8_KRUSKAL_PSEUDOCODE = [
  '每个顶点各成一棵树的森林；所有边按权重、端点字母排序',
  '取下一条边 (u,v)，用 find 分别找两端所在树的根',
  '根不同则接受并 union；根相同则拒绝，因为加入会成环',
  '所有边考察完毕：连通图得到 MST，非连通图得到最小生成森林',
];

export const CH8_PRESETS: GraphPreset[] = [
  {
    id: 'campus',
    name: '七顶点校园网',
    description: '原书 Kruskal 示例：7 个顶点、12 条边；完整考察所有边，可看到接受与成环拒绝。',
    graph: {
      nodes: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      edges: [
        { id: 'A-B', u: 'A', v: 'B', weight: 2 },
        { id: 'A-C', u: 'A', v: 'C', weight: 3 },
        { id: 'A-G', u: 'A', v: 'G', weight: 2 },
        { id: 'B-C', u: 'B', v: 'C', weight: 4 },
        { id: 'B-D', u: 'B', v: 'D', weight: 2 },
        { id: 'C-D', u: 'C', v: 'D', weight: 1 },
        { id: 'C-E', u: 'C', v: 'E', weight: 3 },
        { id: 'D-E', u: 'D', v: 'E', weight: 4 },
        { id: 'D-F', u: 'D', v: 'F', weight: 5 },
        { id: 'E-F', u: 'E', v: 'F', weight: 2 },
        { id: 'E-G', u: 'E', v: 'G', weight: 3 },
        { id: 'F-G', u: 'F', v: 'G', weight: 4 },
      ],
    },
  },
  {
    id: 'ring',
    name: '六顶点环城网',
    description: '外环加 A—C—E 三角；有边部分连通且所有顶点均为偶度，存在欧拉回路。',
    graph: {
      nodes: ['A', 'B', 'C', 'D', 'E', 'F'],
      edges: [
        { id: 'A-B', u: 'A', v: 'B', weight: 4 },
        { id: 'B-C', u: 'B', v: 'C', weight: 2 },
        { id: 'C-D', u: 'C', v: 'D', weight: 3 },
        { id: 'D-E', u: 'D', v: 'E', weight: 5 },
        { id: 'E-F', u: 'E', v: 'F', weight: 1 },
        { id: 'F-A', u: 'F', v: 'A', weight: 2 },
        { id: 'A-C', u: 'A', v: 'C', weight: 6 },
        { id: 'C-E', u: 'C', v: 'E', weight: 2 },
        { id: 'E-A', u: 'E', v: 'A', weight: 3 },
      ],
    },
  },
  {
    id: 'trail',
    name: '五站点巡检网',
    description: '五边形增加弦 A—C；恰有 A、C 两个奇度顶点，存在从 A 到 C 的欧拉通路。',
    graph: {
      nodes: ['A', 'B', 'C', 'D', 'E'],
      edges: [
        { id: 'A-B', u: 'A', v: 'B', weight: 3 },
        { id: 'B-C', u: 'B', v: 'C', weight: 1 },
        { id: 'C-D', u: 'C', v: 'D', weight: 2 },
        { id: 'D-E', u: 'D', v: 'E', weight: 4 },
        { id: 'E-A', u: 'E', v: 'A', weight: 2 },
        { id: 'A-C', u: 'A', v: 'C', weight: 5 },
      ],
    },
  },
];

interface UnionState {
  parent: Record<string, string>;
  rank: Record<string, number>;
  accepted: string[];
  rejected: string[];
  totalWeight: number;
}

interface KruskalDetail {
  decision: KruskalDecision;
  currentEdge?: GraphEdge | null;
  roots?: { u: string; v: string } | null;
  cyclePath?: string[];
  cycleEdges?: string[];
  line: number;
  title: string;
  explanation: string;
}

interface TreePath {
  vertices: string[];
  edgeIds: string[];
}

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function endpointOrder(edge: GraphEdge): [string, string] {
  return compareText(edge.u, edge.v) <= 0 ? [edge.u, edge.v] : [edge.v, edge.u];
}

function validateGraph(graph: UndirectedWeightedGraph): void {
  const nodes = new Set(graph.nodes);
  if (nodes.size !== graph.nodes.length) throw new Error('图顶点名称必须唯一');
  const edgeIds = new Set<string>();
  for (const edge of graph.edges) {
    if (edgeIds.has(edge.id)) throw new Error(`边 ID ${edge.id} 重复`);
    edgeIds.add(edge.id);
    if (!nodes.has(edge.u) || !nodes.has(edge.v)) {
      throw new Error(`边 ${edge.id} 的端点必须属于图顶点集`);
    }
    if (!Number.isFinite(edge.weight)) {
      throw new RangeError(`边 ${edge.id} 的权重必须是有限数`);
    }
  }
}

export function sortEdgesForKruskal(graph: UndirectedWeightedGraph): GraphEdge[] {
  validateGraph(graph);
  return [...graph.edges].sort((a, b) => {
    if (a.weight !== b.weight) return a.weight - b.weight;
    const endsA = endpointOrder(a);
    const endsB = endpointOrder(b);
    return compareText(endsA[0], endsB[0])
      || compareText(endsA[1], endsB[1])
      || compareText(a.id, b.id);
  });
}

export function rootFromParent(parent: Record<string, string>, node: string): string {
  if (!(node in parent)) throw new Error(`顶点 ${node} 不在并查集中`);
  let root = node;
  const seen = new Set<string>();
  while (parent[root] !== root) {
    if (seen.has(root) || !(parent[root] in parent)) {
      throw new Error('并查集父指针异常');
    }
    seen.add(root);
    root = parent[root];
  }
  return root;
}

function findWithCompression(parent: Record<string, string>, node: string): string {
  const root = rootFromParent(parent, node);
  let cursor = node;
  while (cursor !== root) {
    const next = parent[cursor];
    parent[cursor] = root;
    cursor = next;
  }
  return root;
}

function componentsFromParent(parent: Record<string, string>): string[][] {
  const groups = new Map<string, string[]>();
  for (const node of Object.keys(parent).sort(compareText)) {
    const root = rootFromParent(parent, node);
    const group = groups.get(root) ?? [];
    group.push(node);
    groups.set(root, group);
  }
  return [...groups.values()].sort((a, b) => compareText(a[0], b[0]));
}

function captureKruskal(state: UnionState, detail: KruskalDetail): KruskalSnapshot {
  return {
    decision: detail.decision,
    currentEdge: detail.currentEdge ? { ...detail.currentEdge } : null,
    roots: detail.roots ? { ...detail.roots } : null,
    accepted: [...state.accepted],
    rejected: [...state.rejected],
    parent: { ...state.parent },
    rank: { ...state.rank },
    components: componentsFromParent(state.parent),
    cyclePath: [...(detail.cyclePath ?? [])],
    cycleEdges: [...(detail.cycleEdges ?? [])],
    totalWeight: state.totalWeight,
    line: detail.line,
    title: detail.title,
    explanation: detail.explanation,
  };
}

function acceptedTreePath(
  graph: UndirectedWeightedGraph,
  acceptedIds: string[],
  start: string,
  target: string,
): TreePath {
  if (start === target) return { vertices: [start], edgeIds: [] };
  const accepted = new Set(acceptedIds);
  const adjacency = new Map<string, { node: string; edgeId: string }[]>();
  for (const edge of graph.edges) {
    if (!accepted.has(edge.id)) continue;
    const fromU = adjacency.get(edge.u) ?? [];
    fromU.push({ node: edge.v, edgeId: edge.id });
    adjacency.set(edge.u, fromU);
    const fromV = adjacency.get(edge.v) ?? [];
    fromV.push({ node: edge.u, edgeId: edge.id });
    adjacency.set(edge.v, fromV);
  }
  for (const neighbors of adjacency.values()) {
    neighbors.sort((a, b) => compareText(a.node, b.node) || compareText(a.edgeId, b.edgeId));
  }

  const queue = [start];
  const seen = new Set([start]);
  const previous = new Map<string, { from: string; edgeId: string }>();
  while (queue.length > 0) {
    const u = queue.shift() as string;
    for (const next of adjacency.get(u) ?? []) {
      if (seen.has(next.node)) continue;
      seen.add(next.node);
      previous.set(next.node, { from: u, edgeId: next.edgeId });
      if (next.node === target) {
        const vertices = [target];
        const edgeIds: string[] = [];
        let cursor = target;
        while (cursor !== start) {
          const step = previous.get(cursor);
          if (!step) return { vertices: [], edgeIds: [] };
          edgeIds.unshift(step.edgeId);
          vertices.unshift(step.from);
          cursor = step.from;
        }
        return { vertices, edgeIds };
      }
      queue.push(next.node);
    }
  }
  return { vertices: [], edgeIds: [] };
}

export function generateKruskalSteps(graph: UndirectedWeightedGraph): KruskalSnapshot[] {
  validateGraph(graph);
  const state: UnionState = {
    parent: Object.fromEntries(graph.nodes.map((node) => [node, node])),
    rank: Object.fromEntries(graph.nodes.map((node) => [node, 0])),
    accepted: [],
    rejected: [],
    totalWeight: 0,
  };
  const sorted = sortEdgesForKruskal(graph);
  const steps = [captureKruskal(state, {
    decision: 'init',
    line: 1,
    title: '初始化森林并排序边',
    explanation: `每个顶点自成一个分量。${sorted.length} 条边按权重升序排列；同权边按规范化端点字母序排列，保证演示可复现。`,
  })];

  for (const edge of sorted) {
    const rootU = findWithCompression(state.parent, edge.u);
    const rootV = findWithCompression(state.parent, edge.v);
    const roots = { u: rootU, v: rootV };
    const willCycle = rootU === rootV;
    const treePath = willCycle
      ? acceptedTreePath(graph, state.accepted, edge.u, edge.v)
      : { vertices: [], edgeIds: [] };
    const cycleEdges = willCycle ? [...treePath.edgeIds, edge.id] : [];
    const displayPath = treePath.vertices.length === 1
      ? [edge.u, edge.v]
      : treePath.vertices;

    steps.push(captureKruskal(state, {
      decision: 'inspect',
      currentEdge: edge,
      roots,
      cyclePath: displayPath,
      cycleEdges,
      line: 2,
      title: `考察 ${edge.u}—${edge.v}（权 ${edge.weight}）`,
      explanation: willCycle
        ? `find(${edge.u}) 与 find(${edge.v}) 都是 ${rootU}；两端已连通，若接受会形成环。`
        : `find(${edge.u})=${rootU}，find(${edge.v})=${rootV}；根不同，这条边连接两棵不同的树。`,
    }));

    if (willCycle) {
      state.rejected.push(edge.id);
      steps.push(captureKruskal(state, {
        decision: 'reject',
        currentEdge: edge,
        roots,
        cyclePath: displayPath,
        cycleEdges,
        line: 3,
        title: `拒绝 ${edge.u}—${edge.v}：避免成环`,
        explanation: `已选边中存在路径 ${displayPath.join(' → ')}；再加入 ${edge.u}—${edge.v} 会闭合为环，因此舍弃，总权不变。`,
      }));
      continue;
    }

    state.accepted.push(edge.id);
    state.totalWeight += edge.weight;
    if (state.rank[rootU] > state.rank[rootV]) {
      state.parent[rootV] = rootU;
    } else if (state.rank[rootV] > state.rank[rootU]) {
      state.parent[rootU] = rootV;
    } else {
      const newRoot = compareText(rootU, rootV) <= 0 ? rootU : rootV;
      const oldRoot = newRoot === rootU ? rootV : rootU;
      state.parent[oldRoot] = newRoot;
      state.rank[newRoot] += 1;
    }
    steps.push(captureKruskal(state, {
      decision: 'accept',
      currentEdge: edge,
      roots,
      line: 3,
      title: `接受 ${edge.u}—${edge.v}，合并两棵树`,
      explanation: `合并前根为 ${rootU}、${rootV}；按秩合并（同秩取字母较小者为根），当前累计权重 ${state.totalWeight}。`,
    }));
  }

  const componentCount = componentsFromParent(state.parent).length;
  steps.push(captureKruskal(state, {
    decision: 'done',
    line: 4,
    title: componentCount === 1 ? '最小生成树完成' : '最小生成森林完成',
    explanation: componentCount === 1
      ? `所有 ${graph.nodes.length} 个顶点连通，接受 ${state.accepted.length} 条边、拒绝 ${state.rejected.length} 条边；MST 总权为 ${state.totalWeight}。`
      : `原图不连通，保留 ${componentCount} 个最小生成树分量；接受 ${state.accepted.length} 条边，总权 ${state.totalWeight}。`,
  }));
  return steps;
}

function edgeVerticesConnected(graph: UndirectedWeightedGraph, nonIsolated: string[]): boolean {
  if (nonIsolated.length === 0) return false;
  const adjacency = new Map<string, string[]>();
  for (const edge of graph.edges) {
    const fromU = adjacency.get(edge.u) ?? [];
    fromU.push(edge.v);
    adjacency.set(edge.u, fromU);
    const fromV = adjacency.get(edge.v) ?? [];
    fromV.push(edge.u);
    adjacency.set(edge.v, fromV);
  }
  const start = [...nonIsolated].sort(compareText)[0];
  const reached = new Set([start]);
  const queue = [start];
  while (queue.length > 0) {
    const u = queue.shift() as string;
    for (const v of (adjacency.get(u) ?? []).sort(compareText)) {
      if (reached.has(v)) continue;
      reached.add(v);
      queue.push(v);
    }
  }
  return nonIsolated.every((node) => reached.has(node));
}

function buildEulerTrail(graph: UndirectedWeightedGraph, start: string): EulerTrail | null {
  const adjacency = new Map<string, { to: string; edgeId: string }[]>();
  for (const node of graph.nodes) adjacency.set(node, []);
  for (const edge of graph.edges) {
    adjacency.get(edge.u)?.push({ to: edge.v, edgeId: edge.id });
    adjacency.get(edge.v)?.push({ to: edge.u, edgeId: edge.id });
  }
  for (const neighbors of adjacency.values()) {
    neighbors.sort((a, b) => compareText(a.to, b.to) || compareText(a.edgeId, b.edgeId));
  }

  const used = new Set<string>();
  const nextIndex = new Map<string, number>();
  const vertexStack = [start];
  const incomingEdgeStack: string[] = [];
  const reverseVertices: string[] = [];
  const reverseEdges: string[] = [];

  while (vertexStack.length > 0) {
    const u = vertexStack[vertexStack.length - 1];
    const neighbors = adjacency.get(u) ?? [];
    let index = nextIndex.get(u) ?? 0;
    while (index < neighbors.length && used.has(neighbors[index].edgeId)) index += 1;
    nextIndex.set(u, index);
    if (index < neighbors.length) {
      const next = neighbors[index];
      nextIndex.set(u, index + 1);
      used.add(next.edgeId);
      vertexStack.push(next.to);
      incomingEdgeStack.push(next.edgeId);
    } else {
      reverseVertices.push(vertexStack.pop() as string);
      if (incomingEdgeStack.length > 0) reverseEdges.push(incomingEdgeStack.pop() as string);
    }
  }

  if (used.size !== graph.edges.length) return null;
  return {
    vertices: reverseVertices.reverse(),
    edgeIds: reverseEdges.reverse(),
  };
}

/**
 * 无向图欧拉判定只要求“有边顶点”连通；孤立点不影响判定。
 * 本实验约定空图不展示欧拉回路，以避免“零条边的平凡回路”歧义。
 */
export function analyzeEuler(graph: UndirectedWeightedGraph): EulerAnalysis {
  validateGraph(graph);
  const degrees = Object.fromEntries(graph.nodes.map((node) => [node, 0]));
  for (const edge of graph.edges) {
    if (edge.u === edge.v) {
      degrees[edge.u] += 2;
    } else {
      degrees[edge.u] += 1;
      degrees[edge.v] += 1;
    }
  }
  const oddNodes = graph.nodes.filter((node) => degrees[node] % 2 === 1).sort(compareText);
  const nonIsolated = graph.nodes.filter((node) => degrees[node] > 0).sort(compareText);
  const connected = edgeVerticesConnected(graph, nonIsolated);
  let kind: EulerKind = 'none';
  let reason: string;

  if (graph.edges.length === 0) {
    reason = '图中没有边；本实验不把零边情形展示为欧拉回路。';
  } else if (!connected) {
    reason = '有边顶点不连通，无法沿图边走遍所有边；仅满足奇度数量条件还不够。';
  } else if (oddNodes.length === 0) {
    kind = 'circuit';
    reason = '有边顶点连通且所有顶点度数均为偶数，因此存在起点与终点相同的欧拉回路。';
  } else if (oddNodes.length === 2) {
    kind = 'path';
    reason = `有边顶点连通且恰有 ${oddNodes.join('、')} 两个奇度顶点，因此存在以它们为起终点的欧拉通路，但无欧拉回路。`;
  } else {
    reason = `奇度顶点有 ${oddNodes.length} 个，不是 0 个或 2 个，所以既无欧拉回路，也无欧拉通路。`;
  }

  const start = kind === 'path' ? oddNodes[0] : nonIsolated[0];
  return {
    degrees,
    oddNodes,
    nonIsolated,
    connected,
    kind,
    reason,
    trail: kind === 'none' ? null : buildEulerTrail(graph, start),
  };
}
