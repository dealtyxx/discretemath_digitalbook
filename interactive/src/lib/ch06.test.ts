import { describe, expect, it } from 'vitest';
import {
  UNARY_FORMULAS,
  createInterpretation,
  domain,
  evaluateExistsForall,
  evaluateForallExists,
  evaluateUnary,
  relationNegation,
  resizeInterpretation,
} from './ch06';

function transpose(matrix: boolean[][]): boolean[][] {
  return matrix.map((_, column) => matrix.map((row) => row[column]));
}

describe('第6章有限论域量词求值', () => {
  it('空论域上全称为真、存在为假，符合空真约定', () => {
    const forall = UNARY_FORMULAS.find((item) => item.id === 'forall-p')!;
    const exists = UNARY_FORMULAS.find((item) => item.id === 'exists-p')!;
    expect(evaluateUnary([], [], forall).value).toBe(true);
    expect(evaluateUnary([], [], exists).value).toBe(false);
    expect(evaluateForallExists([], []).value).toBe(true);
    expect(evaluateExistsForall([], []).value).toBe(false);
  });

  it('量词否定律在三元素论域的全部谓词解释中一致', () => {
    for (let mask = 0; mask < 8; mask += 1) {
      const p = [0, 1, 2].map((index) => Boolean(mask & (1 << index)));
      const byId = new Map(UNARY_FORMULAS.map((spec) => [spec.id, evaluateUnary(domain(3), p, spec)]));
      expect(byId.get('not-forall-p')!.value).toBe(byId.get('exists-not-p')!.value);
      expect(byId.get('not-exists-p')!.value).toBe(byId.get('forall-not-p')!.value);
      byId.forEach((result) => expect(result.directValue).toBe(result.equivalentValue));
    }
  });

  it('逐个体给出全称反例与存在见证', () => {
    const forall = UNARY_FORMULAS.find((item) => item.id === 'forall-p')!;
    const exists = UNARY_FORMULAS.find((item) => item.id === 'exists-p')!;
    const universal = evaluateUnary(domain(3), [true, false, true], forall);
    const existential = evaluateUnary(domain(3), [true, false, true], exists);
    expect(universal.value).toBe(false);
    expect(universal.evidence.map((item) => item.role)).toEqual(['support', 'counterexample', 'support']);
    expect(existential.value).toBe(true);
    expect(existential.evidence.map((item) => item.role)).toEqual(['witness', 'excluded', 'witness']);
  });

  it('存在命题为假时，每个假候选都被排除', () => {
    const exists = UNARY_FORMULAS.find((item) => item.id === 'exists-p')!;
    const result = evaluateUnary(domain(2), [false, false], exists);
    expect(result.value).toBe(false);
    expect(result.evidence.every((item) => item.role === 'excluded')).toBe(true);
  });

  it('单位关系矩阵证明混合量词次序不能普遍交换', () => {
    const model = createInterpretation(3);
    const left = evaluateForallExists(domain(3), model.relation);
    const right = evaluateExistsForall(domain(3), model.relation);
    expect(left.value).toBe(true);
    expect(right.value).toBe(false);
    expect(left.evidence.every((item) => item.witnesses.length === 1)).toBe(true);
    expect(right.evidence.every((item) => item.counterexamples.length === 2)).toBe(true);
    expect(right.evidence[0].explanation).toContain('不是外层存在命题的见证');
    expect(right.evidence.every((item) => item.role === 'excluded')).toBe(true);
  });

  it('存在一整列全真时，两种量词次序都为真', () => {
    const relation = [
      [false, true, false],
      [false, true, false],
      [false, true, false],
    ];
    const left = evaluateForallExists(domain(3), relation);
    const right = evaluateExistsForall(domain(3), relation);
    expect(left.value).toBe(true);
    expect(right.value).toBe(true);
    expect(right.evidence.find((item) => item.y === 'b')?.role).toBe('witness');
  });

  it('任一行全假会成为 ∀x∃yR 的逐行反例', () => {
    const relation = [[true, false], [false, false]];
    const result = evaluateForallExists(domain(2), relation);
    expect(result.value).toBe(false);
    expect(result.evidence[1]).toMatchObject({ x: 'b', value: false, role: 'counterexample', witnesses: [] });
  });

  it('混合量词否定的值可用否定关系上的对偶式核验', () => {
    const model = createInterpretation(2);
    const negated = relationNegation(model.relation);
    const left = evaluateForallExists(domain(2), model.relation);
    const right = evaluateExistsForall(domain(2), model.relation);
    const transposedNegation = transpose(negated);
    expect(!left.value).toBe(evaluateExistsForall(domain(2), transposedNegation).value);
    expect(!right.value).toBe(evaluateForallExists(domain(2), transposedNegation).value);
  });

  it('调整论域保留旧值并把新项初始化为假', () => {
    const source = createInterpretation(2);
    const resized = resizeInterpretation(source, 4);
    expect(resized.p).toEqual([true, false, false, false]);
    expect(resized.relation).toHaveLength(4);
    expect(resized.relation[0][0]).toBe(true);
    expect(resized.relation[3][3]).toBe(false);
    expect(() => domain(5)).toThrow();
    expect(() => createInterpretation(5)).toThrow();
    expect(() => createInterpretation(-1)).toThrow();
  });
});
