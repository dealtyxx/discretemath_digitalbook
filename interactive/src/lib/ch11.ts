export type ModularOperation = 'addition' | 'multiplication';

function assertModulus(modulus: number) {
  if (!Number.isSafeInteger(modulus) || modulus < 2) {
    throw new RangeError('模数必须是大于或等于 2 的安全整数');
  }
}

export function mod(value: number, modulus: number): number {
  assertModulus(modulus);
  if (!Number.isSafeInteger(value)) throw new RangeError('剩余类代表元必须是安全整数');
  const remainder = BigInt(value) % BigInt(modulus);
  return Number(remainder < 0n ? remainder + BigInt(modulus) : remainder);
}

export function gcd(a: number, b: number): number {
  if (!Number.isSafeInteger(a) || !Number.isSafeInteger(b)) {
    throw new RangeError('最大公因数只接受安全整数');
  }
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

export function isPrime(value: number): boolean {
  if (!Number.isSafeInteger(value) || value < 2) return false;
  for (let divisor = 2; divisor * divisor <= value; divisor += 1) {
    if (value % divisor === 0) return false;
  }
  return true;
}

export function modularTable(modulus: number, operation: ModularOperation): number[][] {
  assertModulus(modulus);
  return Array.from({ length: modulus }, (_, a) =>
    Array.from({ length: modulus }, (_, b) =>
      mod(operation === 'addition' ? a + b : a * b, modulus),
    ),
  );
}

export function modularInverse(value: number, modulus: number): number | null {
  // 扩展欧几里得避免线性试乘，也避免 a*candidate 的浮点中间乘积失真。
  let remainder = BigInt(mod(value, modulus));
  let oldRemainder = BigInt(modulus);
  let coefficient = 1n;
  let oldCoefficient = 0n;
  while (remainder !== 0n) {
    const quotient = oldRemainder / remainder;
    [oldRemainder, remainder] = [remainder, oldRemainder - quotient * remainder];
    [oldCoefficient, coefficient] = [coefficient, oldCoefficient - quotient * coefficient];
  }
  if (oldRemainder !== 1n) return null;
  const result = oldCoefficient % BigInt(modulus);
  return Number(result < 0n ? result + BigInt(modulus) : result);
}

export interface ModularRingAnalysis {
  modulus: number;
  isPrime: boolean;
  isRing: boolean;
  isCommutativeRing: boolean;
  isIntegralDomain: boolean;
  isField: boolean;
  units: number[];
  zeroDivisors: number[];
  zeroDivisorWitness: { a: number; b: number } | null;
}

export function analyzeModularRing(modulus: number): ModularRingAnalysis {
  assertModulus(modulus);
  const units: number[] = [];
  const zeroDivisors: number[] = [];
  let zeroDivisorWitness: { a: number; b: number } | null = null;

  for (let a = 1; a < modulus; a += 1) {
    if (modularInverse(a, modulus) !== null) units.push(a);
    for (let b = 1; b < modulus; b += 1) {
      if (mod(a * b, modulus) === 0) {
        zeroDivisors.push(a);
        if (zeroDivisorWitness === null) zeroDivisorWitness = { a, b };
        break;
      }
    }
  }

  return {
    modulus,
    isPrime: isPrime(modulus),
    isRing: true,
    isCommutativeRing: true,
    isIntegralDomain: zeroDivisorWitness === null,
    isField: units.length === modulus - 1,
    units,
    zeroDivisors,
    zeroDivisorWitness,
  };
}

export type LatticeKind = 'divisor' | 'subset';

export interface LatticeModel {
  kind: LatticeKind;
  elements: number[];
  labels: Record<number, string>;
  covers: Array<readonly [number, number]>;
  ranks: Record<number, number>;
  lessOrEqual: (a: number, b: number) => boolean;
}

function finishLattice(
  kind: LatticeKind,
  elements: number[],
  labels: Record<number, string>,
  lessOrEqual: (a: number, b: number) => boolean,
): LatticeModel {
  const covers: Array<readonly [number, number]> = [];
  for (const lower of elements) {
    for (const upper of elements) {
      if (lower === upper || !lessOrEqual(lower, upper)) continue;
      const hasIntermediate = elements.some((middle) =>
        middle !== lower && middle !== upper
        && lessOrEqual(lower, middle) && lessOrEqual(middle, upper),
      );
      if (!hasIntermediate) covers.push([lower, upper] as const);
    }
  }

  const ranks: Record<number, number> = {};
  elements.forEach((element) => { ranks[element] = 0; });
  for (let pass = 0; pass < elements.length; pass += 1) {
    for (const [lower, upper] of covers) {
      ranks[upper] = Math.max(ranks[upper], ranks[lower] + 1);
    }
  }

  return { kind, elements, labels, covers, ranks, lessOrEqual };
}

export function buildDivisorLattice(n = 12): LatticeModel {
  if (!Number.isInteger(n) || n < 2) throw new RangeError('因数格的整数必须大于或等于 2');
  const elements = Array.from({ length: n - 1 }, (_, index) => index + 1)
    .filter((candidate) => n % candidate === 0)
    .concat(n);
  const labels: Record<number, string> = {};
  elements.forEach((element) => { labels[element] = String(element); });
  return finishLattice('divisor', elements, labels, (a, b) => b % a === 0);
}

export function buildSubsetLattice(symbols: readonly string[] = ['a', 'b', 'c']): LatticeModel {
  if (symbols.length < 1 || symbols.length > 4
    || symbols.some((symbol) => symbol.length === 0)
    || new Set(symbols).size !== symbols.length) {
    throw new RangeError('子集格需要 1 至 4 个互不相同的非空元素名');
  }
  const size = 2 ** symbols.length;
  const elements = Array.from({ length: size }, (_, index) => index);
  const labels: Record<number, string> = {};
  elements.forEach((mask) => {
    const members = symbols.filter((_, index) => (mask & (1 << index)) !== 0);
    labels[mask] = members.length === 0 ? '∅' : `{${members.join(',')}}`;
  });
  return finishLattice('subset', elements, labels, (a, b) => (a & b) === a);
}

export interface LatticeBounds {
  upperBounds: number[];
  lowerBounds: number[];
  join: number | null;
  meet: number | null;
}

export function latticeBounds(model: LatticeModel, a: number, b: number): LatticeBounds {
  if (!model.elements.includes(a) || !model.elements.includes(b)) {
    throw new RangeError('所选元素必须属于当前格');
  }
  const upperBounds = model.elements.filter((candidate) =>
    model.lessOrEqual(a, candidate) && model.lessOrEqual(b, candidate),
  );
  const lowerBounds = model.elements.filter((candidate) =>
    model.lessOrEqual(candidate, a) && model.lessOrEqual(candidate, b),
  );
  const join = upperBounds.find((candidate) =>
    upperBounds.every((other) => model.lessOrEqual(candidate, other)),
  ) ?? null;
  const meet = lowerBounds.find((candidate) =>
    lowerBounds.every((other) => model.lessOrEqual(other, candidate)),
  ) ?? null;
  return { upperBounds, lowerBounds, join, meet };
}

export type Bit = 0 | 1;
export type BooleanOperation = 'and' | 'or' | 'not';

export function evaluateBoolean(operation: BooleanOperation, a: Bit, b: Bit = 0): Bit {
  if (operation === 'not') return a === 0 ? 1 : 0;
  if (operation === 'and') return a === 1 && b === 1 ? 1 : 0;
  return a === 1 || b === 1 ? 1 : 0;
}

export interface BooleanTruthRow {
  a: Bit;
  b: Bit | null;
  result: Bit;
}

export function booleanTruthTable(operation: BooleanOperation): BooleanTruthRow[] {
  const inputs: Array<readonly [Bit, Bit | null]> = operation === 'not'
    ? [[0, null], [1, null]]
    : [[0, 0], [0, 1], [1, 0], [1, 1]];
  return inputs.map(([a, b]) => ({
    a,
    b,
    result: evaluateBoolean(operation, a, b ?? 0),
  }));
}

export function checkDeMorgan(a: Bit, b: Bit) {
  const andLeft = evaluateBoolean('not', evaluateBoolean('and', a, b));
  const andRight = evaluateBoolean('or', evaluateBoolean('not', a), evaluateBoolean('not', b));
  const orLeft = evaluateBoolean('not', evaluateBoolean('or', a, b));
  const orRight = evaluateBoolean('and', evaluateBoolean('not', a), evaluateBoolean('not', b));
  return { andLeft, andRight, orLeft, orRight, holds: andLeft === andRight && orLeft === orRight };
}

export function checkDualIdentities(a: Bit) {
  const orZero = evaluateBoolean('or', a, 0);
  const andOne = evaluateBoolean('and', a, 1);
  return { orZero, andOne, holds: orZero === a && andOne === a };
}

export function checkComplement(a: Bit) {
  const notA = evaluateBoolean('not', a);
  const join = evaluateBoolean('or', a, notA);
  const meet = evaluateBoolean('and', a, notA);
  return { notA, join, meet, holds: join === 1 && meet === 0 };
}
