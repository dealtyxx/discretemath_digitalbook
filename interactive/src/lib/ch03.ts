export const RELATION_ELEMENTS = ['a', 'b', 'c', 'd'] as const;

export type RelationMatrix = boolean[][];
export type ClosureKind = 'reflexive' | 'symmetric' | 'transitive';

export interface OrderedPair {
  from: number;
  to: number;
}

export interface RelationViolation {
  premises: OrderedPair[];
  missing?: OrderedPair;
}

export interface PropertyCheck {
  holds: boolean;
  violations: RelationViolation[];
}

export interface RelationAnalysis {
  reflexive: PropertyCheck;
  symmetric: PropertyCheck;
  antisymmetric: PropertyCheck;
  transitive: PropertyCheck;
}

export interface ClosureResult {
  matrix: RelationMatrix;
  added: OrderedPair[];
}

export interface WarshallSnapshot {
  matrix: RelationMatrix;
  k: number;
  i: number;
  j: number;
  previous: boolean;
  left: boolean;
  right: boolean;
  value: boolean;
  added: boolean;
}

export function cloneRelation(matrix: RelationMatrix): RelationMatrix {
  return matrix.map((row) => [...row]);
}

export function createRelation(
  pairs: readonly (readonly [number, number])[] = [],
  size: number = RELATION_ELEMENTS.length,
): RelationMatrix {
  if (!Number.isSafeInteger(size) || size < 0) throw new RangeError('关系维数必须是非负安全整数');
  const matrix = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
  for (const [from, to] of pairs) {
    if (!Number.isSafeInteger(from) || !Number.isSafeInteger(to)
      || from < 0 || from >= size || to < 0 || to >= size) {
      throw new RangeError('有序对下标必须是维数范围内的整数');
    }
    matrix[from][to] = true;
  }
  return matrix;
}

export function toggleRelation(matrix: RelationMatrix, from: number, to: number): RelationMatrix {
  const next = cloneRelation(matrix);
  next[from][to] = !next[from][to];
  return next;
}

export function countOrderedPairs(matrix: RelationMatrix): number {
  return matrix.reduce((total, row) => total + row.filter(Boolean).length, 0);
}

export function addedOrderedPairs(before: RelationMatrix, after: RelationMatrix): OrderedPair[] {
  const added: OrderedPair[] = [];
  for (let from = 0; from < after.length; from += 1) {
    for (let to = 0; to < after.length; to += 1) {
      if (after[from][to] && !before[from][to]) added.push({ from, to });
    }
  }
  return added;
}

export function analyzeRelation(matrix: RelationMatrix): RelationAnalysis {
  const size = matrix.length;
  const reflexiveViolations: RelationViolation[] = [];
  const symmetricViolations: RelationViolation[] = [];
  const antisymmetricViolations: RelationViolation[] = [];
  const transitiveViolations: RelationViolation[] = [];

  for (let i = 0; i < size; i += 1) {
    if (!matrix[i][i]) {
      reflexiveViolations.push({ premises: [], missing: { from: i, to: i } });
    }
    for (let j = 0; j < size; j += 1) {
      if (matrix[i][j] && !matrix[j][i]) {
        symmetricViolations.push({
          premises: [{ from: i, to: j }],
          missing: { from: j, to: i },
        });
      }
      if (i < j && matrix[i][j] && matrix[j][i]) {
        antisymmetricViolations.push({
          premises: [{ from: i, to: j }, { from: j, to: i }],
        });
      }
      for (let k = 0; k < size; k += 1) {
        if (matrix[i][k] && matrix[k][j] && !matrix[i][j]) {
          transitiveViolations.push({
            premises: [{ from: i, to: k }, { from: k, to: j }],
            missing: { from: i, to: j },
          });
        }
      }
    }
  }

  const check = (violations: RelationViolation[]): PropertyCheck => ({
    holds: violations.length === 0,
    violations,
  });

  return {
    reflexive: check(reflexiveViolations),
    symmetric: check(symmetricViolations),
    antisymmetric: check(antisymmetricViolations),
    transitive: check(transitiveViolations),
  };
}

function closureResult(before: RelationMatrix, matrix: RelationMatrix): ClosureResult {
  return { matrix, added: addedOrderedPairs(before, matrix) };
}

export function reflexiveClosure(matrix: RelationMatrix): ClosureResult {
  const result = cloneRelation(matrix);
  for (let i = 0; i < result.length; i += 1) result[i][i] = true;
  return closureResult(matrix, result);
}

export function symmetricClosure(matrix: RelationMatrix): ClosureResult {
  const result = cloneRelation(matrix);
  for (let i = 0; i < matrix.length; i += 1) {
    for (let j = 0; j < matrix.length; j += 1) {
      if (matrix[i][j]) result[j][i] = true;
    }
  }
  return closureResult(matrix, result);
}

export function transitiveClosure(matrix: RelationMatrix): ClosureResult {
  const result = cloneRelation(matrix);
  const size = result.length;
  for (let k = 0; k < size; k += 1) {
    for (let i = 0; i < size; i += 1) {
      for (let j = 0; j < size; j += 1) {
        result[i][j] = result[i][j] || (result[i][k] && result[k][j]);
      }
    }
  }
  return closureResult(matrix, result);
}

export function relationClosure(matrix: RelationMatrix, kind: ClosureKind): ClosureResult {
  if (kind === 'reflexive') return reflexiveClosure(matrix);
  if (kind === 'symmetric') return symmetricClosure(matrix);
  return transitiveClosure(matrix);
}

export function warshallSnapshots(matrix: RelationMatrix): WarshallSnapshot[] {
  const working = cloneRelation(matrix);
  const size = working.length;
  const snapshots: WarshallSnapshot[] = [{
    matrix: cloneRelation(working),
    k: -1,
    i: -1,
    j: -1,
    previous: false,
    left: false,
    right: false,
    value: false,
    added: false,
  }];

  for (let k = 0; k < size; k += 1) {
    for (let i = 0; i < size; i += 1) {
      for (let j = 0; j < size; j += 1) {
        const previous = working[i][j];
        const left = working[i][k];
        const right = working[k][j];
        const value = previous || (left && right);
        working[i][j] = value;
        snapshots.push({
          matrix: cloneRelation(working),
          k,
          i,
          j,
          previous,
          left,
          right,
          value,
          added: !previous && value,
        });
      }
    }
  }

  return snapshots;
}
