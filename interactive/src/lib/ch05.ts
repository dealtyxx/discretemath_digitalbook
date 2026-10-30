export type AtomName = 'p' | 'q' | 'r';
export type Assignment = Record<AtomName, boolean>;
export type BinaryOperator = 'and' | 'or' | 'implies' | 'iff';

export type Expression =
  | { kind: 'atom'; name: AtomName }
  | { kind: 'not'; operand: Expression }
  | { kind: 'binary'; operator: BinaryOperator; left: Expression; right: Expression };

export interface InferenceSchema {
  premises: Expression[];
  conclusion: Expression;
}

export interface FormulaPreset {
  id: string;
  title: string;
  description: string;
  expression: Expression;
  inference?: InferenceSchema;
}

export interface TruthColumn {
  key: string;
  expression: Expression;
  isRoot: boolean;
}

export interface TruthRow {
  index: number;
  assignment: Assignment;
  values: Record<string, boolean>;
  result: boolean;
}

export interface TruthTable {
  variables: AtomName[];
  columns: TruthColumn[];
  rows: TruthRow[];
}

export type FormulaClassification = 'tautology' | 'contradiction' | 'contingent';

export interface ClassificationResult {
  kind: FormulaClassification;
  satisfying: number;
  falsifying: number;
}

export interface InferenceAnalysis {
  valid: boolean;
  counterexamples: Assignment[];
  checked: number;
}

export const ATOM_ORDER: AtomName[] = ['p', 'q', 'r'];

export function atom(name: AtomName): Expression {
  return { kind: 'atom', name };
}

export function not(operand: Expression): Expression {
  return { kind: 'not', operand };
}

export function binary(operator: BinaryOperator, left: Expression, right: Expression): Expression {
  return { kind: 'binary', operator, left, right };
}

export function conjunction(expressions: Expression[]): Expression {
  if (expressions.length === 0) throw new Error('合取至少需要一个公式');
  return expressions.slice(1).reduce((left, right) => binary('and', left, right), expressions[0]);
}

export function expressionKey(expression: Expression): string {
  if (expression.kind === 'atom') return expression.name;
  if (expression.kind === 'not') return `not(${expressionKey(expression.operand)})`;
  return `${expression.operator}(${expressionKey(expression.left)},${expressionKey(expression.right)})`;
}

export function expressionText(expression: Expression): string {
  if (expression.kind === 'atom') return expression.name;
  if (expression.kind === 'not') return `¬(${expressionText(expression.operand)})`;
  const symbols: Record<BinaryOperator, string> = {
    and: '∧', or: '∨', implies: '→', iff: '↔',
  };
  return `(${expressionText(expression.left)} ${symbols[expression.operator]} ${expressionText(expression.right)})`;
}

export function expressionTex(expression: Expression): string {
  if (expression.kind === 'atom') return expression.name;
  if (expression.kind === 'not') return `\\neg(${expressionTex(expression.operand)})`;
  const symbols: Record<BinaryOperator, string> = {
    and: '\\land', or: '\\lor', implies: '\\to', iff: '\\leftrightarrow',
  };
  return `(${expressionTex(expression.left)} ${symbols[expression.operator]} ${expressionTex(expression.right)})`;
}

export function evaluate(expression: Expression, assignment: Assignment): boolean {
  if (expression.kind === 'atom') return assignment[expression.name];
  if (expression.kind === 'not') return !evaluate(expression.operand, assignment);
  const left = evaluate(expression.left, assignment);
  const right = evaluate(expression.right, assignment);
  switch (expression.operator) {
    case 'and': return left && right;
    case 'or': return left || right;
    case 'implies': return !left || right;
    case 'iff': return left === right;
  }
}

export function variablesIn(expression: Expression): AtomName[] {
  const found = new Set<AtomName>();
  const visit = (node: Expression) => {
    if (node.kind === 'atom') {
      found.add(node.name);
      return;
    }
    if (node.kind === 'not') {
      visit(node.operand);
      return;
    }
    visit(node.left);
    visit(node.right);
  };
  visit(expression);
  return ATOM_ORDER.filter((name) => found.has(name));
}

export function allAssignments(variables: AtomName[]): Assignment[] {
  const uniqueVariables = ATOM_ORDER.filter((name) => variables.includes(name));
  return Array.from({ length: 2 ** uniqueVariables.length }, (_, index) => {
    const assignment: Assignment = { p: false, q: false, r: false };
    uniqueVariables.forEach((name, variableIndex) => {
      assignment[name] = Boolean(index & (1 << variableIndex));
    });
    return assignment;
  });
}

export function subformulas(expression: Expression): Expression[] {
  const ordered: Expression[] = [];
  const seen = new Set<string>();
  const visit = (node: Expression) => {
    if (node.kind === 'not') visit(node.operand);
    if (node.kind === 'binary') {
      visit(node.left);
      visit(node.right);
    }
    const key = expressionKey(node);
    if (!seen.has(key)) {
      seen.add(key);
      ordered.push(node);
    }
  };
  visit(expression);
  return ordered;
}

export function buildTruthTable(expression: Expression): TruthTable {
  const variables = variablesIn(expression);
  const columns: TruthColumn[] = subformulas(expression).map((item) => ({
    key: expressionKey(item),
    expression: item,
    isRoot: expressionKey(item) === expressionKey(expression),
  }));
  const rows = allAssignments(variables).map((assignment, index): TruthRow => {
    const values: Record<string, boolean> = {};
    columns.forEach((column) => {
      values[column.key] = evaluate(column.expression, assignment);
    });
    return {
      index,
      assignment,
      values,
      result: values[expressionKey(expression)],
    };
  });
  return { variables, columns, rows };
}

export function classify(table: TruthTable): ClassificationResult {
  const satisfying = table.rows.filter((row) => row.result).length;
  const falsifying = table.rows.length - satisfying;
  if (falsifying === 0) return { kind: 'tautology', satisfying, falsifying };
  if (satisfying === 0) return { kind: 'contradiction', satisfying, falsifying };
  return { kind: 'contingent', satisfying, falsifying };
}

export function analyzeInference(schema: InferenceSchema): InferenceAnalysis {
  const variables = ATOM_ORDER.filter((name) =>
    schema.premises.some((premise) => variablesIn(premise).includes(name))
    || variablesIn(schema.conclusion).includes(name));
  const assignments = allAssignments(variables);
  const counterexamples = assignments.filter((assignment) =>
    schema.premises.every((premise) => evaluate(premise, assignment))
    && !evaluate(schema.conclusion, assignment));
  return {
    valid: counterexamples.length === 0,
    counterexamples,
    checked: assignments.length,
  };
}

function makeInference(
  id: string,
  title: string,
  description: string,
  premises: Expression[],
  conclusion: Expression,
): FormulaPreset {
  return {
    id,
    title,
    description,
    expression: binary('implies', conjunction(premises), conclusion),
    inference: { premises, conclusion },
  };
}

const p = atom('p');
const q = atom('q');
const r = atom('r');

export const FORMULA_PRESETS: FormulaPreset[] = [
  {
    id: 'implication',
    title: '条件式 p→q',
    description: '只有前件真、后件假时，条件式为假。',
    expression: binary('implies', p, q),
  },
  {
    id: 'demorgan-or',
    title: '德摩根律（析取否定）',
    description: '比较 ¬(p∨q) 与 ¬p∧¬q；整体等价式应为重言式。',
    expression: binary('iff', not(binary('or', p, q)), binary('and', not(p), not(q))),
  },
  {
    id: 'demorgan-and',
    title: '德摩根律（合取否定）',
    description: '比较 ¬(p∧q) 与 ¬p∨¬q；逐列观察两侧真值相同。',
    expression: binary('iff', not(binary('and', p, q)), binary('or', not(p), not(q))),
  },
  makeInference(
    'modus-ponens',
    '假言推理（有效）',
    '前提 p→q 与 p 推出 q；当前结论可真可假，但推理形式始终有效。',
    [binary('implies', p, q), p],
    q,
  ),
  makeInference(
    'affirming-consequent',
    '肯定后件（无效）',
    '由 p→q 与 q 不能推出 p；寻找前提全真而结论为假的反例。',
    [binary('implies', p, q), q],
    p,
  ),
  makeInference(
    'hypothetical-syllogism',
    '假言三段论（有效）',
    '前提 p→q 与 q→r 推出 p→r，完整表有 8 组赋值。',
    [binary('implies', p, q), binary('implies', q, r)],
    binary('implies', p, r),
  ),
  {
    id: 'contradiction',
    title: '矛盾式 p∧¬p',
    description: 'p 与 ¬p 不能同时为真，所有赋值都是成假赋值。',
    expression: binary('and', p, not(p)),
  },
  {
    id: 'contingent',
    title: '非重言的可满足式 p∨q',
    description: '至少一组赋值使其为真，但并非所有赋值都使其为真。',
    expression: binary('or', p, q),
  },
];
