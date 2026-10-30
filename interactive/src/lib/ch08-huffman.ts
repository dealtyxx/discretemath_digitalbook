export interface HuffmanSymbol {
  symbol: string;
  weight: number;
}

export interface HuffmanNode {
  id: string;
  weight: number;
  symbol: string | null;
  left: string | null;
  right: string | null;
  order: number;
}

export interface HuffmanSnapshot {
  kind: 'init' | 'select' | 'merge' | 'done';
  nodes: Record<string, HuffmanNode>;
  queue: string[];
  selected: [string, string] | null;
  created: string | null;
  codes: Record<string, string>;
  totalCost: number;
  title: string;
  explanation: string;
  formula?: string;
}

export const CH8_HUFFMAN_SYMBOLS: HuffmanSymbol[] = [
  { symbol: 'a', weight: 20 },
  { symbol: 'b', weight: 5 },
  { symbol: 'c', weight: 7 },
  { symbol: 'd', weight: 11 },
  { symbol: 'e', weight: 30 },
  { symbol: 'f', weight: 7 },
  { symbol: 'g', weight: 5 },
  { symbol: 'h', weight: 15 },
];

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function validateSymbols(symbols: readonly HuffmanSymbol[]): void {
  if (symbols.length === 0) throw new RangeError('至少需要一个符号');
  const names = new Set<string>();
  for (const { symbol, weight } of symbols) {
    if (!symbol.trim()) throw new RangeError('符号不能为空');
    if (names.has(symbol)) throw new RangeError(`符号 ${symbol} 重复`);
    names.add(symbol);
    if (!Number.isFinite(weight) || weight <= 0) {
      throw new RangeError(`符号 ${symbol} 的权重必须是正有限数`);
    }
  }
}

function sortedQueue(nodes: Record<string, HuffmanNode>, queue: string[]): string[] {
  return [...queue].sort((a, b) => nodes[a].weight - nodes[b].weight
    || nodes[a].order - nodes[b].order
    || compareText(a, b));
}

function codesFromNodes(
  nodes: Record<string, HuffmanNode>,
  rootIds: string[],
): Record<string, string> {
  const codes = new Map<string, string>();
  const visit = (id: string, prefix: string) => {
    const node = nodes[id];
    if (node.symbol !== null) {
      codes.set(node.symbol, rootIds.length === 1 && prefix === '' ? '0' : prefix);
      return;
    }
    if (node.left) visit(node.left, `${prefix}0`);
    if (node.right) visit(node.right, `${prefix}1`);
  };
  for (const root of rootIds) visit(root, '');
  return Object.fromEntries(codes);
}

function capture(
  nodes: Record<string, HuffmanNode>,
  queue: string[],
  totalCost: number,
  detail: Pick<HuffmanSnapshot, 'kind' | 'selected' | 'created' | 'title' | 'explanation' | 'formula'>,
): HuffmanSnapshot {
  const orderedQueue = sortedQueue(nodes, queue);
  return {
    ...detail,
    nodes: Object.fromEntries(Object.entries(nodes).map(([id, node]) => [id, { ...node }])),
    queue: orderedQueue,
    selected: detail.selected ? [...detail.selected] : null,
    codes: codesFromNodes(nodes, orderedQueue),
    totalCost,
  };
}

export function generateHuffmanSteps(symbols: readonly HuffmanSymbol[]): HuffmanSnapshot[] {
  validateSymbols(symbols);
  const nodes: Record<string, HuffmanNode> = {};
  const queue: string[] = [];
  symbols.forEach(({ symbol, weight }, order) => {
    const id = `leaf-${order}`;
    nodes[id] = { id, weight, symbol, left: null, right: null, order };
    queue.push(id);
  });

  const steps = [capture(nodes, queue, 0, {
    kind: 'init',
    selected: null,
    created: null,
    title: '把每个符号作为一棵单节点树',
    explanation: '优先队列按“权重升序、创建顺序升序”排列。相同的权采用固定次序，因此每次演示都可复现。',
  })];

  let totalCost = 0;
  let nextOrder = symbols.length;
  while (queue.length > 1) {
    const ordered = sortedQueue(nodes, queue);
    const left = ordered[0];
    const right = ordered[1];
    const selected: [string, string] = [left, right];
    const leftName = nodes[left].symbol ?? `内部节点 ${left}`;
    const rightName = nodes[right].symbol ?? `内部节点 ${right}`;
    const weight = nodes[left].weight + nodes[right].weight;
    steps.push(capture(nodes, ordered, totalCost, {
      kind: 'select',
      selected,
      created: null,
      title: `取出两个最小权节点：${nodes[left].weight} 与 ${nodes[right].weight}`,
      explanation: `${leftName} 和 ${rightName} 是当前权最小的两棵树；它们将成为新父节点的左右孩子。`,
      formula: `w(z)=${nodes[left].weight}+${nodes[right].weight}=${weight}`,
    }));

    queue.splice(queue.indexOf(left), 1);
    queue.splice(queue.indexOf(right), 1);
    const id = `internal-${nextOrder - symbols.length + 1}`;
    nodes[id] = { id, weight, symbol: null, left, right, order: nextOrder };
    nextOrder += 1;
    queue.push(id);
    totalCost += weight;
    steps.push(capture(nodes, queue, totalCost, {
      kind: 'merge',
      selected,
      created: id,
      title: `合并为权 ${weight} 的新树`,
      explanation: `新父节点权为 ${weight}，左分支记 0、右分支记 1。把它放回队列；累计合并权增加 ${weight}，最终恰好等于带权路径长度。`,
      formula: `C_{\\text{累计合并权}}\\leftarrow ${totalCost - weight}+${weight}=${totalCost}`,
    }));
  }

  const root = queue[0];
  const codeCount = Object.keys(codesFromNodes(nodes, [root])).length;
  if (symbols.length === 1) totalCost = symbols[0].weight;
  steps.push(capture(nodes, queue, totalCost, {
    kind: 'done',
    selected: null,
    created: null,
    title: '前缀编码树构造完成',
    explanation: symbols.length === 1
      ? `唯一符号也分配一位码 0，因此带权路径长度 WPL=${totalCost}，不使用会产生解码歧义的空码。`
      : `队列只剩根节点。沿根到叶子的 0/1 路径得到 ${codeCount} 个前缀码；累计合并权就是带权路径长度 WPL=${totalCost}。`,
    formula: `WPL=\\sum_i w_i\\ell_i=${totalCost}`,
  }));
  return steps;
}

export function huffmanMetrics(
  symbols: readonly HuffmanSymbol[],
  codes: Record<string, string>,
) {
  validateSymbols(symbols);
  for (const { symbol } of symbols) {
    if (!codes[symbol] || !/^[01]+$/.test(codes[symbol])) {
      throw new RangeError(`符号 ${symbol} 缺少有效的二进制编码`);
    }
  }
  const relevantCodes = Object.fromEntries(symbols.map(({ symbol }) => [symbol, codes[symbol]]));
  if (!isPrefixCode(relevantCodes)) throw new RangeError('编码必须互不相同，且任一码字都不能是另一码字的前缀');
  const totalWeight = symbols.reduce((sum, item) => sum + item.weight, 0);
  const weightedPathLength = symbols.reduce(
    (sum, item) => sum + item.weight * codes[item.symbol].length,
    0,
  );
  const fixedWidth = Math.max(1, Math.ceil(Math.log2(symbols.length)));
  return {
    totalWeight,
    weightedPathLength,
    averageLength: weightedPathLength / totalWeight,
    fixedWidth,
    fixedLength: totalWeight * fixedWidth,
    savedBits: totalWeight * fixedWidth - weightedPathLength,
  };
}

export function huffmanTreeDepths(nodes: Record<string, HuffmanNode>): Record<string, number> {
  const memo = new Map<string, number>();
  const depth = (id: string, visiting = new Set<string>()): number => {
    const cached = memo.get(id);
    if (cached !== undefined) return cached;
    if (visiting.has(id)) throw new Error('Huffman 树含有环');
    const node = nodes[id];
    if (!node) throw new Error(`缺少 Huffman 节点 ${id}`);
    const nextVisiting = new Set(visiting).add(id);
    const children = [node.left, node.right].filter((child): child is string => child !== null);
    const result = children.length === 0 ? 0 : 1 + Math.max(...children.map((child) => depth(child, nextVisiting)));
    memo.set(id, result);
    return result;
  };
  return Object.fromEntries(Object.keys(nodes).map((id) => [id, depth(id)]));
}

export function isPrefixCode(codes: Record<string, string>): boolean {
  const entries = Object.entries(codes);
  return entries.every(([symbol, code]) => /^[01]+$/.test(code)
    && entries.every(([otherSymbol, otherCode]) => symbol === otherSymbol
      || !otherCode.startsWith(code)));
}

/** 按左右子树遍历安排叶子，避免按原始符号排序时交叉或重叠父节点。 */
export function huffmanTreeLayout(
  nodes: Record<string, HuffmanNode>,
  roots: readonly string[],
): Record<string, { x: number; y: number }> {
  const depths = huffmanTreeDepths(nodes);
  const baseline = 50 + Math.max(0, ...Object.values(depths)) * 78;
  const leaves: string[] = [];
  const visit = (id: string) => {
    const node = nodes[id];
    if (!node) throw new Error(`缺少 Huffman 节点 ${id}`);
    if (node.symbol !== null) leaves.push(id);
    else {
      if (node.left) visit(node.left);
      if (node.right) visit(node.right);
    }
  };
  roots.forEach(visit);
  const leafX = new Map(leaves.map((id, index) => [
    id,
    leaves.length === 1 ? 380 : 48 + index * 664 / (leaves.length - 1),
  ]));
  const positions: Record<string, { x: number; y: number }> = {};
  const position = (id: string): { x: number; y: number } => {
    if (positions[id]) return positions[id];
    const node = nodes[id];
    const x = node.symbol !== null
      ? leafX.get(id) as number
      : (position(node.left as string).x + position(node.right as string).x) / 2;
    positions[id] = { x, y: baseline - depths[id] * 78 };
    return positions[id];
  };
  roots.forEach((root) => position(root));
  return positions;
}
