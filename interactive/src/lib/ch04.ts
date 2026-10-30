export const DIVISORS_OF_12 = [1, 2, 3, 4, 6, 12] as const;

export type DivisibilityOrder = (a: number, b: number) => boolean;
export type MappingMatrix = boolean[][];

export interface CoverPair {
  lower: number;
  upper: number;
}

export interface PairBounds {
  upperBounds: number[];
  lowerBounds: number[];
  join: number | null;
  meet: number | null;
}

export interface PartialOrderCheck {
  reflexive: boolean;
  antisymmetric: boolean;
  transitive: boolean;
  holds: boolean;
}

export interface MappingPair {
  from: number;
  to: number;
}

export interface MappingIssue {
  row: number;
  kind: 'missing' | 'multiple';
  outputs: number[];
}

export interface InjectionConflict {
  rows: [number, number];
  output: number;
}

export interface MappingAnalysis {
  isFunction: boolean;
  isInjective: boolean;
  isSurjective: boolean;
  isBijective: boolean;
  rowOutputs: number[][];
  issues: MappingIssue[];
  injectionConflicts: InjectionConflict[];
  imageOutputs: number[];
  uncoveredOutputs: number[];
}

export function divides(a: number, b: number): boolean {
  return a > 0 && Number.isInteger(a) && Number.isInteger(b) && b % a === 0;
}

export function isCover(a: number, b: number, elements: readonly number[] = DIVISORS_OF_12): boolean {
  if (a === b || !divides(a, b)) return false;
  return !elements.some((middle) => (
    middle !== a
    && middle !== b
    && divides(a, middle)
    && divides(middle, b)
  ));
}

export function hasseCovers(elements: readonly number[] = DIVISORS_OF_12): CoverPair[] {
  const covers: CoverPair[] = [];
  for (const lower of elements) {
    for (const upper of elements) {
      if (isCover(lower, upper, elements)) covers.push({ lower, upper });
    }
  }
  return covers;
}

export function pairBounds(
  a: number,
  b: number,
  elements: readonly number[] = DIVISORS_OF_12,
): PairBounds {
  const upperBounds = elements.filter((candidate) => divides(a, candidate) && divides(b, candidate));
  const lowerBounds = elements.filter((candidate) => divides(candidate, a) && divides(candidate, b));
  const join = upperBounds.find((candidate) => (
    upperBounds.every((other) => divides(candidate, other))
  )) ?? null;
  const meet = lowerBounds.find((candidate) => (
    lowerBounds.every((other) => divides(other, candidate))
  )) ?? null;
  return { upperBounds, lowerBounds, join, meet };
}

export function checkPartialOrder(
  elements: readonly number[] = DIVISORS_OF_12,
  order: DivisibilityOrder = divides,
): PartialOrderCheck {
  const reflexive = elements.every((a) => order(a, a));
  const antisymmetric = elements.every((a) => elements.every((b) => (
    !(order(a, b) && order(b, a)) || a === b
  )));
  const transitive = elements.every((a) => elements.every((b) => elements.every((c) => (
    !(order(a, b) && order(b, c)) || order(a, c)
  ))));
  return { reflexive, antisymmetric, transitive, holds: reflexive && antisymmetric && transitive };
}

export function createMapping(
  rows: number,
  columns: number,
  pairs: readonly (readonly [number, number])[] = [],
): MappingMatrix {
  if (!Number.isSafeInteger(rows) || rows < 0 || !Number.isSafeInteger(columns) || columns < 0) {
    throw new RangeError('映射矩阵的维数必须是非负安全整数');
  }
  const matrix = Array.from({ length: rows }, () => Array<boolean>(columns).fill(false));
  for (const [from, to] of pairs) {
    if (!Number.isSafeInteger(from) || !Number.isSafeInteger(to)
      || from < 0 || from >= rows || to < 0 || to >= columns) {
      throw new RangeError('映射有序对下标必须位于矩阵范围内');
    }
    matrix[from][to] = true;
  }
  return matrix;
}

export function toggleMapping(matrix: MappingMatrix, from: number, to: number): MappingMatrix {
  const next = matrix.map((row) => [...row]);
  next[from][to] = !next[from][to];
  return next;
}

export function analyzeMapping(matrix: MappingMatrix, codomainSize: number): MappingAnalysis {
  if (!Number.isSafeInteger(codomainSize) || codomainSize < 0) {
    throw new RangeError('陪域大小必须是非负安全整数');
  }
  if (matrix.some((row) => row.length !== codomainSize)) {
    throw new RangeError('映射矩阵的每行长度必须等于陪域大小');
  }
  const rowOutputs = matrix.map((row) => {
    const outputs: number[] = [];
    for (let output = 0; output < codomainSize; output += 1) {
      if (row[output]) outputs.push(output);
    }
    return outputs;
  });
  const issues: MappingIssue[] = [];
  rowOutputs.forEach((outputs, row) => {
    if (outputs.length === 0) issues.push({ row, kind: 'missing', outputs });
    if (outputs.length > 1) issues.push({ row, kind: 'multiple', outputs });
  });
  const isFunction = issues.length === 0;
  const imageOutputs = Array.from({ length: codomainSize }, (_, output) => output)
    .filter((output) => rowOutputs.some((outputs) => outputs.includes(output)));
  const uncoveredOutputs = Array.from({ length: codomainSize }, (_, output) => output)
    .filter((output) => !imageOutputs.includes(output));
  const injectionConflicts: InjectionConflict[] = [];

  if (isFunction) {
    for (let first = 0; first < rowOutputs.length; first += 1) {
      for (let second = first + 1; second < rowOutputs.length; second += 1) {
        if (rowOutputs[first][0] === rowOutputs[second][0]) {
          injectionConflicts.push({ rows: [first, second], output: rowOutputs[first][0] });
        }
      }
    }
  }

  const isInjective = isFunction && injectionConflicts.length === 0;
  const isSurjective = isFunction && uncoveredOutputs.length === 0;
  return {
    isFunction,
    isInjective,
    isSurjective,
    isBijective: isInjective && isSurjective,
    rowOutputs,
    issues,
    injectionConflicts,
    imageOutputs,
    uncoveredOutputs,
  };
}

export function doublingPreview(count = 6): { input: number; output: number }[] {
  const size = Math.max(0, Math.floor(count));
  return Array.from({ length: size }, (_, input) => ({ input, output: 2 * input }));
}
