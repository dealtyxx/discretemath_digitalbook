export type TraversalMode = 'bfs' | 'dfs' | 'dijkstra';

export interface WeightedEdge {
  id: string;
  u: string;
  v: string;
  weight: number;
}

export interface WeightedGraph {
  readonly nodes: readonly string[];
  readonly edges: readonly WeightedEdge[];
}

export interface CandidateEdge {
  edgeId: string;
  u: string;
  v: string;
  weight: number;
}

export type SnapshotKind =
  | 'init'
  | 'visit'
  | 'inspect'
  | 'update'
  | 'skip'
  | 'backtrack'
  | 'done';

/** 一个不可变语义快照：播放器回退时只切换索引，不执行算法逆运算。 */
export interface TraversalSnapshot {
  mode: TraversalMode;
  kind: SnapshotKind;
  current: string | null;
  candidate: CandidateEdge | null;
  visited: string[];
  discovered: string[];
  /** BFS 为队列（左首右尾），DFS 为栈（左底右顶），Dijkstra 为优先队列。 */
  frontier: string[];
  distances: Record<string, number>;
  predecessors: Record<string, string | null>;
  order: string[];
  changedNode: string | null;
  line: number;
  title: string;
  explanation: string;
  formula?: string;
}

export const CH7_GRAPH = {
  nodes: ['A', 'B', 'C', 'D', 'E'],
  edges: [
    { id: 'A-B', u: 'A', v: 'B', weight: 3 },
    { id: 'A-C', u: 'A', v: 'C', weight: 1 },
    { id: 'B-C', u: 'B', v: 'C', weight: 7 },
    { id: 'B-D', u: 'B', v: 'D', weight: 5 },
    { id: 'B-E', u: 'B', v: 'E', weight: 1 },
    { id: 'C-D', u: 'C', v: 'D', weight: 2 },
    { id: 'D-E', u: 'D', v: 'E', weight: 7 },
  ],
} as const satisfies WeightedGraph;

export const CH7_PSEUDOCODE: Record<TraversalMode, string[]> = {
  bfs: [
    'Q ← [起点]；标记起点已发现，d(起点)=0',
    'u ← Q 队首出队，并访问 u',
    '按顶点字母顺序考察 u 的关联边 (u,v)',
    '若 v 未发现：记录距离、前驱，将 v 入队',
    '重复以上过程，直到 Q 为空',
  ],
  dfs: [
    'S ← [起点]；标记起点已发现，d(起点)=0',
    '读取栈顶 u；首次进入时记录访问次序',
    '按顶点字母顺序取下一条未考察边 (u,v)',
    '若 v 未发现：记录深度、前驱，将 v 压栈',
    '若 u 的邻居考察完毕：弹栈并回溯',
  ],
  dijkstra: [
    'd(起点)=0，其余 d=∞；所有前驱为空',
    '选择 d 最小的未确定顶点 u，并标记已确定',
    '按顶点字母顺序考察边 (u,v)，计算 d(u)+w(u,v)',
    '仅当候选值更小：更新 d(v) 与前驱(v)',
    '重复以上过程，直到没有可处理的顶点',
  ],
};

interface MutableTraversal {
  current: string | null;
  candidate: CandidateEdge | null;
  visited: string[];
  discovered: string[];
  frontier: string[];
  distances: Record<string, number>;
  predecessors: Record<string, string | null>;
  order: string[];
}

interface SnapshotDetail {
  kind: SnapshotKind;
  line: number;
  title: string;
  explanation: string;
  changedNode?: string | null;
  formula?: string;
}

interface Neighbor {
  node: string;
  edge: WeightedEdge;
}

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function assertStart(graph: WeightedGraph, start: string): void {
  if (!graph.nodes.includes(start)) {
    throw new Error(`起点 ${start} 不在图中`);
  }
}

export function sortedNeighbors(graph: WeightedGraph, node: string): Neighbor[] {
  return graph.edges
    .flatMap<Neighbor>((edge) => {
      if (edge.u === node) return [{ node: edge.v, edge }];
      if (edge.v === node) return [{ node: edge.u, edge }];
      return [];
    })
    .sort((a, b) => compareText(a.node, b.node) || compareText(a.edge.id, b.edge.id));
}

function initialState(graph: WeightedGraph, start: string): MutableTraversal {
  return {
    current: null,
    candidate: null,
    visited: [],
    discovered: [start],
    frontier: [start],
    distances: Object.fromEntries(graph.nodes.map((node) => [node, node === start ? 0 : Infinity])),
    predecessors: Object.fromEntries(graph.nodes.map((node) => [node, null])),
    order: [],
  };
}

function capture(
  mode: TraversalMode,
  state: MutableTraversal,
  detail: SnapshotDetail,
): TraversalSnapshot {
  return {
    mode,
    kind: detail.kind,
    current: state.current,
    candidate: state.candidate ? { ...state.candidate } : null,
    visited: [...state.visited],
    discovered: [...state.discovered],
    frontier: [...state.frontier],
    distances: { ...state.distances },
    predecessors: { ...state.predecessors },
    order: [...state.order],
    changedNode: detail.changedNode ?? null,
    line: detail.line,
    title: detail.title,
    explanation: detail.explanation,
    formula: detail.formula,
  };
}

function candidateFrom(edge: WeightedEdge, from: string): CandidateEdge {
  return {
    edgeId: edge.id,
    u: from,
    v: edge.u === from ? edge.v : edge.u,
    weight: edge.weight,
  };
}

function bfsSteps(graph: WeightedGraph, start: string): TraversalSnapshot[] {
  const state = initialState(graph, start);
  const queue = [start];
  const steps = [
    capture('bfs', state, {
      kind: 'init',
      line: 1,
      title: `初始化：${start} 入队`,
      explanation: `起点 ${start} 的距离为 0；其余顶点距离为 ∞。队列左端是队首，顶点在发现时入队，避免重复。`,
    }),
  ];

  while (queue.length > 0) {
    const u = queue.shift() as string;
    state.current = u;
    state.candidate = null;
    state.frontier = [...queue];
    state.visited.push(u);
    state.order.push(u);
    steps.push(capture('bfs', state, {
      kind: 'visit',
      line: 2,
      title: `访问 ${u}`,
      explanation: `${u} 从队首出队并加入访问序列；随后按固定字母顺序考察它的邻居。`,
    }));

    for (const { node: v, edge } of sortedNeighbors(graph, u)) {
      state.candidate = candidateFrom(edge, u);
      if (!state.discovered.includes(v)) {
        state.discovered.push(v);
        state.distances[v] = state.distances[u] + 1;
        state.predecessors[v] = u;
        queue.push(v);
        state.frontier = [...queue];
        steps.push(capture('bfs', state, {
          kind: 'update',
          line: 4,
          changedNode: v,
          title: `发现 ${v}，加入队尾`,
          explanation: `沿 ${u}—${v} 首次发现 ${v}：d(${v})=d(${u})+1=${state.distances[v]}，前驱记为 ${u}。`,
          formula: `d(${v})=d(${u})+1=${state.distances[v]}`,
        }));
      } else {
        const where = state.visited.includes(v) ? '已经访问' : '已在队列中';
        steps.push(capture('bfs', state, {
          kind: 'skip',
          line: 3,
          title: `跳过 ${v}`,
          explanation: `${v} ${where}，所以不重复入队，距离和前驱保持不变。`,
        }));
      }
    }
  }

  state.current = null;
  state.candidate = null;
  state.frontier = [];
  steps.push(capture('bfs', state, {
    kind: 'done',
    line: 5,
    title: 'BFS 遍历完成',
    explanation: `队列为空，共访问 ${state.order.length} 个顶点。距离单位是边数；不可达顶点仍为 ∞。`,
  }));
  return steps;
}

function dfsSteps(graph: WeightedGraph, start: string): TraversalSnapshot[] {
  const state = initialState(graph, start);
  const frames = [{ node: start, nextIndex: 0 }];
  const steps = [
    capture('dfs', state, {
      kind: 'init',
      line: 1,
      title: `初始化：${start} 压栈`,
      explanation: `用显式栈模拟递归。栈按左底右顶显示；每个栈帧记住下一个待考察邻居，保证字母顺序固定。`,
    }),
  ];

  while (frames.length > 0) {
    const frame = frames[frames.length - 1];
    const u = frame.node;
    state.current = u;
    state.candidate = null;
    state.frontier = frames.map((item) => item.node);

    if (!state.visited.includes(u)) {
      state.visited.push(u);
      state.order.push(u);
      steps.push(capture('dfs', state, {
        kind: 'visit',
        line: 2,
        title: `首次进入 ${u}`,
        explanation: `${u} 位于栈顶，加入 DFS 先序访问序列。距离表示从起点沿 DFS 树到这里的深度。`,
      }));
    }

    const neighbors = sortedNeighbors(graph, u);
    if (frame.nextIndex >= neighbors.length) {
      frames.pop();
      state.frontier = frames.map((item) => item.node);
      const parent = frames.length > 0 ? frames[frames.length - 1].node : null;
      state.current = parent;
      state.candidate = null;
      steps.push(capture('dfs', state, {
        kind: 'backtrack',
        line: 5,
        title: parent ? `从 ${u} 回溯到 ${parent}` : `${u} 的分支探索完毕`,
        explanation: parent
          ? `${u} 的邻居已全部考察，弹出 ${u}；栈顶恢复为 ${parent}，继续其下一条未考察边。`
          : `${u} 已弹栈，栈为空；从起点可达的分支均已探索。`,
      }));
      continue;
    }

    const { node: v, edge } = neighbors[frame.nextIndex];
    frame.nextIndex += 1;
    state.candidate = candidateFrom(edge, u);
    if (!state.discovered.includes(v)) {
      state.discovered.push(v);
      state.distances[v] = state.distances[u] + 1;
      state.predecessors[v] = u;
      frames.push({ node: v, nextIndex: 0 });
      state.frontier = frames.map((item) => item.node);
      steps.push(capture('dfs', state, {
        kind: 'update',
        line: 4,
        changedNode: v,
        title: `发现 ${v}，压入栈顶`,
        explanation: `沿 ${u}—${v} 深入：前驱(${v})=${u}，深度 d(${v})=${state.distances[v]}；下一步将先处理 ${v}。`,
        formula: `d(${v})=d(${u})+1=${state.distances[v]}`,
      }));
    } else {
      steps.push(capture('dfs', state, {
        kind: 'skip',
        line: 3,
        title: `跳过已发现的 ${v}`,
        explanation: `${v} 已在当前搜索树中，不再重复压栈；继续考察 ${u} 的下一个字母序邻居。`,
      }));
    }
  }

  state.current = null;
  state.candidate = null;
  state.frontier = [];
  steps.push(capture('dfs', state, {
    kind: 'done',
    line: 5,
    title: 'DFS 遍历完成',
    explanation: `栈为空，共访问 ${state.order.length} 个顶点。这里的距离是 DFS 树深度，不承诺最短路径。`,
  }));
  return steps;
}

function dijkstraFrontier(graph: WeightedGraph, state: MutableTraversal): string[] {
  return graph.nodes
    .filter((node) => !state.visited.includes(node) && Number.isFinite(state.distances[node]))
    .sort((a, b) => state.distances[a] - state.distances[b] || compareText(a, b));
}

function dijkstraSteps(graph: WeightedGraph, start: string): TraversalSnapshot[] {
  const negative = graph.edges.find((edge) => !Number.isFinite(edge.weight) || edge.weight < 0);
  if (negative) {
    throw new Error(`Dijkstra 要求有限非负权，边 ${negative.id} 不满足前提`);
  }

  const state = initialState(graph, start);
  state.frontier = [start];
  const steps = [
    capture('dijkstra', state, {
      kind: 'init',
      line: 1,
      title: `初始化：从 ${start} 求最小权路径`,
      explanation: `仅 d(${start})=0，其余为 ∞。优先队列按“距离升序、顶点字母升序”排列；本算法要求所有边权非负。`,
    }),
  ];

  while (true) {
    const frontier = dijkstraFrontier(graph, state);
    if (frontier.length === 0) break;
    const u = frontier[0];
    state.current = u;
    state.candidate = null;
    state.visited.push(u);
    state.order.push(u);
    state.frontier = dijkstraFrontier(graph, state);
    steps.push(capture('dijkstra', state, {
      kind: 'visit',
      line: 2,
      title: `确定 ${u} 的最短距离`,
      explanation: `未确定顶点中 ${u} 的距离最小，故 d(${u})=${state.distances[u]} 已最终确定；同距离时按顶点字母选择。`,
    }));

    for (const { node: v, edge } of sortedNeighbors(graph, u)) {
      const alternative = state.distances[u] + edge.weight;
      state.candidate = candidateFrom(edge, u);
      if (state.visited.includes(v)) {
        steps.push(capture('dijkstra', state, {
          kind: 'skip',
          line: 3,
          title: `${v} 已确定，不再修改`,
          explanation: `候选路径 ${u}→${v} 的权重和为 ${alternative}；${v} 已确定，因此保留原距离与前驱。`,
          formula: `d(${u})+w(${u},${v})=${alternative}`,
        }));
        continue;
      }

      if (alternative < state.distances[v]) {
        const oldDistance = state.distances[v];
        if (!state.discovered.includes(v)) state.discovered.push(v);
        state.distances[v] = alternative;
        state.predecessors[v] = u;
        state.frontier = dijkstraFrontier(graph, state);
        steps.push(capture('dijkstra', state, {
          kind: 'update',
          line: 4,
          changedNode: v,
          title: `松弛成功：更新 ${v}`,
          explanation: `经 ${u} 到 ${v} 的候选值 ${alternative} 小于原值 ${formatDistance(oldDistance)}，更新距离并把前驱设为 ${u}。`,
          formula: `${alternative}<${Number.isFinite(oldDistance) ? oldDistance : '\\infty'}\\Rightarrow d(${v})=${alternative}`,
        }));
      } else {
        steps.push(capture('dijkstra', state, {
          kind: 'inspect',
          line: 4,
          title: `松弛不更新 ${v}`,
          explanation: `候选值 ${alternative} 不小于当前 d(${v})=${formatDistance(state.distances[v])}，所以距离和前驱均保持；同值也不改前驱。`,
          formula: `${alternative}\\geq ${state.distances[v]}\\Rightarrow \\text{保持 }d(${v})`,
        }));
      }
    }
  }

  state.current = null;
  state.candidate = null;
  state.frontier = [];
  steps.push(capture('dijkstra', state, {
    kind: 'done',
    line: 5,
    title: 'Dijkstra 计算完成',
    explanation: `已确定 ${state.order.length} 个可达顶点。距离是路径边权之和，前驱表可逆向还原最短路径；不可达顶点仍为 ∞。`,
  }));
  return steps;
}

export function generateTraversalSteps(
  graph: WeightedGraph,
  mode: TraversalMode,
  start: string,
): TraversalSnapshot[] {
  assertStart(graph, start);
  if (mode === 'bfs') return bfsSteps(graph, start);
  if (mode === 'dfs') return dfsSteps(graph, start);
  return dijkstraSteps(graph, start);
}

export function pathFromPredecessors(
  predecessors: Record<string, string | null>,
  start: string,
  target: string,
): string[] {
  if (start === target) return [start];
  if (predecessors[start] !== null && predecessors[start] !== undefined) return [];
  const path = [target];
  const seen = new Set(path);
  let cursor = target;
  while (cursor !== start) {
    const parent = predecessors[cursor];
    if (parent === null || parent === undefined || seen.has(parent)) return [];
    path.unshift(parent);
    seen.add(parent);
    cursor = parent;
  }
  return path;
}

export function formatDistance(distance: number): string {
  return Number.isFinite(distance) ? String(distance) : '∞';
}
