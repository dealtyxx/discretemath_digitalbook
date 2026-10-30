export type Quantifier = 'forall' | 'exists';
export type EvidenceRole = 'witness' | 'counterexample' | 'support' | 'excluded';

export interface Interpretation {
  size: number;
  p: boolean[];
  relation: boolean[][];
}

export interface UnaryFormulaSpec {
  id: string;
  quantifier: Quantifier;
  bodyNegated: boolean;
  outerNegated: boolean;
}

export interface UnaryEvidence {
  individual: string;
  predicateValue: boolean;
  bodyValue: boolean;
  role: EvidenceRole;
  explanation: string;
}

export interface UnaryEvaluation {
  value: boolean;
  directValue: boolean;
  equivalentValue: boolean;
  evidenceFormulaTex: string;
  evidence: UnaryEvidence[];
}

export interface ForallExistsEvidence {
  x: string;
  value: boolean;
  witnesses: string[];
  role: EvidenceRole;
  explanation: string;
}

export interface ForallExistsEvaluation {
  value: boolean;
  evidence: ForallExistsEvidence[];
}

export interface ExistsForallEvidence {
  y: string;
  value: boolean;
  counterexamples: string[];
  role: EvidenceRole;
  explanation: string;
}

export interface ExistsForallEvaluation {
  value: boolean;
  evidence: ExistsForallEvidence[];
}

export const DOMAIN_LABELS = ['a', 'b', 'c', 'd'] as const;

export const UNARY_FORMULAS: UnaryFormulaSpec[] = [
  { id: 'forall-p', quantifier: 'forall', bodyNegated: false, outerNegated: false },
  { id: 'exists-p', quantifier: 'exists', bodyNegated: false, outerNegated: false },
  { id: 'not-forall-p', quantifier: 'forall', bodyNegated: false, outerNegated: true },
  { id: 'exists-not-p', quantifier: 'exists', bodyNegated: true, outerNegated: false },
  { id: 'not-exists-p', quantifier: 'exists', bodyNegated: false, outerNegated: true },
  { id: 'forall-not-p', quantifier: 'forall', bodyNegated: true, outerNegated: false },
];

export function domain(size: number): string[] {
  if (!Number.isInteger(size) || size < 0 || size > DOMAIN_LABELS.length) {
    throw new Error('论域大小必须是 0 到 4 的整数');
  }
  return DOMAIN_LABELS.slice(0, size);
}

export function createInterpretation(size = 2): Interpretation {
  domain(size);
  return {
    size,
    p: Array.from({ length: size }, (_, index) => index % 2 === 0),
    relation: Array.from({ length: size }, (_, row) =>
      Array.from({ length: size }, (_, column) => row === column)),
  };
}

export function resizeInterpretation(source: Interpretation, size: number): Interpretation {
  domain(size);
  return {
    size,
    p: Array.from({ length: size }, (_, index) => source.p[index] ?? false),
    relation: Array.from({ length: size }, (_, row) =>
      Array.from({ length: size }, (_, column) => source.relation[row]?.[column] ?? false)),
  };
}

export function unaryFormulaTex(spec: UnaryFormulaSpec): string {
  const body = `${spec.bodyNegated ? '\\neg ' : ''}P(x)`;
  const core = `${spec.quantifier === 'forall' ? '\\forall' : '\\exists'} x\\,${body}`;
  return spec.outerNegated ? `\\neg(${core})` : core;
}

export function unaryFormulaText(spec: UnaryFormulaSpec): string {
  const body = `${spec.bodyNegated ? '¬' : ''}P(x)`;
  const core = `${spec.quantifier === 'forall' ? '∀' : '∃'}x${body}`;
  return spec.outerNegated ? `¬(${core})` : core;
}

function quantifierValue(values: boolean[], quantifier: Quantifier): boolean {
  return quantifier === 'forall' ? values.every(Boolean) : values.some(Boolean);
}

export function evaluateUnary(
  individuals: string[],
  p: boolean[],
  spec: UnaryFormulaSpec,
): UnaryEvaluation {
  if (individuals.length !== p.length) throw new Error('个体与谓词真值数量不一致');
  const directBody = p.map((value) => spec.bodyNegated ? !value : value);
  const directQuantified = quantifierValue(directBody, spec.quantifier);
  const directValue = spec.outerNegated ? !directQuantified : directQuantified;

  const equivalentQuantifier: Quantifier = spec.outerNegated
    ? (spec.quantifier === 'forall' ? 'exists' : 'forall')
    : spec.quantifier;
  const equivalentBodyNegated = spec.outerNegated ? !spec.bodyNegated : spec.bodyNegated;
  const equivalentBody = p.map((value) => equivalentBodyNegated ? !value : value);
  const equivalentValue = quantifierValue(equivalentBody, equivalentQuantifier);
  const evidenceSpec: UnaryFormulaSpec = {
    ...spec,
    quantifier: equivalentQuantifier,
    bodyNegated: equivalentBodyNegated,
    outerNegated: false,
  };

  const evidence = individuals.map((individual, index): UnaryEvidence => {
    const bodyValue = equivalentBody[index];
    let role: EvidenceRole;
    let explanation: string;
    if (equivalentQuantifier === 'forall') {
      if (bodyValue) {
        role = 'support';
        explanation = `${individual} 通过内层检查；全称命题仍须检查其余个体。`;
      } else {
        role = 'counterexample';
        explanation = `${individual} 使内层为假，是全称命题的反例。`;
      }
    } else if (bodyValue) {
      role = 'witness';
      explanation = `${individual} 使内层为真，是存在命题的见证。`;
    } else {
      // 失败的单个候选只排除这个见证，不能独自反驳整个存在命题。
      role = 'excluded';
      explanation = equivalentValue
        ? `${individual} 不是见证；已有其他个体证明存在命题。`
        : `${individual} 不使内层为真，此候选被排除；所有候选均失败才否定存在命题。`;
    }
    return {
      individual,
      predicateValue: p[index],
      bodyValue,
      role,
      explanation,
    };
  });

  return {
    value: directValue,
    directValue,
    equivalentValue,
    evidenceFormulaTex: unaryFormulaTex(evidenceSpec),
    evidence,
  };
}

export function evaluateForallExists(
  individuals: string[],
  relation: boolean[][],
): ForallExistsEvaluation {
  if (relation.length !== individuals.length || relation.some((row) => row.length !== individuals.length)) {
    throw new Error('关系矩阵必须与论域同阶');
  }
  const evidence = individuals.map((x, row): ForallExistsEvidence => {
    const witnesses = individuals.filter((_, column) => relation[row][column]);
    const value = witnesses.length > 0;
    return {
      x,
      value,
      witnesses,
      role: value ? 'witness' : 'counterexample',
      explanation: value
        ? `x=${x}：${witnesses.map((y) => `R(${x},${y})`).join('、')} 为真；${witnesses.join('、')} 可作内层 ∃y 的见证。`
        : `x=${x}：这一行全为假，没有 y 可使 R(${x},y) 为真，因此 x=${x} 是全称命题的反例。`,
    };
  });
  return { value: evidence.every((item) => item.value), evidence };
}

export function evaluateExistsForall(
  individuals: string[],
  relation: boolean[][],
): ExistsForallEvaluation {
  if (relation.length !== individuals.length || relation.some((row) => row.length !== individuals.length)) {
    throw new Error('关系矩阵必须与论域同阶');
  }
  const evidence = individuals.map((y, column): ExistsForallEvidence => {
    const counterexamples = individuals.filter((_, row) => !relation[row][column]);
    const value = counterexamples.length === 0;
    return {
      y,
      value,
      counterexamples,
      role: value ? 'witness' : 'excluded',
      explanation: value
        ? `y=${y}：这一列全为真，即每个 x 都满足 R(x,${y})；${y} 是外层 ∃y 的见证。`
        : `y=${y}：${counterexamples.map((x) => `R(${x},${y})=假`).join('、')}，所以 y=${y} 不是外层存在命题的见证，此候选被排除。`,
    };
  });
  return { value: evidence.some((item) => item.value), evidence };
}

export function relationNegation(relation: boolean[][]): boolean[][] {
  return relation.map((row) => row.map((value) => !value));
}
