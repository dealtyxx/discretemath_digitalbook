import { useEffect, useMemo, useRef, useState } from 'react';
import { Formula } from '../components/Formula';
import type { LabProps } from '../types';
import {
  FORMULA_PRESETS,
  analyzeInference,
  buildTruthTable,
  classify,
  evaluate,
  expressionKey,
  expressionTex,
  expressionText,
} from '../lib/ch05';
import type {
  Assignment,
  AtomName,
  BinaryOperator,
  ClassificationResult,
  Expression,
} from '../lib/ch05';
import './Chapter05Lab.css';

const operatorNames: Record<BinaryOperator, string> = {
  and: '合取', or: '析取', implies: '条件', iff: '等价',
};

const classificationNames: Record<ClassificationResult['kind'], string> = {
  tautology: '重言式（永真式）',
  contradiction: '矛盾式（永假式）',
  contingent: '可满足式（非重言）',
};

function TruthBadge({ value }: { value: boolean }) {
  return <span className="ch05-truth" data-value={value}>{value ? 'T 真' : 'F 假'}</span>;
}

function sameAssignment(left: Assignment, right: Assignment, variables: AtomName[]) {
  return variables.every((name) => left[name] === right[name]);
}

interface StructurePoint {
  id: number;
  depth: number;
  x: number;
  y: number;
  expression: Expression;
  children: StructurePoint[];
}

function layoutStructure(expression: Expression) {
  let nextId = 1, leaf = 0;
  const nodes: StructurePoint[] = [];
  const visit = (item: Expression, depth: number): StructurePoint => {
    const firstLeaf = leaf;
    const node: StructurePoint = {id: nextId++, depth, x: 0, y: 60 + depth * 104, expression: item, children: []};
    nodes.push(node);
    if (item.kind === 'not') node.children = [visit(item.operand, depth + 1)];
    if (item.kind === 'binary') node.children = [visit(item.left, depth + 1), visit(item.right, depth + 1)];
    if (!node.children.length) leaf++;
    node.x = 64 + (firstLeaf + leaf - 1) * 52;
    return node;
  };
  visit(expression, 0);
  const naturalWidth = 128 + (leaf - 1) * 104, width = Math.max(360, naturalWidth);
  for (const node of nodes) node.x += (width - naturalWidth) / 2;
  return {nodes, width, height: 120 + Math.max(...nodes.map((node) => node.depth)) * 104};
}

function StructureTree({ expression, assignment }: { expression: Expression; assignment: Assignment }) {
  const layout = useMemo(() => layoutStructure(expression), [expression]);
  const [zoomed, setZoomed] = useState(false);
  const scroll = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scroll.current) scroll.current.scrollLeft = (scroll.current.scrollWidth - scroll.current.clientWidth) / 2;
  }, [expression, zoomed]);
  return <>
    <div className="ch05-tree-toolbar"><span>{zoomed ? '左右滚动查看分支' : '节点编号对应下方明细'}</span><button type="button" className="mini-button" aria-pressed={zoomed} aria-controls="ch05-structure-svg" onClick={() => setZoomed((previous) => !previous)}>{zoomed ? '完整显示' : '放大图形'}</button></div>
    <div ref={scroll} className="diagram-stage ch05-tree-scroll" tabIndex={0} role="region" aria-label="命题公式结构树，窄屏可横向滚动查看分支">
      <svg id="ch05-structure-svg" className="svg-lab ch05-tree" viewBox={`0 0 ${layout.width} ${layout.height}`} style={{minWidth: zoomed ? layout.width : 0}} role="tree" aria-label="命题公式结构树">
        <title>运算符结构与当前真值</title>
        <desc>根在上方。二元运算按左、右分支读取，否定只有一个分支。圆内上方是运算或命题，下方是当前真值；编号对应子公式明细。</desc>
        {layout.nodes.flatMap((node) => node.children.map((child) => {
          const dx = child.x - node.x, dy = child.y - node.y, length = Math.hypot(dx, dy);
          return <line key={`${node.id}-${child.id}`} className="ch05-structure-edge" data-parent={node.id} data-child={child.id} x1={node.x + dx * 26 / length} y1={node.y + dy * 26 / length} x2={child.x - dx * 26 / length} y2={child.y - dy * 26 / length} />;
        }))}
        {layout.nodes.map((node) => {
          const item = node.expression, value = evaluate(item, assignment);
          const symbol = item.kind === 'atom' ? item.name : item.kind === 'not' ? '¬' : {and:'∧',or:'∨',implies:'→',iff:'↔'}[item.operator];
          const kind = item.kind === 'atom' ? '原子命题' : item.kind === 'not' ? '否定' : operatorNames[item.operator];
          return <g key={node.id} className="ch05-expression-node" data-node={node.id} data-value={value} data-root={node.id === 1} transform={`translate(${node.x} ${node.y})`} role="treeitem" aria-level={node.depth + 1} aria-label={`节点 ${node.id}，${kind} ${expressionText(item)}，当前${value ? '真' : '假'}`}>
            <title>{`${node.id}. ${expressionText(item)} = ${value ? '真 T' : '假 F'}`}</title>
            <circle className="ch05-node-halo" r="32" />
            <circle className="ch05-node-circle" r="25" />
            <text className="ch05-node-symbol" textAnchor="middle" y="-5">{symbol}</text>
            <rect className="ch05-node-truth-bg" x="-13" y="4" width="26" height="16" rx="4" />
            <text className="ch05-node-truth" textAnchor="middle" y="16">{value ? 'T' : 'F'}</text>
            <circle className="ch05-node-number-bg" cx="24" cy="-23" r="10" />
            <text className="ch05-node-number" textAnchor="middle" x="24" y="-19.5">{node.id}</text>
          </g>;
        })}
      </svg>
    </div>
    <details className="ch05-subformula-details"><summary>查看 {layout.nodes.length} 个节点的子公式与真值</summary>
      <ol>{layout.nodes.map((node) => <li key={node.id}><span className="ch05-detail-number">{node.id}</span><code>{expressionText(node.expression)}</code><TruthBadge value={evaluate(node.expression, assignment)} /></li>)}</ol>
    </details>
  </>;
}

export default function Chapter05Lab({ onComplete }: LabProps) {
  const [presetId, setPresetId] = useState(FORMULA_PRESETS[0].id);
  const [assignment, setAssignment] = useState<Assignment>({ p: true, q: true, r: true });
  const selected = FORMULA_PRESETS.find((item) => item.id === presetId) ?? FORMULA_PRESETS[0];
  const table = useMemo(() => buildTruthTable(selected.expression), [selected]);
  const classification = classify(table);
  const currentValue = evaluate(selected.expression, assignment);
  const inference = useMemo(
    () => selected.inference ? analyzeInference(selected.inference) : null,
    [selected],
  );
  const premisesHold = selected.inference?.premises.every((premise) => evaluate(premise, assignment)) ?? false;
  const conclusionValue = selected.inference ? evaluate(selected.inference.conclusion, assignment) : null;
  const currentIsCounterexample = Boolean(selected.inference && premisesHold && !conclusionValue);
  const counterexampleRows = inference?.counterexamples.map((counterexample) => {
    const row = table.rows.find((item) => sameAssignment(item.assignment, counterexample, table.variables));
    return row ? row.index + 1 : null;
  }).filter((row): row is number => row !== null) ?? [];

  return (
    <div className="ch05-lab">
      <section className="control-panel ch05-configuration" aria-labelledby="ch05-controls-title">
            <div className="panel-heading">
              <h3 id="ch05-controls-title">公式与赋值控制</h3>
              <small>教材预设，无需文本解析</small>
            </div>
            <div className="ch05-presets" role="group" aria-label="选择预设公式">
              {FORMULA_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.id}
                  className={preset.id === selected.id ? 'active' : ''}
                  aria-pressed={preset.id === selected.id}
                  onClick={() => setPresetId(preset.id)}
                >
                  <strong>{preset.title}</strong>
                  <code>{expressionText(preset.expression)}</code>
                </button>
              ))}
            </div>
            <p className="small ch05-preset-description">{selected.description}</p>
            <div className="ch05-assignment-tools">
            <span className="control-label">原子命题真值（点击切换）</span>
            <div className="control-row ch05-atom-controls">
              {table.variables.map((name) => (
                <button
                  type="button"
                  key={name}
                  className="ch05-atom-button"
                  aria-pressed={assignment[name]}
                  aria-label={`原子命题 ${name}，当前${assignment[name] ? '真' : '假'}，点击切换`}
                  onClick={() => setAssignment((previous) => ({ ...previous, [name]: !previous[name] }))}
                >
                  <code>{name}</code><TruthBadge value={assignment[name]} />
                </button>
              ))}
            </div>
            <button type="button" className="mini-button" onClick={() => setAssignment({ p: true, q: true, r: true })}>全部原子命题设为真</button>
            </div>
          </section>
      <div className="lab-workspace ch05-analysis">
        <div className="lab-column"><section className="visualization-panel" aria-labelledby="ch05-structure-title">
            <div className="panel-heading">
              <h3 id="ch05-structure-title">公式结构树 · 当前赋值同步求值</h3>
              <small>先算子公式，再算根节点</small>
            </div>
            <div className="math-readout ch05-current-formula">
              <Formula tex={`${expressionTex(selected.expression)} = ${currentValue ? '\\mathrm{T}' : '\\mathrm{F}'}`} />
            </div>
            <StructureTree key={selected.id} expression={selected.expression} assignment={assignment} />
            <p className="fallback-note">圆内上方为运算或命题，下方为 T／F；二元运算按左、右分支读取。可放大后横向滚动，完整子公式见编号明细。</p>
          </section></div>
        <div className="lab-column"><section className="math-panel" aria-labelledby="ch05-classification-title" aria-live="polite">
            <div className="panel-heading">
              <h3 id="ch05-classification-title">公式分类与当前求值</h3>
              <small>分类检查全部行，不只看当前行</small>
            </div>
            <div className="readout-grid">
              <div className="readout-item"><span>完整表分类</span><strong>{classificationNames[classification.kind]}</strong></div>
              <div className="readout-item"><span>当前赋值结果</span><strong>{currentValue ? '真 T' : '假 F'}</strong></div>
              <div className="readout-item"><span>成真赋值</span><strong>{classification.satisfying} / {table.rows.length}</strong></div>
              <div className="readout-item"><span>成假赋值</span><strong>{classification.falsifying} / {table.rows.length}</strong></div>
            </div>
            <p className="small ch05-classification-note">
              {classification.kind === 'tautology' && '所有赋值都成真；重言式也是可满足的。'}
              {classification.kind === 'contradiction' && '没有成真赋值，因此不可满足。'}
              {classification.kind === 'contingent' && '至少一行为真、至少一行为假；“可满足”不等于“重言”。'}
            </p>
          </section><section className="math-panel" aria-labelledby="ch05-inference-title">
            <div className="panel-heading">
              <h3 id="ch05-inference-title">推理有效性与结论真值分开看</h3>
              <small>反例＝前提全真且结论为假</small>
            </div>
            {selected.inference && inference ? (
              <>
                <div className="ch05-inference-schema">
                  <span>前提</span>
                  <div>{selected.inference.premises.map((premise) => <Formula key={expressionKey(premise)} tex={expressionTex(premise)} display={false} />)}</div>
                  <span>结论</span><Formula tex={expressionTex(selected.inference.conclusion)} display={false} />
                </div>
                <div className="readout-grid">
                  <div className="readout-item"><span>形式是否有效（{inference.checked} 组全查）</span><strong>{inference.valid ? '有效' : '无效'}</strong></div>
                  <div className="readout-item"><span>当前前提是否全真</span><strong>{premisesHold ? '是' : '否'}</strong></div>
                  <div className="readout-item"><span>当前结论真值</span><strong>{conclusionValue ? '真 T' : '假 F'}</strong></div>
                </div>
                <div className={`callout ${!inference.valid || currentIsCounterexample ? 'warning' : ''}`}>
                  {inference.valid && premisesHold && '当前所有前提为真，有效形式保证结论为真。这里被保证的是当前结论，而不是其他赋值下的结论。'}
                  {inference.valid && !premisesHold && `当前并非所有前提都真，所以有效性不承诺本次结论为真。当前结论为${conclusionValue ? '真' : '假'}，都不构成对有效形式的反例。`}
                  {!inference.valid && currentIsCounterexample && '当前就是反例：前提全真而结论为假，因此该推理形式无效。'}
                  {!inference.valid && !currentIsCounterexample && `完整表第 ${counterexampleRows.join('、')} 行存在“前提全真而结论为假”的反例。当前结论为真或假，都不能把无效形式变成有效形式。`}
                </div>
              </>
            ) : (
              <div className="callout">
                这是单公式求值页。条件式为真只说明当前赋值满足它；要判断推理形式是否有效，必须检查所有“前提全真”的赋值。可切换到“假言推理”或“肯定后件”对照。
              </div>
            )}
          </section></div>
      </div>
      <section className="data-panel" aria-labelledby="ch05-table-title">
            <div className="panel-heading">
              <h3 id="ch05-table-title">完整真值表</h3>
              <small>{table.rows.length} 组赋值 · {table.columns.length} 个去重子公式</small>
            </div>
            <div className="ch05-table-scroll" tabIndex={0} role="region" aria-label="完整真值表，可横向滚动">
              <table className="truth-table ch05-table">
                <caption>{selected.title}：全部原子命题赋值、子公式和最终公式真值</caption>
                <thead>
                  <tr>
                    <th scope="col">当前行</th>
                    {table.columns.map((column) => (
                      <th scope="col" key={column.key} className={column.isRoot ? 'ch05-result-column' : ''}>
                        <Formula tex={expressionTex(column.expression)} display={false} />
                        {column.isRoot && <span className="ch05-column-tag">最终</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row) => {
                    const current = sameAssignment(row.assignment, assignment, table.variables);
                    return (
                      <tr key={row.index} className={current ? 'ch05-current-row' : ''} aria-current={current ? 'true' : undefined}>
                        <td>
                          <button
                            type="button"
                            className="ch05-row-select"
                            aria-pressed={current}
                            aria-label={`选用第 ${row.index + 1} 组赋值：${table.variables.map((name) => `${name}=${row.assignment[name] ? '真' : '假'}`).join('，')}`}
                            onClick={() => setAssignment({ ...row.assignment })}
                          >
                            {current ? '当前' : '选用'}
                          </button>
                        </td>
                        {table.columns.map((column) => (
                          <td key={column.key} className={column.isRoot ? 'ch05-result-column' : ''}>
                            <TruthBadge value={row.values[column.key]} />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
      <button type="button" className="completion-button ch05-complete" onClick={onComplete}>完成本章实验</button>
    </div>
  );
}
