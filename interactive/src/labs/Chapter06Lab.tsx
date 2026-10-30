import { useMemo, useState } from 'react';
import { Formula } from '../components/Formula';
import type { LabProps } from '../types';
import {
  UNARY_FORMULAS,
  createInterpretation,
  domain,
  evaluateExistsForall,
  evaluateForallExists,
  evaluateUnary,
  resizeInterpretation,
  unaryFormulaTex,
  unaryFormulaText,
} from '../lib/ch06';
import type { EvidenceRole } from '../lib/ch06';
import './Chapter06Lab.css';

const roleNames: Record<EvidenceRole, string> = {
  witness: '存在见证',
  counterexample: '全称反例',
  support: '逐项通过',
  excluded: '非见证候选',
};

function TruthBadge({ value }: { value: boolean }) {
  return <span className="ch06-truth" data-value={value}>{value ? 'T 真' : 'F 假'}</span>;
}

export default function Chapter06Lab({ onComplete }: LabProps) {
  const [mode, setMode] = useState<'unary' | 'binary'>('unary');
  const [model, setModel] = useState(() => createInterpretation(2));
  const [unaryId, setUnaryId] = useState('forall-p');
  const individuals = useMemo(() => domain(model.size), [model.size]);
  const unarySpec = UNARY_FORMULAS.find((item) => item.id === unaryId) ?? UNARY_FORMULAS[0];
  const unaryResult = evaluateUnary(individuals, model.p, unarySpec);
  const unaryResults = new Map(UNARY_FORMULAS.map((spec) => [spec.id, evaluateUnary(individuals, model.p, spec)]));
  const forallP = unaryResults.get('forall-p')!;
  const existsP = unaryResults.get('exists-p')!;
  const notForallP = unaryResults.get('not-forall-p')!;
  const existsNotP = unaryResults.get('exists-not-p')!;
  const notExistsP = unaryResults.get('not-exists-p')!;
  const forallNotP = unaryResults.get('forall-not-p')!;
  const leftOrder = evaluateForallExists(individuals, model.relation);
  const rightOrder = evaluateExistsForall(individuals, model.relation);

  const toggleP = (index: number) => {
    setModel((previous) => ({
      ...previous,
      p: previous.p.map((value, itemIndex) => itemIndex === index ? !value : value),
    }));
  };

  const toggleRelation = (row: number, column: number) => {
    setModel((previous) => ({
      ...previous,
      relation: previous.relation.map((values, rowIndex) =>
        values.map((value, columnIndex) => rowIndex === row && columnIndex === column ? !value : value)),
    }));
  };

  const loadOrderCounterexample = () => setModel(createInterpretation(2));
  const clearModel = () => setModel((previous) => ({
    size: previous.size,
    p: previous.p.map(() => false),
    relation: previous.relation.map((row) => row.map(() => false)),
  }));
  const fillModel = () => setModel((previous) => ({
    size: previous.size,
    p: previous.p.map(() => true),
    relation: previous.relation.map((row) => row.map(() => true)),
  }));

  return (
    <div className="ch06-lab">
      <div className="lab-tabs ch06-mode-tabs" role="group" aria-label="选择谓词实验">
        <button type="button" className={mode === 'unary' ? 'active' : ''} aria-pressed={mode === 'unary'} onClick={() => setMode('unary')}>一元谓词与量词否定</button>
        <button type="button" className={mode === 'binary' ? 'active' : ''} aria-pressed={mode === 'binary'} onClick={() => setMode('binary')}>二元关系与量词次序</button>
      </div>
      <div className="lab-workspace ch06-evidence-workspace">
        <div className="lab-column">{mode === 'unary' ? (<section className="visualization-panel" aria-labelledby="ch06-unary-title">
                <div className="panel-heading">
                  <h3 id="ch06-unary-title">逐个体证据与反证</h3>
                  <small>非空有限论域 · 逐项可核验</small>
                </div>
                <div className="math-readout ch06-selected-formula">
                  <Formula tex={`${unaryFormulaTex(unarySpec)} = ${unaryResult.value ? '\\mathrm{T}' : '\\mathrm{F}'}`} />
                </div>
                <label className="ch06-select-label">选择要展开检查的量词公式
                  <select value={unaryId} onChange={(event) => setUnaryId(event.target.value)}>
                    {UNARY_FORMULAS.map((spec) => <option key={spec.id} value={spec.id}>{unaryFormulaText(spec)}</option>)}
                  </select>
                </label>
                {unarySpec.outerNegated && (
                  <p className="small ch06-equivalent-note">为显示见证，按量词否定律转成 <Formula tex={unaryResult.evidenceFormulaTex} display={false} /> 后逐个体检查；原式与对偶式真值相同。</p>
                )}
                <ol className="ch06-evidence-list" aria-label="每个体的证据或反证">
                  {unaryResult.evidence.map((item) => (
                    <li key={item.individual} data-role={item.role}>
                      <div className="ch06-evidence-heading">
                        <strong>x = {item.individual}</strong>
                        <span>P({item.individual}) = {item.predicateValue ? '真' : '假'}</span>
                        <span className="ch06-role-badge">{roleNames[item.role]}</span>
                      </div>
                      <p>{item.explanation}</p>
                    </li>
                  ))}
                </ol>
                <div className="callout">
                  全称命题必须每个个体都通过；存在命题只需一个见证。单个通过项不是全称命题的完整证明，单个失败项也不是存在命题的完整反证。
                </div>
              </section>) : (<section className="visualization-panel" aria-labelledby="ch06-order-title">
                <div className="panel-heading">
                  <h3 id="ch06-order-title">两种量词次序的见证结构</h3>
                  <small>每行各自找 y ≠ 固定一个 y 服务所有行</small>
                </div>
                <div className="ch06-order-grid">
                  <article className="diagram-stage ch06-order-card">
                    <Formula tex={String.raw`\forall x\,\exists y\,R(x,y)`} />
                    <div className="ch06-order-result"><span>当前公式真值</span><TruthBadge value={leftOrder.value} /></div>
                    <ol className="ch06-evidence-list">
                      {leftOrder.evidence.map((item) => (
                        <li key={item.x} data-role={item.role}>
                          <div className="ch06-evidence-heading"><strong>x = {item.x}</strong><span className="ch06-role-badge">{item.value ? `见证 y：${item.witnesses.join('、')}` : '此行反例'}</span></div>
                          <p>{item.explanation}</p>
                        </li>
                      ))}
                    </ol>
                  </article>
                  <article className="diagram-stage ch06-order-card">
                    <Formula tex={String.raw`\exists y\,\forall x\,R(x,y)`} />
                    <div className="ch06-order-result"><span>当前公式真值</span><TruthBadge value={rightOrder.value} /></div>
                    <ol className="ch06-evidence-list">
                      {rightOrder.evidence.map((item) => (
                        <li key={item.y} data-role={item.role}>
                          <div className="ch06-evidence-heading"><strong>y = {item.y}</strong><span className="ch06-role-badge">{item.value ? '整列见证' : '此列排除'}</span></div>
                          <p>{item.explanation}</p>
                        </li>
                      ))}
                    </ol>
                  </article>
                </div>
                <div className={`callout ${leftOrder.value !== rightOrder.value ? 'warning' : ''}`} aria-live="polite">
                  {leftOrder.value !== rightOrder.value
                    ? '当前有限解释给出反例：左式为真、右式为假。因此“两种混合量词次序在任意解释中都等价”这一普遍断言为假；每一行各自有见证，不代表存在同一列作为公共见证。'
                    : '当前解释中两式真值相同，但这不足以推出量词次序可交换。请继续编辑关系，或载入“单位关系反例”寻找左右不同的情况。'}
                </div>
                <p className="fallback-note">在非空论域中，右式蕴含左式：同一个 y 能服务所有 x，自然也能为每个 x 提供见证；反向蕴含不成立。有限反例足以否定“普遍等价”，两式在某一解释中相同不能推广成一般结论。</p>
              </section>)}</div>
        <div className="lab-column"><section className="control-panel" aria-labelledby="ch06-domain-title">
            <div className="panel-heading">
              <h3 id="ch06-domain-title">有限论域与预设</h3>
              <small>实验限制为 2–4 个个体</small>
            </div>
            <span className="control-label">论域 D（新增个体及关系默认为假）</span>
            <div className="segmented ch06-domain-control" role="group" aria-label="选择论域大小">
              {[2, 3, 4].map((size) => (
                <button
                  type="button"
                  key={size}
                  className={model.size === size ? 'active' : ''}
                  aria-pressed={model.size === size}
                  onClick={() => setModel((previous) => resizeInterpretation(previous, size))}
                >
                  {size} 个：{domain(size).join('、')}
                </button>
              ))}
            </div>
            <div className="ch06-preset-buttons">
              <button type="button" className="mini-button" onClick={loadOrderCounterexample}>载入单位关系反例</button>
              <button type="button" className="mini-button" onClick={clearModel}>全部设为假</button>
              <button type="button" className="mini-button" onClick={fillModel}>全部设为真</button>
            </div>
            <p className="small ch06-domain-description">当前 D = {'{'}{individuals.join(', ')}{'}'}。P 是一元谓词，R(x,y) 是论域上的二元关系；所有按钮均可用 Tab 聚焦、空格或回车切换。</p>
          </section>{mode === 'unary' ? (<section className="control-panel" aria-labelledby="ch06-p-title">
              <div className="panel-heading">
                <h3 id="ch06-p-title">编辑个体谓词 P(x)</h3>
                <small>真值与证据区同步</small>
              </div>
              <div className="ch06-predicate-buttons" role="group" aria-label="编辑每个个体的 P 真值">
                {individuals.map((individual, index) => (
                  <button
                    type="button"
                    key={individual}
                    aria-pressed={model.p[index]}
                    aria-label={`P(${individual})，当前${model.p[index] ? '真' : '假'}，点击切换`}
                    onClick={() => toggleP(index)}
                  >
                    <code>P({individual})</code><TruthBadge value={model.p[index]} />
                  </button>
                ))}
              </div>
            </section>) : (<section className="control-panel" aria-labelledby="ch06-r-title">
              <div className="panel-heading">
                <h3 id="ch06-r-title">编辑关系矩阵 R(x,y)</h3>
                <small>行是 x，列是 y；有方向，不默认对称</small>
              </div>
              <div className="ch06-matrix-scroll" tabIndex={0} role="region" aria-label="关系矩阵编辑器，可横向滚动">
                <table className="matrix-table ch06-matrix">
                  <caption>点击单元格切换 R(x,y)；T 真、F 假均直接写出</caption>
                  <thead><tr><th scope="col">x＼y</th>{individuals.map((y) => <th scope="col" key={y}>{y}</th>)}</tr></thead>
                  <tbody>
                    {individuals.map((x, row) => (
                      <tr key={x}>
                        <th scope="row">{x}</th>
                        {individuals.map((y, column) => (
                          <td key={y}>
                            <button
                              type="button"
                              className={model.relation[row][column] ? 'on' : ''}
                              aria-pressed={model.relation[row][column]}
                              aria-label={`R(${x},${y})，当前${model.relation[row][column] ? '真' : '假'}，点击切换`}
                              onClick={() => toggleRelation(row, column)}
                            >
                              {model.relation[row][column] ? 'T 真' : 'F 假'}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="fallback-note">单位关系 R(x,y)⇔x=y 时，每个 x 都有自己的 y，但没有任何一个 y 能同时服务所有 x。</p>
            </section>)}</div>
      </div>
      <section className="math-panel ch06-summary" aria-labelledby="ch06-summary-title">
            <div className="panel-heading"><h3 id="ch06-summary-title">当前解释总览</h3><small>只针对当前有限模型</small></div>
            <div className="readout-grid">
              <div className="readout-item"><span>∀xP(x)</span><strong>{forallP.value ? '真 T' : '假 F'}</strong></div>
              <div className="readout-item"><span>∃xP(x)</span><strong>{existsP.value ? '真 T' : '假 F'}</strong></div>
              <div className="readout-item"><span>∀x∃yR</span><strong>{leftOrder.value ? '真 T' : '假 F'}</strong></div>
              <div className="readout-item"><span>∃y∀xR</span><strong>{rightOrder.value ? '真 T' : '假 F'}</strong></div>
            </div>
          </section>
      <div className="ch06-law-results">{mode === 'unary' ? (<section className="data-panel" aria-labelledby="ch06-negation-title">
                <div className="panel-heading">
                  <h3 id="ch06-negation-title">量词否定对照</h3>
                  <small>否定穿过量词时，∀ 与 ∃ 互换</small>
                </div>
                <div className="readout-grid ch06-base-readouts">
                  <div className="readout-item"><span>原公式</span><Formula tex={String.raw`\forall x\,P(x)`} display={false} /><strong>{forallP.value ? '真 T' : '假 F'}</strong></div>
                  <div className="readout-item"><span>原公式</span><Formula tex={String.raw`\exists x\,P(x)`} display={false} /><strong>{existsP.value ? '真 T' : '假 F'}</strong></div>
                </div>
                <div className="ch06-negation-pairs">
                  <div className="ch06-negation-pair">
                    <div><Formula tex={String.raw`\neg\forall x\,P(x)`} display={false} /><TruthBadge value={notForallP.value} /></div>
                    <span className="ch06-equivalence-mark">⇔ 真值一致</span>
                    <div><Formula tex={String.raw`\exists x\,\neg P(x)`} display={false} /><TruthBadge value={existsNotP.value} /></div>
                  </div>
                  <div className="ch06-negation-pair">
                    <div><Formula tex={String.raw`\neg\exists x\,P(x)`} display={false} /><TruthBadge value={notExistsP.value} /></div>
                    <span className="ch06-equivalence-mark">⇔ 真值一致</span>
                    <div><Formula tex={String.raw`\forall x\,\neg P(x)`} display={false} /><TruthBadge value={forallNotP.value} /></div>
                  </div>
                </div>
                <p className="fallback-note">这里逐值核验当前解释；量词否定律本身是适用于一般非空论域的等值式，并不是由这张有限表归纳出来的。</p>
              </section>) : (<section className="math-panel" aria-labelledby="ch06-binary-negation-title">
                <div className="panel-heading">
                  <h3 id="ch06-binary-negation-title">混合量词的否定对照</h3>
                  <small>否定内移时两个量词都翻转，谓词也否定</small>
                </div>
                <div className="ch06-binary-negation">
                  <div>
                    <Formula tex={String.raw`\neg\forall x\,\exists y\,R(x,y)`} display={false} />
                    <TruthBadge value={!leftOrder.value} />
                    <span>⇔</span>
                    <Formula tex={String.raw`\exists x\,\forall y\,\neg R(x,y)`} display={false} />
                  </div>
                  <div>
                    <Formula tex={String.raw`\neg\exists y\,\forall x\,R(x,y)`} display={false} />
                    <TruthBadge value={!rightOrder.value} />
                    <span>⇔</span>
                    <Formula tex={String.raw`\forall y\,\exists x\,\neg R(x,y)`} display={false} />
                  </div>
                </div>
              </section>)}</div>
      <button type="button" className="completion-button ch06-complete" onClick={onComplete}>完成本章实验</button>
    </div>
  );
}
