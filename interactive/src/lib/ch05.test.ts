import { describe, expect, it } from 'vitest';
import {
  FORMULA_PRESETS,
  allAssignments,
  analyzeInference,
  atom,
  binary,
  buildTruthTable,
  classify,
  evaluate,
  expressionKey,
  not,
} from './ch05';

const assignment = (p: boolean, q: boolean, r = false) => ({ p, q, r });
const preset = (id: string) => {
  const found = FORMULA_PRESETS.find((item) => item.id === id);
  if (!found) throw new Error(`缺少预设 ${id}`);
  return found;
};

describe('第5章命题求值', () => {
  it('条件式仅在前件真且后件假时为假', () => {
    const implication = atom('p');
    const formula = binary('implies', implication, atom('q'));
    expect([
      evaluate(formula, assignment(true, true)),
      evaluate(formula, assignment(true, false)),
      evaluate(formula, assignment(false, true)),
      evaluate(formula, assignment(false, false)),
    ]).toEqual([true, false, true, true]);
  });

  it('赋值枚举完整且按二进制从全假到全真排列', () => {
    const assignments = allAssignments(['p', 'q', 'r']);
    expect(assignments).toHaveLength(8);
    expect(assignments[0]).toEqual(assignment(false, false, false));
    expect(assignments[7]).toEqual(assignment(true, true, true));
    expect(new Set(assignments.map((item) => `${item.p}${item.q}${item.r}`)).size).toBe(8);
  });

  it('重复变量只枚举一次，不夸大一元公式的赋值数量', () => {
    expect(allAssignments(['p', 'p'])).toEqual(allAssignments(['p']));
    expect(allAssignments(['p', 'p'])).toHaveLength(2);
  });

  it('真值表包含全部赋值与去重后的子公式列', () => {
    const formula = preset('demorgan-or').expression;
    const table = buildTruthTable(formula);
    expect(table.rows).toHaveLength(4);
    expect(table.columns.at(-1)?.isRoot).toBe(true);
    expect(new Set(table.columns.map((column) => column.key)).size).toBe(table.columns.length);
    expect(table.rows.every((row) => row.result)).toBe(true);
    expect(classify(table)).toEqual({ kind: 'tautology', satisfying: 4, falsifying: 0 });
  });

  it('两条德摩根律在所有赋值下都成立', () => {
    for (const id of ['demorgan-or', 'demorgan-and']) {
      const table = buildTruthTable(preset(id).expression);
      expect(table.rows.every((row) => row.result)).toBe(true);
    }
  });

  it('区分重言式、矛盾式和非重言的可满足式', () => {
    expect(classify(buildTruthTable(preset('modus-ponens').expression)).kind).toBe('tautology');
    expect(classify(buildTruthTable(preset('contradiction').expression))).toEqual({
      kind: 'contradiction', satisfying: 0, falsifying: 2,
    });
    expect(classify(buildTruthTable(preset('contingent').expression))).toEqual({
      kind: 'contingent', satisfying: 3, falsifying: 1,
    });
  });

  it('假言推理有效，结论仍可在某些赋值下为假', () => {
    const item = preset('modus-ponens');
    const analysis = analyzeInference(item.inference!);
    expect(analysis.valid).toBe(true);
    expect(analysis.checked).toBe(4);
    expect(evaluate(item.inference!.conclusion, assignment(false, false))).toBe(false);
    expect(analyzeInference(item.inference!).counterexamples).toHaveLength(0);
  });

  it('肯定后件有 p假q真的明确反例', () => {
    const analysis = analyzeInference(preset('affirming-consequent').inference!);
    expect(analysis.valid).toBe(false);
    expect(analysis.counterexamples).toEqual([assignment(false, true)]);
  });

  it('三变元假言三段论检查全部八组赋值', () => {
    const analysis = analyzeInference(preset('hypothetical-syllogism').inference!);
    expect(analysis.valid).toBe(true);
    expect(analysis.checked).toBe(8);
  });

  it('表达式键保留运算结构，不把不同公式混为一列', () => {
    const p = atom('p');
    expect(expressionKey(not(p))).not.toBe(expressionKey(p));
    expect(expressionKey(binary('and', p, not(p)))).not.toBe(expressionKey(binary('or', p, not(p))));
  });
});
