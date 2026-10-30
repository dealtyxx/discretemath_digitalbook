import { useMemo, useState } from 'react';
import { Formula } from '../components/Formula';
import type { LabProps } from '../types';
import {
  analyzeModularSystem,
  checkMod2HomomorphismExhaustively,
  checkMod2HomomorphismPair,
  type ExhaustiveProperty,
  type HomomorphismExhaustiveCheck,
  type ModularOperation,
} from '../lib/ch09';
import './Chapter09Lab.css';

const operationNames: Record<ModularOperation, string> = {
  add: '模 n 加法',
  multiply: '模 n 乘法',
};

const operationSymbols: Record<ModularOperation, string> = {
  add: '+',
  multiply: '×',
};

function propertyEvidence(name: string, property: ExhaustiveProperty, symbol: string): string {
  if (property.holds) {
    return `成立：已穷举 ${property.checked}/${property.total} 项，所有等式或归属判断均通过。`;
  }
  const counterexample = property.counterexample;
  if (!counterexample) return `不成立：已检查 ${property.checked}/${property.total} 项。`;
  const [a, b, c] = counterexample.values;
  if (name === '结合律') {
    return `反例：a=${a}、b=${b}、c=${c} 时，(a${symbol}b)${symbol}c=${counterexample.left}，而 a${symbol}(b${symbol}c)=${counterexample.right}。`;
  }
  if (name === '交换律') {
    return `反例：${a}${symbol}${b}=${counterexample.left}，但 ${b}${symbol}${a}=${counterexample.right}。`;
  }
  return `反例：a=${a}、b=${b} 的结果为 ${counterexample.left}，不在当前集合中。`;
}

export default function Chapter09Lab({ onComplete }: LabProps) {
  const [modulus, setModulus] = useState(4);
  const [operation, setOperation] = useState<ModularOperation>('add');
  const [selected, setSelected] = useState<[number, number]>([1, 1]);
  const [homA, setHomA] = useState(3);
  const [homB, setHomB] = useState(2);
  const [homOperation, setHomOperation] = useState<ModularOperation>('add');
  const [homExhaustive, setHomExhaustive] = useState<HomomorphismExhaustiveCheck | null>(null);
  const [hasExplored, setHasExplored] = useState(false);

  const analysis = useMemo(() => analyzeModularSystem(modulus, operation), [modulus, operation]);
  const [a, b] = selected;
  const selectedResult = analysis.table[a][b];
  const symbol = operationSymbols[operation];
  const homPair = useMemo(
    () => checkMod2HomomorphismPair(homA, homB, homOperation),
    [homA, homB, homOperation],
  );
  const currentHomExhaustive = homExhaustive?.operation === homOperation ? homExhaustive : null;
  const nonInvertible = analysis.inverses.filter((item) => item.inverses.length === 0);
  const firstNonInvertible = nonInvertible[0];

  const chooseModulus = (next: number) => {
    setModulus(next);
    setSelected(([oldA, oldB]) => [Math.min(oldA, next - 1), Math.min(oldB, next - 1)]);
    setHasExplored(true);
  };

  const chooseOperation = (next: ModularOperation) => {
    setOperation(next);
    setHasExplored(true);
  };

  const inverseSummary = analysis.allInvertible || !firstNonInvertible
    ? `成立：${modulus} 个元素都有双侧逆元；每个逆元都由运算表逐一枚举确认。`
    : `并非每个元素都可逆。反例：a=${firstNonInvertible.element}，其所在行与列均未出现单位元 ${analysis.identity}，所以不存在 b 使 a${symbol}b=b${symbol}a=${analysis.identity}。`;

  return (
    <div className="chapter09-lab">
      <div className="lab-workspace ch09-workspace">
        <div className="lab-column">
          <section className="visualization-panel ch09-table-panel" aria-labelledby="ch09-table-title">
            <div className="panel-heading">
              <h3 id="ch09-table-title">Z<sub>{modulus}</sub> 运算表</h3>
              <small>点击单元格，读取一项具体计算</small>
            </div>
            <div className="ch09-table-scroll" tabIndex={0} role="region" aria-label="模运算表，可横向滚动">
              <table className="matrix-table ch09-operation-table">
                <caption>模 {modulus} {operation === 'add' ? '加法' : '乘法'}运算表，行是左操作数，列是右操作数</caption>
                <thead>
                  <tr>
                    <th scope="col" aria-label="运算符号">{symbol}<sub>{modulus}</sub></th>
                    {analysis.table.map((_, column) => (
                      <th scope="col" key={column} className={column === b ? 'ch09-selected-head' : ''}>
                        {column === b ? '▾ ' : ''}{column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analysis.table.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <th scope="row" className={rowIndex === a ? 'ch09-selected-head' : ''}>
                        {rowIndex === a ? '▸ ' : ''}{rowIndex}
                      </th>
                      {row.map((value, column) => {
                        const active = rowIndex === a && column === b;
                        return (
                          <td key={column} className={active ? 'on' : ''}>
                            <button
                              type="button"
                              className={active ? 'ch09-active-cell' : ''}
                              aria-pressed={active}
                              aria-label={`${rowIndex} ${symbol} ${column} 等于 ${value}，模 ${modulus}`}
                              onClick={() => {
                                setSelected([rowIndex, column]);
                                setHasExplored(true);
                              }}
                            >
                              {active ? '● ' : ''}{value}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="math-readout ch09-cell-readout" aria-live="polite">
              <Formula
                tex={operation === 'add'
                  ? `(${a}+${b})\\bmod ${modulus}=${selectedResult}`
                  : `(${a}\\cdot ${b})\\bmod ${modulus}=${selectedResult}`}
              />
              <span>当前项：{a} {symbol} {b} = {selectedResult}（模 {modulus}）</span>
            </div>
          </section>

          <section className="data-panel ch09-inverse-panel" aria-labelledby="ch09-inverse-title">
            <div className="panel-heading">
              <h3 id="ch09-inverse-title">逐元素逆元证据</h3>
              <small>单位元 e = {analysis.identity ?? '不存在'}</small>
            </div>
            <div className="ch09-table-scroll" tabIndex={0} role="region" aria-label="逐元素逆元证据表，可横向滚动">
              <table className="data-table ch09-inverse-table">
                <thead>
                  <tr><th scope="col">元素 a</th><th scope="col">双侧逆元 b</th><th scope="col">代入或排除证据</th></tr>
                </thead>
                <tbody>
                  {analysis.inverses.map((item) => (
                    <tr key={item.element}>
                      <td>{item.element}</td>
                      <td>{item.inverses.length > 0 ? item.inverses.join('、') : '无'}</td>
                      <td>
                        {item.inverses.length > 0
                          ? `${item.element}${symbol}${item.inverses[0]}=${item.inverses[0]}${symbol}${item.element}=${analysis.identity}`
                          : `b=0,…,${modulus - 1} 均不满足两侧等于 ${analysis.identity}${operation === 'multiply' ? `；gcd(${item.element},${modulus})=${item.divisor}` : ''}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="lab-column">
          <section className="control-panel ch09-controls-panel" aria-labelledby="ch09-controls-title">
            <div className="panel-heading">
              <h3 id="ch09-controls-title">实验设置</h3>
              <small>全集 Z<sub>n</sub> = {'{'}0,…,n−1{'}'}</small>
            </div>
            <div className="control-row">
              <label htmlFor="ch09-modulus">选择模数 n</label>
              <select id="ch09-modulus" value={modulus} onChange={(event) => chooseModulus(Number(event.target.value))}>
                {Array.from({ length: 7 }, (_, index) => index + 2).map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>
            <span className="control-label" id="ch09-operation-label">选择运算</span>
            <div className="segmented" role="group" aria-labelledby="ch09-operation-label">
              {(['add', 'multiply'] as const).map((item) => (
                <button
                  type="button"
                  key={item}
                  className={operation === item ? 'active' : ''}
                  aria-pressed={operation === item}
                  onClick={() => chooseOperation(item)}
                >
                  {operationNames[item]}
                </button>
              ))}
            </div>
            <div className="readout-grid">
              <div className="readout-item"><span>元素个数</span><strong>{modulus}</strong></div>
              <div className="readout-item"><span>当前运算</span><strong>{operation === 'add' ? '+ₙ' : '×ₙ'}</strong></div>
              <div className="readout-item"><span>单位元</span><strong>{analysis.identity ?? '无'}</strong></div>
              <div className="readout-item"><span>可逆元素</span><strong>{modulus - nonInvertible.length} / {modulus}</strong></div>
            </div>
            <p className="callout">
              乘法实验保留 0 与不可逆剩余类，不把 Z<sub>n</sub> 的全体元素误称为乘法群。只有与 n 互素的剩余类在模 n 乘法下可逆。
            </p>
          </section>

          <section className="data-panel ch09-laws-panel" aria-labelledby="ch09-laws-title">
            <div className="panel-heading">
              <h3 id="ch09-laws-title">代数性质判定</h3>
              <small>对当前有限系统作完整穷举</small>
            </div>
            <ul className="status-list ch09-law-list">
              {([
                ['封闭性', analysis.closure],
                ['结合律', analysis.associativity],
                ['交换律', analysis.commutativity],
              ] as const).map(([name, property]) => (
                <li key={name} className={property.holds ? 'status-pass' : 'status-fail'}>
                  <strong>{property.holds ? '✓' : '×'} {name}</strong>
                  <span>{propertyEvidence(name, property, symbol)}</span>
                </li>
              ))}
              <li className={analysis.identity !== null ? 'status-pass' : 'status-fail'}>
                <strong>{analysis.identity !== null ? '✓' : '×'} 单位元</strong>
                <span>
                  {analysis.identity !== null
                    ? `存在：e=${analysis.identity}。已逐项检查 e${symbol}a=a 且 a${symbol}e=a（a=0,…,${modulus - 1}，共 ${2 * modulus} 个等式）。`
                    : '不存在：每个候选元素都至少在一个左单位元或右单位元等式上失败。'}
                </span>
              </li>
              <li className={analysis.allInvertible ? 'status-pass' : 'status-fail'}>
                <strong>{analysis.allInvertible ? '✓' : '×'} 每元素均有逆元</strong>
                <span>{inverseSummary}</span>
              </li>
            </ul>
          </section>
        </div>
      </div>

      <section className="math-panel ch09-homomorphism" aria-labelledby="ch09-hom-title">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">HOMOMORPHISM · 有限验证</span>
            <h3 id="ch09-hom-title">Z<sub>4</sub> → Z<sub>2</sub> 的 mod 2 同态验证</h3>
          </div>
          <small>f(x)=x mod 2</small>
        </div>
        <div className="diagram-stage ch09-mapping" aria-label="映射关系：0 映到 0，1 映到 1，2 映到 0，3 映到 1">
          {[0, 1, 2, 3].map((value) => <div className="ch09-mapping-pair" key={value} aria-label={`${value} 映到 ${value % 2}`}>
            <span className="ch09-mapping-node">{value}</span><span className="ch09-mapping-arrow" aria-hidden="true">→</span><span className="ch09-mapping-node is-image">{value % 2}</span>
          </div>)}
        </div>
        <div className="ch09-hom-grid">
          <div className="ch09-hom-controls">
            <div className="ch09-hom-pair">
              <div className="ch09-field">
              <label htmlFor="ch09-hom-a">Z₄ 中 a</label>
              <select id="ch09-hom-a" value={homA} onChange={(event) => { setHomA(Number(event.target.value)); setHasExplored(true); }}>
                {[0, 1, 2, 3].map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
              </div>
              <div className="ch09-field">
              <label htmlFor="ch09-hom-b">Z₄ 中 b</label>
              <select id="ch09-hom-b" value={homB} onChange={(event) => { setHomB(Number(event.target.value)); setHasExplored(true); }}>
                {[0, 1, 2, 3].map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
              </div>
            </div>
            <span className="control-label" id="ch09-hom-operation">验证保持哪一种运算</span>
            <div className="segmented" role="group" aria-labelledby="ch09-hom-operation">
              {(['add', 'multiply'] as const).map((item) => (
                <button
                  type="button"
                  key={item}
                  className={homOperation === item ? 'active' : ''}
                  aria-pressed={homOperation === item}
                  onClick={() => { setHomOperation(item); setHasExplored(true); }}
                >
                  {item === 'add' ? '加法' : '乘法'}
                </button>
              ))}
            </div>
          </div>
          <div className="ch09-hom-evidence" aria-live="polite">
            <strong>单项检查（仅当前 1 对）</strong>
            <Formula
              tex={homOperation === 'add'
                ? `\\begin{aligned}&f((${homA}+${homB})\\bmod 4)\\\\&\\quad=f(${homPair.sourceResult})=${homPair.left}\\\\[4pt]&(f(${homA})+f(${homB}))\\bmod 2\\\\&\\quad=(${homA % 2}+${homB % 2})\\bmod 2=${homPair.right}\\end{aligned}`
                : `\\begin{aligned}&f((${homA}\\cdot${homB})\\bmod 4)\\\\&\\quad=f(${homPair.sourceResult})=${homPair.left}\\\\[4pt]&(f(${homA})\\cdot f(${homB}))\\bmod 2\\\\&\\quad=(${homA % 2}\\cdot${homB % 2})\\bmod 2=${homPair.right}\\end{aligned}`}
            />
            <p>{homPair.holds ? '✓ 当前有序对两侧相等。' : '× 当前有序对就是同态等式的反例。'} 单项通过本身不构成同态证明。</p>
            <button
              type="button"
              className="mini-button ch09-exhaustive-button"
              onClick={() => {
                setHomExhaustive(checkMod2HomomorphismExhaustively(homOperation));
                setHasExplored(true);
              }}
            >
              穷举验证当前运算的 16 个有序对
            </button>
            {currentHomExhaustive && (
              <div className={`ch09-exhaustive-result ${currentHomExhaustive.holds ? 'status-pass' : 'status-fail'}`}>
                <strong>{currentHomExhaustive.holds ? '✓ 穷举通过' : '× 找到反例'}：{currentHomExhaustive.passed}/{currentHomExhaustive.total}</strong>
                <p>
                  已逐项检查 Z₄ 中全部 16 个有序对的{homOperation === 'add' ? '加法' : '乘法'}保持等式。
                  这验证了当前有限映射与当前运算，不把有限计算表述为对任意模数或任意映射的一般证明。
                </p>
                {!currentHomExhaustive.holds && currentHomExhaustive.counterexample && (
                  <p>反例：a={currentHomExhaustive.counterexample.a}，b={currentHomExhaustive.counterexample.b}，左侧为 {currentHomExhaustive.counterexample.left}，右侧为 {currentHomExhaustive.counterexample.right}。</p>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="ch09-completion">
          <p className="small muted">建议切换加法与乘法、比较可逆元素，再运行一次同态穷举。</p>
          <button type="button" className="completion-button" disabled={!hasExplored} onClick={onComplete}>
            完成本章实验
          </button>
        </div>
      </section>
    </div>
  );
}
