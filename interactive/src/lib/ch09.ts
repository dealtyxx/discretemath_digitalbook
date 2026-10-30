export type ModularOperation = 'add' | 'multiply';

export interface Counterexample {
  values: number[];
  left: number;
  right: number;
}

export interface ExhaustiveProperty {
  holds: boolean;
  checked: number;
  total: number;
  counterexample?: Counterexample;
}

export interface InverseInfo {
  element: number;
  inverses: number[];
  divisor: number;
}

export interface ModularAnalysis {
  modulus: number;
  operation: ModularOperation;
  table: number[][];
  closure: ExhaustiveProperty;
  associativity: ExhaustiveProperty;
  commutativity: ExhaustiveProperty;
  identity: number | null;
  identityCounterexample?: Counterexample;
  inverses: InverseInfo[];
  allInvertible: boolean;
}

export interface HomomorphismCheck {
  a: number;
  b: number;
  sourceResult: number;
  left: number;
  right: number;
  holds: boolean;
}

export interface HomomorphismExhaustiveCheck {
  operation: ModularOperation;
  checks: HomomorphismCheck[];
  passed: number;
  total: number;
  holds: boolean;
  counterexample?: HomomorphismCheck;
}

function assertModulus(modulus: number) {
  if (!Number.isSafeInteger(modulus) || modulus < 2) {
    throw new RangeError('模数必须是大于或等于 2 的安全整数');
  }
}

function assertResidue(value: number) {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError('剩余类的代表元必须是安全整数');
  }
}

function modBigInt(value: bigint, modulus: number): number {
  const divisor = BigInt(modulus);
  const remainder = value % divisor;
  return Number(remainder < 0n ? remainder + divisor : remainder);
}

export function mod(value: number, modulus: number): number {
  assertModulus(modulus);
  assertResidue(value);
  return modBigInt(BigInt(value), modulus);
}

export function operate(a: number, b: number, modulus: number, operation: ModularOperation): number {
  assertModulus(modulus);
  assertResidue(a);
  assertResidue(b);
  const result = operation === 'add' ? BigInt(a) + BigInt(b) : BigInt(a) * BigInt(b);
  return modBigInt(result, modulus);
}

export function gcd(a: number, b: number): number {
  assertResidue(a);
  assertResidue(b);
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x;
}

export function buildOperationTable(modulus: number, operation: ModularOperation): number[][] {
  assertModulus(modulus);
  return Array.from({ length: modulus }, (_, a) =>
    Array.from({ length: modulus }, (_, b) => operate(a, b, modulus, operation)),
  );
}

function failedProperty(total: number, counterexample: Counterexample): ExhaustiveProperty {
  return { holds: false, checked: total, total, counterexample };
}

export function analyzeModularSystem(modulus: number, operation: ModularOperation): ModularAnalysis {
  assertModulus(modulus);
  const table = buildOperationTable(modulus, operation);
  const elements = Array.from({ length: modulus }, (_, index) => index);
  let closure: ExhaustiveProperty = { holds: true, checked: modulus ** 2, total: modulus ** 2 };
  let associativity: ExhaustiveProperty = { holds: true, checked: modulus ** 3, total: modulus ** 3 };
  let commutativity: ExhaustiveProperty = { holds: true, checked: modulus ** 2, total: modulus ** 2 };

  outerClosure: for (const a of elements) {
    for (const b of elements) {
      const result = table[a][b];
      if (!elements.includes(result)) {
        closure = failedProperty(modulus ** 2, { values: [a, b], left: result, right: result });
        break outerClosure;
      }
    }
  }

  outerAssociativity: for (const a of elements) {
    for (const b of elements) {
      for (const c of elements) {
        const left = operate(operate(a, b, modulus, operation), c, modulus, operation);
        const right = operate(a, operate(b, c, modulus, operation), modulus, operation);
        if (left !== right) {
          associativity = failedProperty(modulus ** 3, { values: [a, b, c], left, right });
          break outerAssociativity;
        }
      }
    }
  }

  outerCommutativity: for (const a of elements) {
    for (const b of elements) {
      const left = table[a][b];
      const right = table[b][a];
      if (left !== right) {
        commutativity = failedProperty(modulus ** 2, { values: [a, b], left, right });
        break outerCommutativity;
      }
    }
  }

  let identity: number | null = null;
  let identityCounterexample: Counterexample | undefined;
  for (const candidate of elements) {
    let valid = true;
    for (const a of elements) {
      const left = table[candidate][a];
      const right = table[a][candidate];
      if (left !== a || right !== a) {
        identityCounterexample = { values: [candidate, a], left, right };
        valid = false;
        break;
      }
    }
    if (valid) {
      identity = candidate;
      identityCounterexample = undefined;
      break;
    }
  }

  const inverses = elements.map((a) => ({
    element: a,
    inverses: identity === null ? [] : elements.filter((b) => table[a][b] === identity && table[b][a] === identity),
    divisor: gcd(a, modulus),
  }));

  return {
    modulus,
    operation,
    table,
    closure,
    associativity,
    commutativity,
    identity,
    identityCounterexample,
    inverses,
    allInvertible: inverses.every((item) => item.inverses.length > 0),
  };
}

/** 检验 f: Z_4 -> Z_2, f(x)=x mod 2 在一个有序对上的保持运算等式。 */
export function checkMod2HomomorphismPair(a: number, b: number, operation: ModularOperation): HomomorphismCheck {
  for (const value of [a, b]) {
    if (!Number.isInteger(value) || value < 0 || value > 3) {
      throw new RangeError('Z_4 的元素必须取 0、1、2、3');
    }
  }
  const sourceResult = operate(a, b, 4, operation);
  const left = mod(sourceResult, 2);
  const right = operate(mod(a, 2), mod(b, 2), 2, operation);
  return { a, b, sourceResult, left, right, holds: left === right };
}

/** 穷举 Z_4 中全部 4×4 个有序对；结论仅针对这里指定的有限系统与运算。 */
export function checkMod2HomomorphismExhaustively(operation: ModularOperation): HomomorphismExhaustiveCheck {
  const checks: HomomorphismCheck[] = [];
  for (let a = 0; a < 4; a += 1) {
    for (let b = 0; b < 4; b += 1) {
      checks.push(checkMod2HomomorphismPair(a, b, operation));
    }
  }
  const counterexample = checks.find((check) => !check.holds);
  const passed = checks.filter((check) => check.holds).length;
  return {
    operation,
    checks,
    passed,
    total: checks.length,
    holds: counterexample === undefined,
    counterexample,
  };
}
