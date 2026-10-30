export const MAX_COUNT_N = 12;
export const SMALL_PRIMES = [3, 5, 7, 11, 13, 17, 19] as const;

export type CountingKind = 'permutation' | 'combination';
export type CountingRule = 'addition' | 'multiplication';

function assertIntegerInRange(value: number, min: number, max: number, name: string) {
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new RangeError(`${name} 必须是 ${min} 到 ${max} 之间的整数`);
  }
}

function assertCountingInput(n: number, r: number) {
  assertIntegerInRange(n, 0, MAX_COUNT_N, 'n');
  assertIntegerInRange(r, 0, n, 'r');
}

/** P(n, r)，通过 r 次乘法计算，避免先构造大阶乘。 */
export function permutation(n: number, r: number): number {
  assertCountingInput(n, r);
  let result = 1;
  for (let index = 0; index < r; index += 1) result *= n - index;
  return result;
}

/** C(n, r)，利用对称性并使用逐项约分后的整数递推。 */
export function combination(n: number, r: number): number {
  assertCountingInput(n, r);
  const k = Math.min(r, n - r);
  let result = 1;
  for (let index = 1; index <= k; index += 1) {
    result = (result * (n - k + index)) / index;
  }
  return result;
}

export function countSelections(n: number, r: number, kind: CountingKind): number {
  return kind === 'permutation' ? permutation(n, r) : combination(n, r);
}

/**
 * 只生成至多 limit 个字典序样例，不把样例数量冒充总数。
 * 元素用 0..n-1 表示，空选取返回一个空数组。
 */
export function enumerateSelections(
  n: number,
  r: number,
  kind: CountingKind,
  limit = 12,
): number[][] {
  assertCountingInput(n, r);
  assertIntegerInRange(limit, 0, 100, '样例上限');
  if (limit === 0) return [];

  const results: number[][] = [];
  const current: number[] = [];
  const used = Array.from({ length: n }, () => false);

  const visit = (start: number) => {
    if (results.length >= limit) return;
    if (current.length === r) {
      results.push([...current]);
      return;
    }
    for (let value = start; value < n; value += 1) {
      if (kind === 'permutation' && used[value]) continue;
      current.push(value);
      used[value] = true;
      visit(kind === 'permutation' ? 0 : value + 1);
      current.pop();
      used[value] = false;
      if (results.length >= limit) return;
    }
  };

  visit(0);
  return results;
}

export function countingRuleTotal(m: number, n: number, rule: CountingRule): number {
  assertIntegerInRange(m, 0, 12, 'm');
  assertIntegerInRange(n, 0, 12, 'n');
  return rule === 'addition' ? m + n : m * n;
}

export interface EuclideanSnapshot {
  index: number;
  a: number;
  b: number;
  quotient: number | null;
  remainder: number | null;
  nextA: number | null;
  nextB: number | null;
  gcd: number | null;
}

/**
 * 初始快照之后，每次带余除法都保存一个快照；最后一条必有 remainder = 0。
 * 输入取绝对值，与教材的欧几里得算法口径一致。
 */
export function euclideanSnapshots(inputA: number, inputB: number): EuclideanSnapshot[] {
  if (!Number.isSafeInteger(inputA) || !Number.isSafeInteger(inputB)) {
    throw new RangeError('欧几里得算法只接受安全整数');
  }
  let a = Math.abs(inputA);
  let b = Math.abs(inputB);
  const snapshots: EuclideanSnapshot[] = [{
    index: 0,
    a,
    b,
    quotient: null,
    remainder: null,
    nextA: null,
    nextB: null,
    gcd: b === 0 ? a : null,
  }];

  while (b !== 0) {
    const quotient = Math.floor(a / b);
    const remainder = a % b;
    const nextA = b;
    const nextB = remainder;
    snapshots.push({
      index: snapshots.length,
      a,
      b,
      quotient,
      remainder,
      nextA,
      nextB,
      gcd: remainder === 0 ? nextA : null,
    });
    a = nextA;
    b = nextB;
  }
  return snapshots;
}

export function gcd(a: number, b: number): number {
  const snapshots = euclideanSnapshots(a, b);
  return snapshots[snapshots.length - 1].gcd ?? 0;
}

export interface BezoutIdentity {
  gcd: number;
  x: number;
  y: number;
}

/** 迭代版扩展欧几里得算法，返回 a*x + b*y = gcd(a,b)。 */
export function extendedGcd(a: number, b: number): BezoutIdentity {
  assertIntegerInRange(a, 0, Number.MAX_SAFE_INTEGER, 'a');
  assertIntegerInRange(b, 0, Number.MAX_SAFE_INTEGER, 'b');
  let oldR = a;
  let r = b;
  let oldS = 1;
  let s = 0;
  let oldT = 0;
  let t = 1;

  while (r !== 0) {
    const quotient = Math.floor(oldR / r);
    [oldR, r] = [r, oldR - quotient * r];
    [oldS, s] = [s, oldS - quotient * s];
    [oldT, t] = [t, oldT - quotient * t];
  }
  return { gcd: oldR, x: oldS, y: oldT };
}

function positiveModBigInt(value: bigint, modulus: bigint): bigint {
  const remainder = value % modulus;
  return remainder < 0n ? remainder + modulus : remainder;
}

export function positiveMod(value: number, modulus: number): number {
  assertIntegerInRange(modulus, 1, Number.MAX_SAFE_INTEGER, '模数');
  if (!Number.isSafeInteger(value)) throw new RangeError('被除数必须是安全整数');
  return Number(positiveModBigInt(BigInt(value), BigInt(modulus)));
}

export function modInverse(value: number, modulus: number): number {
  assertIntegerInRange(modulus, 2, Number.MAX_SAFE_INTEGER, '模数');
  const normalized = positiveMod(value, modulus);
  const identity = extendedGcd(normalized, modulus);
  if (identity.gcd !== 1) throw new RangeError('该整数在此模数下没有乘法逆元');
  return positiveMod(identity.x, modulus);
}

/** 平方-乘算法；BigInt 保证安全整数输入的中间乘积也不会丢失精度。 */
export function modPow(base: number, exponent: number, modulus: number): number {
  assertIntegerInRange(exponent, 0, Number.MAX_SAFE_INTEGER, '指数');
  assertIntegerInRange(modulus, 1, Number.MAX_SAFE_INTEGER, '模数');
  if (!Number.isSafeInteger(base)) throw new RangeError('底数必须是安全整数');
  const modulusBigInt = BigInt(modulus);
  let factor = positiveModBigInt(BigInt(base), modulusBigInt);
  let power = exponent;
  let result = 1n % modulusBigInt;
  while (power > 0) {
    if (power % 2 === 1) result = positiveModBigInt(result * factor, modulusBigInt);
    factor = positiveModBigInt(factor * factor, modulusBigInt);
    power = Math.floor(power / 2);
  }
  return Number(result);
}

export function validPublicExponents(phi: number): number[] {
  assertIntegerInRange(phi, 3, 1024, 'φ(n)');
  const candidates: number[] = [];
  for (let exponent = 2; exponent < phi; exponent += 1) {
    if (gcd(exponent, phi) === 1) candidates.push(exponent);
  }
  return candidates;
}

export interface RsaDemo {
  p: number;
  q: number;
  n: number;
  phi: number;
  e: number;
  d: number;
  message: number;
  ciphertext: number;
  decrypted: number;
  inverseProof: number;
  euclidean: EuclideanSnapshot[];
}

/** 仅允许预列小素数，明确不承担任意大整数或生产密码功能。 */
export function createRsaDemo(p: number, q: number, e: number, message: number): RsaDemo {
  if (!SMALL_PRIMES.some((prime) => prime === p) || !SMALL_PRIMES.some((prime) => prime === q)) {
    throw new RangeError('p、q 必须选自实验提供的小素数');
  }
  if (p === q) throw new RangeError('RSA 教学示例要求 p 与 q 为不同素数');
  const n = p * q;
  const phi = (p - 1) * (q - 1);
  if (!Number.isSafeInteger(e) || e < 2 || e >= phi || gcd(e, phi) !== 1) {
    throw new RangeError('e 必须满足 1 < e < φ(n) 且与 φ(n) 互素');
  }
  assertIntegerInRange(message, 0, n - 1, '消息 M');
  const d = modInverse(e, phi);
  const ciphertext = modPow(message, e, n);
  const decrypted = modPow(ciphertext, d, n);
  return {
    p,
    q,
    n,
    phi,
    e,
    d,
    message,
    ciphertext,
    decrypted,
    inverseProof: positiveMod(e * d, phi),
    euclidean: euclideanSnapshots(phi, e),
  };
}
