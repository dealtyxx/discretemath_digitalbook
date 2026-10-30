export const SET_ELEMENTS = ['a', 'b', 'c'] as const;
export type SetElement = (typeof SET_ELEMENTS)[number];
export type CubePosition = [number, number, number];

export interface SubsetNode {
  mask: number;
  label: string;
  tex: string;
  elements: SetElement[];
  rank: number;
  position: CubePosition;
}

export interface CoverEdge {
  id: string;
  lower: number;
  upper: number;
  bit: number;
}

export function assertSubsetMask(mask: number): void {
  if (!Number.isInteger(mask) || mask < 0 || mask > 7) {
    throw new RangeError('子集掩码必须是 0 到 7 的整数');
  }
}

export function subsetElements(mask: number): SetElement[] {
  assertSubsetMask(mask);
  return SET_ELEMENTS.filter((_, bit) => (mask & (1 << bit)) !== 0);
}

export function subsetLabel(mask: number): string {
  const elements = subsetElements(mask);
  return elements.length === 0 ? '∅' : `{${elements.join(', ')}}`;
}

export function subsetTex(mask: number): string {
  const elements = subsetElements(mask);
  return elements.length === 0 ? '\\varnothing' : `\\{${elements.join(',')}\\}`;
}

export function subsetRank(mask: number): number {
  assertSubsetMask(mask);
  let rank = 0;
  for (let bit = 0; bit < 3; bit += 1) if ((mask & (1 << bit)) !== 0) rank += 1;
  return rank;
}

export function subsetPosition(mask: number): CubePosition {
  assertSubsetMask(mask);
  return [0, 1, 2].map((bit) => ((mask & (1 << bit)) === 0 ? -1.35 : 1.35)) as CubePosition;
}

export const BOOLEAN_NODES: readonly SubsetNode[] = Array.from({ length: 8 }, (_, mask) => ({
  mask,
  label: subsetLabel(mask),
  tex: subsetTex(mask),
  elements: subsetElements(mask),
  rank: subsetRank(mask),
  position: subsetPosition(mask),
}));

export const COVER_EDGES: readonly CoverEdge[] = BOOLEAN_NODES.flatMap((node) => (
  [0, 1, 2]
    .filter((bit) => (node.mask & (1 << bit)) === 0)
    .map((bit) => ({
      id: `${node.mask}-${node.mask | (1 << bit)}`,
      lower: node.mask,
      upper: node.mask | (1 << bit),
      bit,
    }))
));

export function isSubset(a: number, b: number): boolean {
  assertSubsetMask(a);
  assertSubsetMask(b);
  return (a & ~b) === 0;
}

export type InclusionRelation = 'equal' | 'aSubset' | 'bSubset' | 'incomparable';

export interface SubsetOperations {
  intersection: number;
  union: number;
  aSubsetB: boolean;
  bSubsetA: boolean;
  relation: InclusionRelation;
  relationText: string;
  relationTex: string;
}

export function compareSubsets(a: number, b: number): SubsetOperations {
  assertSubsetMask(a);
  assertSubsetMask(b);
  const aSubsetB = isSubset(a, b);
  const bSubsetA = isSubset(b, a);
  const relation: InclusionRelation = a === b
    ? 'equal'
    : aSubsetB
      ? 'aSubset'
      : bSubsetA
        ? 'bSubset'
        : 'incomparable';
  const relationText = {
    equal: 'A = B：二者互为子集',
    aSubset: 'A ⊆ B：A 是 B 的子集',
    bSubset: 'B ⊆ A：B 是 A 的子集',
    incomparable: 'A 与 B 互不包含',
  }[relation];
  const relationTex = {
    equal: 'A=B',
    aSubset: 'A\\subseteq B',
    bSubset: 'B\\subseteq A',
    incomparable: 'A\\nsubseteq B\\ \\text{且}\\ B\\nsubseteq A',
  }[relation];
  return {
    intersection: a & b,
    union: a | b,
    aSubsetB,
    bSubsetA,
    relation,
    relationText,
    relationTex,
  };
}

/** 返回闭区间 [lower, upper] 内的所有覆盖边，即全部单调最短路径上的边。 */
export function coveringPathEdges(lower: number, upper: number): CoverEdge[] {
  assertSubsetMask(lower);
  assertSubsetMask(upper);
  if (!isSubset(lower, upper)) return [];
  return COVER_EDGES.filter((edge) => (
    isSubset(lower, edge.lower) && isSubset(edge.upper, upper)
  ));
}

export interface RelationEdges {
  intersection: CoverEdge[];
  union: CoverEdge[];
}

/** 同步标出 A、B 到交集（向下）与并集（向上）的覆盖路径。 */
export function relationEdges(a: number, b: number): RelationEdges {
  const operations = compareSubsets(a, b);
  const intersection = [
    ...coveringPathEdges(operations.intersection, a),
    ...coveringPathEdges(operations.intersection, b),
  ];
  const union = [
    ...coveringPathEdges(a, operations.union),
    ...coveringPathEdges(b, operations.union),
  ];
  return {
    intersection: [...new Map(intersection.map((edge) => [edge.id, edge])).values()],
    union: [...new Map(union.map((edge) => [edge.id, edge])).values()],
  };
}
