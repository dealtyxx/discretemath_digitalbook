import { useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Formula } from '../components/Formula';
import { StepPlayer } from '../components/StepPlayer';
import type { LabProps, TeachingStep } from '../types';
import {
  analyzeModularRing,
  booleanTruthTable,
  buildDivisorLattice,
  buildSubsetLattice,
  checkComplement,
  checkDeMorgan,
  checkDualIdentities,
  evaluateBoolean,
  latticeBounds,
  modularInverse,
  modularTable,
} from '../lib/ch11';
import type {
  Bit,
  BooleanOperation,
  LatticeKind,
  ModularOperation,
} from '../lib/ch11';
import './Chapter11Lab.css';

type LabMode = 'ring' | 'lattice' | 'boolean';
type BooleanLaw = 'demorgan' | 'dual' | 'complement';

const modeNames: Record<LabMode, string> = {
  ring: '模运算与环域',
  lattice: '哈斯图与上下确界',
  boolean: '布尔代数定律',
};

function stackedLaw(tex: string): string {
  return `\\begin{gathered}${tex.replace(/,\\qquad|,\\quad/g, '\\\\')}\\end{gathered}`;
}

function RingExperiment() {
  const [modulus, setModulus] = useState(5);
  const [operation, setOperation] = useState<ModularOperation>('multiplication');
  const [a, setA] = useState(2);
  const [b, setB] = useState(3);
  const [step, setStep] = useState(0);
  const analysis = useMemo(() => analyzeModularRing(modulus), [modulus]);
  const table = useMemo(() => modularTable(modulus, operation), [modulus, operation]);
  const symbol = operation === 'addition' ? '+' : '\\cdot';
  const visibleSymbol = operation === 'addition' ? '+' : '·';
  const operationName = operation === 'addition' ? '加法' : '乘法';
  const rawResult = operation === 'addition' ? a + b : a * b;
  const result = table[a][b];
  const witness = analysis.zeroDivisorWitness;
  const inverseExample = modularInverse(analysis.units.at(-1) ?? 1, modulus);

  const changeModulus = (next: number) => {
    setModulus(next);
    setA((current) => Math.min(current, next - 1));
    setB((current) => Math.min(current, next - 1));
    setStep(0);
  };

  const steps: TeachingStep[] = [
    {
      label: '剩余类',
      title: `认识 Z_${modulus} 的元素与两种运算`,
      explanation: `元素只取 0 到 ${modulus - 1}。先按整数做加法或乘法，再除以 ${modulus} 取余数，因此两种运算都封闭。`,
      formula: `\\mathbb{Z}_{${modulus}}=\\{0,1,\\ldots,${modulus - 1}\\},\\quad [a][b]=[ab\\bmod ${modulus}]`,
    },
    {
      label: '读取表格',
      title: `核对当前${operationName}单元格`,
      explanation: `第 ${a} 行、第 ${b} 列给出 ${a} ${visibleSymbol} ${b} 的结果。整数结果是 ${rawResult}，模 ${modulus} 后得到 ${result}。点击其他单元格可继续核对。`,
      formula: `${a}${symbol}${b}=${rawResult}\\equiv${result}\\pmod{${modulus}}`,
    },
    {
      label: '环公理',
      title: '先判定环，再讨论零因子',
      explanation: `模 ${modulus} 加法形成交换群，乘法封闭、结合且交换，并满足分配律；0 是加法单位元，1 是乘法单位元。所以 Z_${modulus} 是含幺交换环。`,
      formula: `a(b+c)\\equiv ab+ac\\pmod{${modulus}}`,
    },
    {
      label: witness ? '零因子反例' : '乘法逆元',
      title: witness ? `Z_${modulus} 不是整环，也不是域` : `Z_${modulus} 是整环，也是域`,
      explanation: witness
        ? `${witness.a} 与 ${witness.b} 都不是零元，但乘积模 ${modulus} 为 0。这个反例说明存在零因子；非零元并非都可逆，故不是域。`
        : `${modulus} 是素数，每个非零元都与它互素并有乘法逆元。例如 ${analysis.units.at(-1)} 的逆元是 ${inverseExample}。没有零因子，且所有非零元可逆，所以是域。`,
      formula: witness
        ? `${witness.a}\\ne0,\\ ${witness.b}\\ne0,\\quad ${witness.a}\\cdot${witness.b}\\equiv0\\pmod{${modulus}}`
        : `${analysis.units.at(-1)}\\cdot${inverseExample}\\equiv1\\pmod{${modulus}}`,
    },
  ];

  return (
    <div className="lab-workspace ch11-workspace ch11-ring-workspace">
      <div className="lab-column">
        <section className="visualization-panel" aria-labelledby="ch11-ring-table-title">
          <div className="panel-heading">
            <h3 id="ch11-ring-table-title">Z<sub>{modulus}</sub> 的{operationName}表</h3>
            <small>点击单元格读取运算</small>
          </div>
          <div className="ch11-table-scroll" tabIndex={0} role="region" aria-label="模运算表，可横向滚动">
            <table className="matrix-table ch11-mod-table">
              <caption>模 {modulus} {operationName}表；当前选择第 {a} 行、第 {b} 列</caption>
              <thead>
                <tr>
                  <th scope="col">{visibleSymbol}</th>
                  {table.map((_, column) => <th scope="col" key={column}>{column}</th>)}
                </tr>
              </thead>
              <tbody>
                {table.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <th scope="row">{rowIndex}</th>
                    {row.map((value, columnIndex) => {
                      const selected = rowIndex === a && columnIndex === b;
                      return (
                        <td key={columnIndex}>
                          <button
                            type="button"
                            className={selected ? 'on ch11-selected-cell' : ''}
                            aria-pressed={selected}
                            aria-label={`${rowIndex} ${visibleSymbol} ${columnIndex} 模 ${modulus} 等于 ${value}`}
                            onClick={() => { setA(rowIndex); setB(columnIndex); setStep(1); }}
                          >{value}</button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small muted">表头固定为剩余类代表元；当前单元格以边框和“已选”状态标出。</p>
        </section>
        <StepPlayer steps={steps} current={step} onChange={setStep} label="模运算环域判定分步讲解" />
      </div>

      <div className="lab-column">
        <section className="control-panel" aria-labelledby="ch11-ring-controls">
          <div className="panel-heading"><h3 id="ch11-ring-controls">实验设置</h3><small>m = 2…7</small></div>
          <label className="control-label" htmlFor="ch11-modulus">模数 m</label>
          <div className="ch11-range-row">
            <input
              id="ch11-modulus"
              className="range-input"
              type="range"
              min="2"
              max="7"
              step="1"
              value={modulus}
              aria-valuetext={`模数 ${modulus}`}
              onChange={(event) => changeModulus(Number(event.target.value))}
            />
            <output htmlFor="ch11-modulus" aria-live="polite">{modulus}</output>
          </div>
          <div className="control-row">
            <span className="control-label">运算表</span>
            <div className="segmented" role="group" aria-label="选择模运算表">
              <button type="button" className={operation === 'addition' ? 'active' : ''} aria-pressed={operation === 'addition'} onClick={() => { setOperation('addition'); setStep(1); }}>加法表</button>
              <button type="button" className={operation === 'multiplication' ? 'active' : ''} aria-pressed={operation === 'multiplication'} onClick={() => { setOperation('multiplication'); setStep(1); }}>乘法表</button>
            </div>
          </div>
          <div className="readout-grid">
            <div className="readout-item"><span>含幺交换环</span><strong>是</strong></div>
            <div className="readout-item"><span>整环</span><strong>{analysis.isIntegralDomain ? '是' : '否'}</strong></div>
            <div className="readout-item"><span>域</span><strong>{analysis.isField ? '是' : '否'}</strong></div>
            <div className="readout-item"><span>乘法可逆元集合</span><strong>{analysis.units.join('、')}</strong></div>
          </div>
        </section>

        <section className="math-panel" aria-labelledby="ch11-ring-result">
          <div className="panel-heading"><h3 id="ch11-ring-result">判定依据</h3><small>{analysis.isPrime ? 'm 为素数' : 'm 为合数'}</small></div>
          <div className="math-readout" aria-live="polite">
            <Formula tex={`${a}${symbol}${b}=${rawResult}\\equiv${result}\\pmod{${modulus}}`} />
          </div>
          {witness ? (
            <div className="callout warning ch11-ring-callout">
              <strong>零因子反例：{witness.a} 与 {witness.b}</strong>
              <Formula tex={`${witness.a}\\cdot${witness.b}=${witness.a * witness.b}\\equiv0\\pmod{${modulus}}`} />
              <span>两个因子都非零，因此 Z<sub>{modulus}</sub> 不是整环；不是整环就不是域。</span>
            </div>
          ) : (
            <div className="callout ch11-ring-callout">
              <strong>无零因子，全部非零元可逆</strong>
              <p>零因子列表为空；乘法可逆元集合恰好是 {'{'}1，…，{modulus - 1}{'}'}，所以 Z<sub>{modulus}</sub> 是域。</p>
            </div>
          )}
          {!analysis.isField && <p className="small muted">零因子：{analysis.zeroDivisors.join('、')}。0 不列入零因子。</p>}
        </section>
      </div>
    </div>
  );
}

function LatticeExperiment() {
  const [kind, setKind] = useState<LatticeKind>('divisor');
  const [a, setA] = useState(2);
  const [b, setB] = useState(3);
  const [pickTarget, setPickTarget] = useState<'a' | 'b'>('a');
  const [step, setStep] = useState(0);
  const model = useMemo(() => kind === 'divisor' ? buildDivisorLattice(12) : buildSubsetLattice(), [kind]);
  const bounds = useMemo(() => latticeBounds(model, a, b), [model, a, b]);
  const maxRank = Math.max(...Object.values(model.ranks));
  const positions = new Map(model.elements.map((element) => {
    const rank = model.ranks[element];
    const peers = model.elements.filter((candidate) => model.ranks[candidate] === rank);
    const index = peers.indexOf(element);
    return [element, {
      x: ((index + 1) / (peers.length + 1)) * 600,
      y: maxRank === 0 ? 235 : 400 - (rank / maxRank) * 330,
    }] as const;
  }));
  const texLabel = (element: number) => {
    if (kind === 'divisor') return String(element);
    const label = model.labels[element];
    return label === '∅' ? '\\varnothing' : `\\{${label.slice(1, -1)}\\}`;
  };
  const texSet = (elements: number[]) => {
    if (elements.length === 0) return '\\varnothing';
    const labels = elements.map(texLabel);
    return labels.length > 4
      ? `\\left\\{\\begin{gathered}${labels.slice(0, 4).join(',')},\\\\${labels.slice(4).join(',')}\\end{gathered}\\right\\}`
      : `\\{${labels.join(',')}\\}`;
  };
  const join = bounds.join ?? a;
  const meet = bounds.meet ?? a;
  const upperText = bounds.upperBounds.map((element) => model.labels[element]).join('、');
  const lowerText = bounds.lowerBounds.map((element) => model.labels[element]).join('、');
  const joinFormula = kind === 'divisor'
    ? `${a}\\vee${b}=\\operatorname{lcm}(${a},${b})=${join}`
    : `${texLabel(a)}\\vee${texLabel(b)}=${texLabel(a)}\\cup${texLabel(b)}=${texLabel(join)}`;
  const meetFormula = kind === 'divisor'
    ? `${a}\\wedge${b}=\\gcd(${a},${b})=${meet}`
    : `${texLabel(a)}\\wedge${texLabel(b)}=${texLabel(a)}\\cap${texLabel(b)}=${texLabel(meet)}`;
  const stepCalculation = (tex: string) => kind === 'subset' && model.labels[a].length + model.labels[b].length > 10
    ? tex.replace('=', '\\\\&=')
    : tex;

  const changeKind = (next: LatticeKind) => {
    setKind(next);
    setA(next === 'divisor' ? 2 : 1);
    setB(next === 'divisor' ? 3 : 6);
    setPickTarget('a');
    setStep(0);
  };
  const chooseNode = (element: number) => {
    if (pickTarget === 'a') {
      setA(element);
      setPickTarget('b');
    } else {
      setB(element);
      setPickTarget('a');
    }
    setStep(0);
  };
  const nodeKeyDown = (event: KeyboardEvent<SVGGElement>, element: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      chooseNode(element);
    }
  };

  const steps: TeachingStep[] = [
    {
      label: '读取偏序',
      title: '沿哈斯图向上读覆盖关系',
      explanation: kind === 'divisor'
        ? `D_12 中，x ≤ y 表示 x 整除 y。连线只画覆盖关系，不重复画由传递性得到的边；当前甲为 ${a}，乙为 ${b}。`
        : `P({a,b,c}) 中，X ≤ Y 表示 X 是 Y 的子集。越向上包含的元素越多；当前甲为 ${model.labels[a]}，乙为 ${model.labels[b]}。`,
      formula: kind === 'divisor' ? 'x\\preccurlyeq y\\Longleftrightarrow x\\mid y' : 'X\\preccurlyeq Y\\Longleftrightarrow X\\subseteq Y',
    },
    {
      label: '收集上界',
      title: '先列出所有共同上界',
      explanation: `一个元素同时位于甲、乙的上方，就是共同上界。逐项检查整个格，得到上界集：${upperText}。`,
      formula: `U=${texSet(bounds.upperBounds)}`,
    },
    {
      label: '最小上界',
      title: `join 是 ${model.labels[join]}`,
      explanation: `在上界集中，${model.labels[join]} 小于或等于其他每一个上界，所以它是唯一最小上界，也就是甲、乙的 join。`,
      formula: `\\begin{aligned}&${stepCalculation(joinFormula)}\\end{aligned}`,
    },
    {
      label: '收集下界',
      title: '再列出所有共同下界',
      explanation: `一个元素同时小于或等于甲、乙，就是共同下界。逐项检查得到下界集：${lowerText}。`,
      formula: `L=${texSet(bounds.lowerBounds)}`,
    },
    {
      label: '最大下界',
      title: `meet 是 ${model.labels[meet]}`,
      explanation: `${model.labels[meet]} 大于或等于下界集中的其他每个元素，因此是唯一最大下界。最后核对：meet ≤ 甲、乙 ≤ join。`,
      formula: `\\begin{aligned}&${stepCalculation(meetFormula)}\\\\&${texLabel(meet)}\\preccurlyeq${texLabel(a)}\\preccurlyeq${texLabel(join)}\\\\&${texLabel(meet)}\\preccurlyeq${texLabel(b)}\\preccurlyeq${texLabel(join)}\\end{aligned}`,
    },
  ];

  return (
    <div className="lab-workspace ch11-workspace ch11-lattice-workspace">
      <div className="lab-column">
        <section className="visualization-panel" aria-labelledby="ch11-hasse-title">
          <div className="panel-heading">
            <h3 id="ch11-hasse-title">{kind === 'divisor' ? 'D₁₂ 因数格' : 'P({a,b,c}) 子集格'}哈斯图</h3>
            <small>向上表示更大</small>
          </div>
          <div className="ch11-lattice-overview" aria-label="当前所选元素与上下确界">
            <span className="is-a"><small>元素甲</small><strong>{model.labels[a]}</strong></span>
            <span className="is-b"><small>元素乙</small><strong>{model.labels[b]}</strong></span>
            <span className="is-join"><small>上确界 join</small><strong>{model.labels[join]}</strong></span>
            <span className="is-meet"><small>下确界 meet</small><strong>{model.labels[meet]}</strong></span>
          </div>
          <div className="ch11-hasse-scroll diagram-stage" tabIndex={0} role="region" aria-label="可交互哈斯图，可横向滚动；Tab 进入节点选择">
          <svg className="svg-lab ch11-hasse" data-kind={kind} viewBox={kind === 'divisor' ? '100 20 400 430' : '90 20 420 430'} role="group" aria-labelledby="ch11-hasse-svg-title ch11-hasse-svg-desc">
            <title id="ch11-hasse-svg-title">可选择两个元素的哈斯图</title>
            <desc id="ch11-hasse-svg-desc">Tab 聚焦节点，Enter 或空格选择。甲用圆形外框，乙用方形外框；上确界用绿色菱形、下确界用橙色折角标记，具体值在上方状态条显示。连线交叉处不代表额外元素。</desc>
            <g aria-hidden="true">
              {model.covers.map(([lower, upper]) => {
                const start = positions.get(lower)!;
                const end = positions.get(upper)!;
                return <g key={`${lower}-${upper}`} className="ch11-hasse-cover" data-cover={`${lower}-${upper}`}>
                  <line className="ch11-hasse-edge-halo" x1={start.x} y1={start.y} x2={end.x} y2={end.y} />
                  <line className="ch11-hasse-edge" x1={start.x} y1={start.y} x2={end.x} y2={end.y} />
                </g>;
              })}
            </g>
            {model.elements.map((element) => {
              const position = positions.get(element)!;
              const isA = element === a;
              const isB = element === b;
              const isJoin = element === bounds.join;
              const isMeet = element === bounds.meet;
              const resultLabel = [isJoin ? '上确界' : '', isMeet ? '下确界' : ''].filter(Boolean).join(' · ');
              return (
                <g
                  key={element}
                  className="ch11-hasse-node-button"
                  data-element={element}
                  transform={`translate(${position.x} ${position.y})`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isA || isB}
                  aria-label={`${model.labels[element]}，点击设为元素${pickTarget === 'a' ? '甲' : '乙'}${isA || isB ? `，当前${isA && isB ? '为甲和乙' : isA ? '为甲' : '为乙'}` : ''}${resultLabel ? `，${resultLabel}` : ''}`}
                  onClick={() => chooseNode(element)}
                  onKeyDown={(event) => nodeKeyDown(event, element)}
                >
                  <title>{model.labels[element]}；点击或用 Enter、空格将其设为元素{pickTarget === 'a' ? '甲' : '乙'}</title>
                  <circle className="ch11-node-halo" r="38" aria-hidden="true" />
                  {isA && <circle className="ch11-selection-ring ch11-ring-a" r="35" aria-hidden="true" />}
                  {isB && <rect className="ch11-selection-ring ch11-ring-b" x="-39" y="-39" width="78" height="78" rx="7" aria-hidden="true" />}
                  <circle className={`ch11-hasse-node${isJoin ? ' is-join' : ''}${isMeet ? ' is-meet' : ''}`} r="30" aria-hidden="true" />
                  {isMeet && <path d="M-6,-28 L0,-35 L6,-28" className="ch11-meet-mark" aria-hidden="true" />}
                  {isJoin && <path d="M0,25 L6,31 L0,37 L-6,31 Z" className="ch11-join-mark" aria-hidden="true" />}
                  <text className="ch11-node-label" data-long={model.labels[element].length > 5} textAnchor="middle" y="5">{model.labels[element]}</text>
                </g>
              );
            })}
          </svg>
          </div>
          <div className="legend" aria-label="哈斯图图例">
            <span className="legend-item"><i className="ch11-legend-circle" />实线圆框：元素甲</span>
            <span className="legend-item"><i className="ch11-legend-square" />虚线方框：元素乙</span>
            <span className="legend-item"><i className="ch11-legend-diamond" />绿色菱形：上确界</span>
            <span className="legend-item"><i className="ch11-legend-triangle" />橙色折角：下确界</span>
          </div>
        </section>
        <StepPlayer steps={steps} current={step} onChange={setStep} label="格的上下确界分步求解" />
      </div>

      <div className="lab-column">
        <section className="control-panel" aria-labelledby="ch11-lattice-controls">
          <div className="panel-heading"><h3 id="ch11-lattice-controls">选择格与两个元素</h3><small>允许甲 = 乙</small></div>
          <div className="lab-tabs" role="group" aria-label="选择格的类型">
            <button type="button" className={kind === 'divisor' ? 'active' : ''} aria-pressed={kind === 'divisor'} onClick={() => changeKind('divisor')}>D₁₂ 因数格</button>
            <button type="button" className={kind === 'subset' ? 'active' : ''} aria-pressed={kind === 'subset'} onClick={() => changeKind('subset')}>三元素子集格</button>
          </div>
          <div className="ch11-element-fields">
            <div className="ch11-field">
            <label htmlFor="ch11-lattice-a">元素甲</label>
            <select id="ch11-lattice-a" className="ch11-lattice-select" value={a} onChange={(event) => { setA(Number(event.target.value)); setStep(0); }}>
              {model.elements.map((element) => <option value={element} key={element}>{model.labels[element]}</option>)}
            </select>
            </div>
            <div className="ch11-field">
            <label htmlFor="ch11-lattice-b">元素乙</label>
            <select id="ch11-lattice-b" className="ch11-lattice-select" value={b} onChange={(event) => { setB(Number(event.target.value)); setStep(0); }}>
              {model.elements.map((element) => <option value={element} key={element}>{model.labels[element]}</option>)}
            </select>
            </div>
          </div>
          <div className="control-row">
            <span className="control-label">点击节点时设置</span>
            <div className="segmented" role="group" aria-label="选择节点点击目标">
              <button type="button" className={pickTarget === 'a' ? 'active' : ''} aria-pressed={pickTarget === 'a'} onClick={() => setPickTarget('a')}>元素甲</button>
              <button type="button" className={pickTarget === 'b' ? 'active' : ''} aria-pressed={pickTarget === 'b'} onClick={() => setPickTarget('b')}>元素乙</button>
            </div>
          </div>
          <p className="small muted">也可直接用两个下拉框选择；节点支持 Tab、Enter 和空格。</p>
        </section>

        <section className="math-panel" aria-labelledby="ch11-lattice-result">
          <div className="panel-heading"><h3 id="ch11-lattice-result">共同界与确界</h3><small>全集逐项计算</small></div>
          <div className="readout-grid ch11-bounds-grid" aria-live="polite">
            <div className="readout-item"><span>全部上界 U</span><strong>{upperText}</strong></div>
            <div className="readout-item"><span>最小上界 join</span><strong>{model.labels[join]}</strong></div>
            <div className="readout-item"><span>全部下界 L</span><strong>{lowerText}</strong></div>
            <div className="readout-item"><span>最大下界 meet</span><strong>{model.labels[meet]}</strong></div>
          </div>
          <div className="math-readout ch11-lattice-formula">
            <Formula tex={joinFormula} />
            <Formula tex={meetFormula} />
          </div>
          <p className="callout">join 不是“任选一个上界”，而是上界集中唯一的最小元；meet 则是下界集中唯一的最大元。</p>
        </section>
      </div>
    </div>
  );
}

function BooleanExperiment() {
  const [a, setA] = useState<Bit>(1);
  const [b, setB] = useState<Bit>(0);
  const [operation, setOperation] = useState<BooleanOperation>('and');
  const [law, setLaw] = useState<BooleanLaw>('demorgan');
  const [step, setStep] = useState(0);
  const rows = booleanTruthTable(operation);
  const result = evaluateBoolean(operation, a, b);
  const deMorgan = checkDeMorgan(a, b);
  const dual = checkDualIdentities(a);
  const complement = checkComplement(a);
  const operationSymbol = operation === 'and' ? '\\land' : operation === 'or' ? '\\lor' : '\\neg';
  const operationName = operation === 'and' ? 'AND（与）' : operation === 'or' ? 'OR（或）' : 'NOT（非）';
  const mainFormula = operation === 'not'
    ? `\\neg A=\\neg${a}=${result}`
    : `A ${operationSymbol} B=${a} ${operationSymbol} ${b}=${result}`;
  const operationExplanation = operation === 'and'
    ? 'AND 仅在两个输入都为 1 时输出 1；其余三种输入都输出 0。'
    : operation === 'or'
      ? 'OR 只要至少一个输入为 1 就输出 1；只有两个输入都为 0 时才输出 0。'
      : 'NOT 是一元运算，只反转 A：0 变为 1，1 变为 0；此时主运算不使用 B。';
  const lawFormula = law === 'demorgan'
    ? '\\neg(A\\land B)=\\neg A\\lor\\neg B,\\qquad \\neg(A\\lor B)=\\neg A\\land\\neg B'
    : law === 'dual'
      ? 'A\\lor0=A\\ \\xleftrightarrow{\\text{对偶}}\\ A\\land1=A'
      : 'A\\lor\\neg A=1,\\qquad A\\land\\neg A=0';
  const currentLawFormula = law === 'demorgan'
    ? `\\neg(${a}\\land${b})=${deMorgan.andLeft}=\\neg${a}\\lor\\neg${b},\\quad \\neg(${a}\\lor${b})=${deMorgan.orLeft}=\\neg${a}\\land\\neg${b}`
    : law === 'dual'
      ? `${a}\\lor0=${dual.orZero},\\qquad ${a}\\land1=${dual.andOne}`
      : `${a}\\lor\\neg${a}=${complement.join},\\qquad ${a}\\land\\neg${a}=${complement.meet}`;

  const toggleA = () => { setA((current) => current === 1 ? 0 : 1); setStep(0); };
  const toggleB = () => { setB((current) => current === 1 ? 0 : 1); setStep(0); };
  const lawSteps: TeachingStep[] = law === 'demorgan' ? [
    {
      label: '写出定律',
      title: '否定复合命题时，运算要互换',
      explanation: '德摩根律有两条：否定的 AND 变为补元的 OR；否定的 OR 变为补元的 AND。左右两边结构不同，但输出必须相同。',
      formula: lawFormula,
    },
    {
      label: '代入输入',
      title: `使用 A = ${a}，B = ${b}`,
      explanation: `把当前输入逐一代入两条等式。先算括号内的 AND 或 OR，再取非；右侧则先分别求 ¬A 与 ¬B。`,
      formula: `A=${a},\\quad B=${b},\\quad\\neg A=${complement.notA},\\quad\\neg B=${evaluateBoolean('not', b)}`,
    },
    {
      label: '计算两侧',
      title: '两种德摩根变形同时核对',
      explanation: `第一条左右两侧都等于 ${deMorgan.andLeft}；第二条左右两侧都等于 ${deMorgan.orLeft}。当前输入下没有出现反例。`,
      formula: currentLawFormula,
    },
    {
      label: '全表结论',
      title: '代入验证与真值表证明的区别',
      explanation: '当前代入只是一次验证。再遍历 A、B 的四种组合，可确认两条等式左右列逐项相同，这才构成二变量真值表证明。',
      formula: lawFormula,
    },
  ] : law === 'dual' ? [
    {
      label: '对偶替换',
      title: '同时交换 OR 与 AND、0 与 1',
      explanation: '构造对偶命题时，两组替换必须同时进行；变量 A 保持不变。这里用单位元律展示对偶原理。',
      formula: '\\lor\\longleftrightarrow\\land,\\qquad0\\longleftrightarrow1',
    },
    {
      label: '写出对偶式',
      title: 'A OR 0 = A 的对偶是 A AND 1 = A',
      explanation: '左边说明 0 是 OR 的单位元，右边说明 1 是 AND 的单位元；它们互为对偶。',
      formula: lawFormula,
    },
    {
      label: '代入验证',
      title: `代入 A = ${a}`,
      explanation: `A OR 0 的结果为 ${dual.orZero}，A AND 1 的结果为 ${dual.andOne}，二者都等于 A = ${a}。`,
      formula: currentLawFormula,
    },
    {
      label: '对偶结论',
      title: '两条单位元律同时成立',
      explanation: 'A 只有 0、1 两种取值，切换输入即可完成穷举。对偶原理保证布尔代数中每个定理的对偶形式也成立。',
      formula: 'A\\in\\{0,1\\}:\\quad A\\lor0=A\\land1=A',
    },
  ] : [
    {
      label: '求补元',
      title: `先计算 NOT A = ${complement.notA}`,
      explanation: `补元验证只使用 A 与 ¬A。当前 A = ${a}，所以它的补元 ¬A = ${complement.notA}。`,
      formula: `\\neg A=\\neg${a}=${complement.notA}`,
    },
    {
      label: '验证 OR',
      title: 'A 与补元的 OR 必须等于 1',
      explanation: `把 A 和 ¬A 代入 OR，当前结果为 ${complement.join}，达到布尔代数的最大元 1。`,
      formula: `${a}\\lor\\neg${a}=${complement.join}=1`,
    },
    {
      label: '验证 AND',
      title: 'A 与补元的 AND 必须等于 0',
      explanation: `再把 A 和 ¬A 代入 AND，当前结果为 ${complement.meet}，达到布尔代数的最小元 0。`,
      formula: `${a}\\land\\neg${a}=${complement.meet}=0`,
    },
    {
      label: '补元结论',
      title: '两个互补律必须同时成立',
      explanation: '只检查其中一条不够。将 A 切换为另一个值，仍会同时得到 OR = 1、AND = 0，因此补元定义得到完整验证。',
      formula: lawFormula,
    },
  ];

  return (
    <div className="lab-workspace ch11-workspace ch11-boolean-workspace">
      <div className="lab-column">
        <section className="visualization-panel" aria-labelledby="ch11-boolean-table-title">
          <div className="panel-heading"><h3 id="ch11-boolean-table-title">{operationName} 真值面板</h3><small>当前行同步标记</small></div>
          <div className="ch11-table-scroll" tabIndex={0} role="region" aria-label="布尔运算真值表，可横向滚动">
            <table className="truth-table ch11-truth-table">
              <caption>{operationName} 的全部输入组合与输出；当前输入行以“当前输入”文字标出</caption>
              <thead><tr><th scope="col">A</th>{operation !== 'not' && <th scope="col">B</th>}<th scope="col">输出</th><th scope="col">状态</th></tr></thead>
              <tbody>
                {rows.map((row) => {
                  const current = row.a === a && (operation === 'not' || row.b === b);
                  return (
                    <tr key={`${row.a}-${row.b ?? 'x'}`} className={current ? 'ch11-current-truth' : ''} aria-current={current ? true : undefined}>
                      <td>{row.a}</td>
                      {operation !== 'not' && <td>{row.b}</td>}
                      <td><strong>{row.result}</strong></td>
                      <td>{current ? '← 当前输入' : ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="callout">{operationExplanation}</p>
        </section>
        <StepPlayer steps={lawSteps.map((item) => ({ ...item, formula: item.formula ? stackedLaw(item.formula) : undefined }))} current={step} onChange={setStep} label="布尔代数定律分步验证" />
      </div>

      <div className="lab-column">
        <section className="control-panel" aria-labelledby="ch11-boolean-controls">
          <div className="panel-heading"><h3 id="ch11-boolean-controls">输入与逻辑运算</h3><small>0 = 假，1 = 真</small></div>
          <div className="ch11-bit-controls">
            <button type="button" role="switch" aria-checked={a === 1} className={`ch11-bit-button${a === 1 ? ' is-one' : ''}`} onClick={toggleA}>输入 A：{a}（{a === 1 ? '真' : '假'}）</button>
            <button type="button" role="switch" aria-checked={b === 1} className={`ch11-bit-button${b === 1 ? ' is-one' : ''}`} onClick={toggleB}>输入 B：{b}（{b === 1 ? '真' : '假'}）</button>
          </div>
          <div className="control-row">
            <span className="control-label">主运算</span>
            <div className="segmented" role="group" aria-label="选择布尔主运算">
              {(['and', 'or', 'not'] as BooleanOperation[]).map((item) => (
                <button type="button" key={item} className={operation === item ? 'active' : ''} aria-pressed={operation === item} onClick={() => setOperation(item)}>
                  {item === 'and' ? 'AND（与）' : item === 'or' ? 'OR（或）' : 'NOT（非 A）'}
                </button>
              ))}
            </div>
          </div>
          <div className="math-readout" aria-live="polite"><Formula tex={mainFormula} /></div>
          <p className="small muted">切换 A、B 时，上方当前真值行、公式结果和下方定律验证会同时更新。</p>
        </section>

        <section className="math-panel" aria-labelledby="ch11-law-title">
          <div className="panel-heading"><h3 id="ch11-law-title">布尔定律验证</h3><small>公式与当前输入同步</small></div>
          <div className="lab-tabs ch11-law-tabs" role="group" aria-label="选择要验证的布尔定律">
            <button type="button" className={law === 'demorgan' ? 'active' : ''} aria-pressed={law === 'demorgan'} onClick={() => { setLaw('demorgan'); setStep(0); }}>德摩根律</button>
            <button type="button" className={law === 'dual' ? 'active' : ''} aria-pressed={law === 'dual'} onClick={() => { setLaw('dual'); setStep(0); }}>对偶原理</button>
            <button type="button" className={law === 'complement' ? 'active' : ''} aria-pressed={law === 'complement'} onClick={() => { setLaw('complement'); setStep(0); }}>补元验证</button>
          </div>
          <Formula tex={stackedLaw(lawFormula)} className="ch11-law-formula" />
          <div className="ch11-current-law" aria-live="polite">
            <span className="eyebrow">当前代入</span>
            <Formula tex={stackedLaw(currentLawFormula)} />
          </div>
          <p className="callout">{law === 'demorgan'
            ? `两条等式均成立：AND 形式两侧为 ${deMorgan.andLeft}，OR 形式两侧为 ${deMorgan.orLeft}。`
            : law === 'dual'
              ? `对偶两式均回到 A = ${a}：OR 单位元结果 ${dual.orZero}，AND 单位元结果 ${dual.andOne}。`
              : `互补律成立：OR 结果为 ${complement.join}，AND 结果为 ${complement.meet}；请再切换 A 验证另一种取值。`}</p>
        </section>
      </div>
    </div>
  );
}

export default function Chapter11Lab({ onComplete }: LabProps) {
  const [mode, setMode] = useState<LabMode>('ring');
  const [visited, setVisited] = useState<LabMode[]>(['ring']);
  const [finished, setFinished] = useState(false);
  const changeMode = (next: LabMode) => {
    setMode(next);
    setVisited((current) => current.includes(next) ? current : [...current, next]);
  };

  return (
    <div className="ch11-lab">
      <div className="lab-tabs ch11-mode-tabs" role="group" aria-label="第11章实验模式">
        {(Object.keys(modeNames) as LabMode[]).map((item, index) => (
          <button type="button" key={item} className={mode === item ? 'active' : ''} aria-pressed={mode === item} onClick={() => changeMode(item)}>
            {index + 1}. {modeNames[item]}
          </button>
        ))}
      </div>
      <p className="small muted ch11-mode-intro">三种结构依次连接：先用两种运算识别环与域，再用偏序求上下确界，最后在布尔代数中验证逻辑定律。</p>

      {mode === 'ring' && <RingExperiment />}
      {mode === 'lattice' && <LatticeExperiment />}
      {mode === 'boolean' && <BooleanExperiment />}

      <section className="control-panel ch11-completion" aria-label="完成第11章实验">
        <div>
          <strong>实验进度：已打开 {visited.length} / 3 个模式</strong>
          <p>建议核对一个非素数模数、求解一组 join/meet，并切换输入验证布尔定律。</p>
        </div>
        <button
          type="button"
          className="completion-button"
          disabled={finished}
          onClick={() => { setFinished(true); onComplete(); }}
        >{finished ? '本章实验已完成' : '完成本章实验'}</button>
      </section>
    </div>
  );
}
