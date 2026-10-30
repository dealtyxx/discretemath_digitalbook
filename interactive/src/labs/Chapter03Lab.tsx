import { useMemo, useState } from 'react';
import { Formula } from '../components/Formula';
import { StepPlayer } from '../components/StepPlayer';
import type { LabProps, TeachingStep } from '../types';
import {
  RELATION_ELEMENTS,
  analyzeRelation,
  countOrderedPairs,
  createRelation,
  relationClosure,
  toggleRelation,
  warshallSnapshots,
} from '../lib/ch03';
import type {
  ClosureKind,
  OrderedPair,
  RelationAnalysis,
  RelationMatrix,
  RelationViolation,
} from '../lib/ch03';
import './Chapter03Lab.css';

const NODE_POSITIONS = [
  { x: 85, y: 100 },
  { x: 345, y: 100 },
  { x: 215, y: 325 },
  { x: 215, y: 188 },
];
const NODE_RADIUS = 25;

const PROPERTY_DEFINITIONS: {
  key: keyof RelationAnalysis;
  name: string;
  tex: string;
}[] = [
  { key: 'reflexive', name: '自反性', tex: '\\forall x\\in A,\\ \\langle x,x\\rangle\\in R' },
  { key: 'symmetric', name: '对称性', tex: '\\langle x,y\\rangle\\in R\\Rightarrow\\langle y,x\\rangle\\in R' },
  { key: 'antisymmetric', name: '反对称性', tex: 'x\\ne y\\Rightarrow\\neg(\\langle x,y\\rangle\\in R\\land\\langle y,x\\rangle\\in R)' },
  { key: 'transitive', name: '传递性', tex: '\\langle x,y\\rangle,\\langle y,z\\rangle\\in R\\Rightarrow\\langle x,z\\rangle\\in R' },
];

const PRESETS: { name: string; pairs: readonly (readonly [number, number])[] }[] = [
  { name: '链式关系', pairs: [[0, 1], [1, 2], [2, 3]] },
  { name: '恒等关系', pairs: [[0, 0], [1, 1], [2, 2], [3, 3]] },
  { name: '空关系', pairs: [] },
  { name: '双向示例', pairs: [[0, 1], [1, 0], [1, 2], [2, 3]] },
];

function pairText(pair: OrderedPair): string {
  return `⟨${RELATION_ELEMENTS[pair.from]},${RELATION_ELEMENTS[pair.to]}⟩`;
}

function violationText(key: keyof RelationAnalysis, violation: RelationViolation): string {
  if (key === 'reflexive' && violation.missing) return `缺少 ${pairText(violation.missing)}。`;
  if (key === 'symmetric' && violation.missing) {
    return `有 ${pairText(violation.premises[0])}，但缺少 ${pairText(violation.missing)}。`;
  }
  if (key === 'antisymmetric') {
    const [first, second] = violation.premises;
    return `${RELATION_ELEMENTS[first.from]}≠${RELATION_ELEMENTS[first.to]}，但 ${pairText(first)} 与 ${pairText(second)} 同时存在。`;
  }
  if (key === 'transitive' && violation.missing) {
    return `有 ${pairText(violation.premises[0])} 与 ${pairText(violation.premises[1])}，但缺少 ${pairText(violation.missing)}。`;
  }
  return '存在一个反例。';
}

function edgePath(from: number, to: number): string {
  const source = NODE_POSITIONS[from];
  const target = NODE_POSITIONS[to];
  if (from === to) {
    const angle = from === 3 ? 0.2 : Math.atan2(source.y - 195, source.x - 215);
    const point = (radius: number, offset: number) => ({
      x: source.x + radius * Math.cos(angle + offset),
      y: source.y + radius * Math.sin(angle + offset),
    });
    const start = point(NODE_RADIUS, -0.62);
    const end = point(NODE_RADIUS + 3, 0.62);
    const controlOne = point(from === 3 ? 59 : 70, -0.78);
    const controlTwo = point(from === 3 ? 59 : 70, 0.78);
    return `M ${start.x} ${start.y} C ${controlOne.x} ${controlOne.y}, ${controlTwo.x} ${controlTwo.y}, ${end.x} ${end.y}`;
  }
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const length = Math.hypot(dx, dy);
  const ux = dx / length;
  const uy = dy / length;
  const start = { x: source.x + ux * (NODE_RADIUS + 2), y: source.y + uy * (NODE_RADIUS + 2) };
  const end = { x: target.x - ux * (NODE_RADIUS + 5), y: target.y - uy * (NODE_RADIUS + 5) };
  const bend = 18;
  const control = {
    x: (start.x + end.x) / 2 - uy * bend,
    y: (start.y + end.y) / 2 + ux * bend,
  };
  return `M ${start.x} ${start.y} Q ${control.x} ${control.y}, ${end.x} ${end.y}`;
}

interface DirectedEdgeProps {
  from: number;
  to: number;
  active: boolean;
  onToggle: () => void;
}

function DirectedEdge({ from, to, active, onToggle }: DirectedEdgeProps) {
  const path = edgePath(from, to);
  const fromLabel = RELATION_ELEMENTS[from];
  const toLabel = RELATION_ELEMENTS[to];
  return (
    <g
      className={`ch03-edge-button ${active ? 'is-present' : 'is-absent'}`}
      role="button"
      tabIndex={0}
      aria-pressed={active}
      aria-label={`${fromLabel} 到 ${toLabel}：${active ? '有序对已在关系中，按回车移除' : '有序对不在关系中，按回车加入'}`}
      onClick={onToggle}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onToggle();
        }
      }}
    >
      <title>{`⟨${fromLabel},${toLabel}⟩：${active ? '实线，点击移除' : '虚线，点击加入'}`}</title>
      <path className="ch03-edge-hit" d={path} />
      {active && <path className="ch03-edge-underlay" d={path} />}
      <path
        className={`ch03-edge ${active ? 'is-present' : 'is-absent'}`}
        d={path}
        markerEnd={`url(#${active ? 'ch03-arrow-present' : 'ch03-arrow-absent'})`}
      />
    </g>
  );
}

interface RelationGraphProps {
  matrix: RelationMatrix;
  onToggle: (from: number, to: number) => void;
}

function RelationGraph({ matrix, onToggle }: RelationGraphProps) {
  return (
    <div className="diagram-stage ch03-graph-stage"><svg className="svg-lab ch03-relation-graph" viewBox="0 0 430 420" role="group" aria-label="四元素关系的有向图；全部十六种有序对均可点击或用键盘切换">
      <title>四元素关系有向图</title><desc>外侧三个顶点围成三角形，第四个顶点置于内部。双向关系使用分开的曲线，自反关系使用朝外的自环。</desc>
      <defs>
        <marker id="ch03-arrow-present" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M 0 0 L 8 4 L 0 8 Z" className="ch03-arrow-head-present" />
        </marker>
        <marker id="ch03-arrow-absent" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M 0 0 L 8 4 L 0 8 Z" className="ch03-arrow-head-absent" />
        </marker>
      </defs>
      {matrix.flatMap((row, from) => row.map((active, to) => ({ from, to, active }))).sort((left, right) => Number(left.active) - Number(right.active)).map(({ from, to, active }) => (
        <DirectedEdge key={`${from}-${to}`} from={from} to={to} active={active} onToggle={() => onToggle(from, to)} />
      ))}
      {NODE_POSITIONS.map((position, index) => (
        <g key={RELATION_ELEMENTS[index]} className="ch03-node">
          <circle className="ch03-node-halo" cx={position.x} cy={position.y} r="32" />
          <circle className="ch03-node-circle" cx={position.x} cy={position.y} r={NODE_RADIUS} />
          <text x={position.x} y={position.y + 5} textAnchor="middle">{RELATION_ELEMENTS[index]}</text>
        </g>
      ))}
    </svg></div>
  );
}

interface MatrixTableProps {
  matrix: RelationMatrix;
  editable?: boolean;
  current?: { i: number; j: number };
  currentAdded?: boolean;
  onToggle?: (from: number, to: number) => void;
}

function MatrixTable({ matrix, editable = false, current, currentAdded = false, onToggle }: MatrixTableProps) {
  return (
    <table className="matrix-table ch03-matrix-table">
      <caption className="ch03-sr-only">关系矩阵，行是起点，列是终点</caption>
      <thead>
        <tr>
          <th scope="col">起＼终</th>
          {RELATION_ELEMENTS.map((element) => <th scope="col" key={element}>{element}</th>)}
        </tr>
      </thead>
      <tbody>
        {matrix.map((row, from) => (
          <tr key={RELATION_ELEMENTS[from]}>
            <th scope="row">{RELATION_ELEMENTS[from]}</th>
            {row.map((active, to) => {
              const isCurrent = current?.i === from && current.j === to;
              if (!editable) {
                return (
                  <td key={RELATION_ELEMENTS[to]} className={`${active ? 'on' : ''} ${isCurrent ? 'ch03-current-cell' : ''}`} aria-current={isCurrent ? 'step' : undefined}>
                    <span>{active ? '1' : '0'}</span>
                    {isCurrent && currentAdded && <small className="ch03-new-mark">新增</small>}
                  </td>
                );
              }
              return (
                <td key={RELATION_ELEMENTS[to]} className={active ? 'on' : ''}>
                  <button
                    type="button"
                    className={active ? 'on' : ''}
                    aria-pressed={active}
                    aria-label={`${RELATION_ELEMENTS[from]} 到 ${RELATION_ELEMENTS[to]}：${active ? '1，点击移除有序对' : '0，点击加入有序对'}`}
                    onClick={() => onToggle?.(from, to)}
                  >
                    {active ? '1' : '0'}
                  </button>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface PropertyItemProps {
  definition: (typeof PROPERTY_DEFINITIONS)[number];
  check: RelationAnalysis[keyof RelationAnalysis];
}

function PropertyItem({ definition, check }: PropertyItemProps) {
  return (
    <li className={`ch03-property ${check.holds ? 'status-pass' : 'status-fail'}`}>
      <div className="ch03-property-heading">
        <strong>{definition.name}</strong>
        <span>{check.holds ? '满足' : `不满足 · ${check.violations.length} 个反例`}</span>
      </div>
      <Formula tex={definition.tex} display={false} />
      {!check.holds && (
        <div className="ch03-counterexample">
          <p>{violationText(definition.key, check.violations[0])}</p>
          {check.violations.length > 1 && (
            <details>
              <summary>查看全部 {check.violations.length} 个反例</summary>
              <ul>
                {check.violations.map((violation, index) => (
                  <li key={`${definition.key}-${index}`}>{violationText(definition.key, violation)}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
      {check.holds && <p className="ch03-property-note">未发现反例；若前提为空，性质按空真成立。</p>}
    </li>
  );
}

export default function Chapter03Lab({ onComplete }: LabProps) {
  const [section, setSection] = useState<'edit' | 'closure'>('edit');
  const [relation, setRelation] = useState<RelationMatrix>(() => createRelation(PRESETS[0].pairs));
  const [closureKind, setClosureKind] = useState<ClosureKind>('reflexive');
  const [warshallIndex, setWarshallIndex] = useState(0);
  const analysis = useMemo(() => analyzeRelation(relation), [relation]);
  const closure = useMemo(() => relationClosure(relation, closureKind), [relation, closureKind]);
  const snapshots = useMemo(() => warshallSnapshots(relation), [relation]);
  const currentSnapshot = snapshots[Math.min(warshallIndex, snapshots.length - 1)];

  const steps = useMemo<TeachingStep[]>(() => snapshots.map((snapshot, index) => {
    if (index === 0) {
      return {
        label: '初始矩阵',
        title: '从原关系 R 开始',
        explanation: '之后依次允许 a、b、c、d 作为中间元素，每轮逐个检查十六个矩阵位置。所有快照都可前后回看。',
        formula: 'M^{(0)}=M_R',
      };
    }
    const from = RELATION_ELEMENTS[snapshot.i];
    const middle = RELATION_ELEMENTS[snapshot.k];
    const to = RELATION_ELEMENTS[snapshot.j];
    const explanation = snapshot.added
      ? `发现 ${from}→${middle}→${to} 的可达路径，而直达有序对原本不存在，所以本步新增 ⟨${from},${to}⟩。`
      : snapshot.previous
        ? `⟨${from},${to}⟩ 已经在当前关系中，保留 1，不重复添加。`
        : `当前两段路径不能同时成立，⟨${from},${to}⟩ 保持 0。`;
    return {
      label: `第 ${snapshot.k + 1} 轮 · 位置 (${snapshot.i + 1},${snapshot.j + 1})`,
      title: `以 ${middle} 为中间元素，检查 ⟨${from},${to}⟩`,
      explanation,
      formula: `M_{${snapshot.i + 1}${snapshot.j + 1}}\\leftarrow ${Number(snapshot.previous)}\\lor(${Number(snapshot.left)}\\land ${Number(snapshot.right)})=${Number(snapshot.value)}`,
    };
  }), [snapshots]);

  const applyRelation = (next: RelationMatrix) => {
    setRelation(next);
    setWarshallIndex(0);
  };
  const togglePair = (from: number, to: number) => applyRelation(toggleRelation(relation, from, to));
  const closureName = closureKind === 'reflexive' ? '自反闭包' : closureKind === 'symmetric' ? '对称闭包' : '传递闭包';
  const closureFormula = closureKind === 'reflexive' ? 'r(R)=R\\cup I_A' : closureKind === 'symmetric' ? 's(R)=R\\cup R^{-1}' : 't(R)=R\\cup R^2\\cup R^3\\cup\\cdots';

  return (
    <div className="ch03-lab">
      <div className="lab-tabs" role="group" aria-label="第三章实验内容">
        <button type="button" aria-pressed={section === 'edit'} aria-controls="ch03-edit-panel" className={section === 'edit' ? 'active' : ''} onClick={() => setSection('edit')}>关系编辑与性质</button>
        <button type="button" aria-pressed={section === 'closure'} aria-controls="ch03-closure-panel" className={section === 'closure' ? 'active' : ''} onClick={() => setSection('closure')}>闭包与 Warshall</button>
      </div>

      {section === 'edit' ? (
        <div id="ch03-edit-panel" className="lab-workspace ch03-section ch03-edit-workspace">
            <section className="control-panel ch03-preset-toolbar">
              <div className="panel-heading"><h3>载入关系</h3><small>载入后仍可逐对修改</small></div>
              <div className="ch03-preset-grid">
                {PRESETS.map((preset) => <button type="button" className="mini-button" key={preset.name} onClick={() => applyRelation(createRelation(preset.pairs))}>{preset.name}</button>)}
              </div>
              <p className="small muted">图与矩阵修改的是同一个 R。自环位于节点外侧；两个方向的有序对彼此独立。</p>
            </section>
          <div className="lab-column">
            <section className="visualization-panel">
              <div className="panel-heading"><h3>关系有向图</h3><small>点击边切换；Tab 聚焦后回车也可切换</small></div>
              <RelationGraph matrix={relation} onToggle={togglePair} />
              <div className="legend" aria-label="图例">
                <span className="legend-item"><i className="ch03-line-sample present" />实线箭头：在 R 中</span>
                <span className="legend-item"><i className="ch03-line-sample absent" />虚线箭头：不在 R 中，可加入</span>
              </div>
            </section>
          </div>
          <div className="lab-column">
            <section className="math-panel">
              <div className="panel-heading"><h3>同步关系矩阵</h3><small>行是起点，列是终点；0 / 1 直接表示状态</small></div>
              <div className="ch03-matrix-scroll" tabIndex={0} role="region" aria-label="可编辑关系矩阵，可横向滚动">
                <MatrixTable matrix={relation} editable onToggle={togglePair} />
              </div>
              <div className="readout-grid">
                <div className="readout-item"><span>集合 A</span><strong>{'{a, b, c, d}'}</strong></div>
                <div className="readout-item"><span>有序对个数 |R|</span><strong>{countOrderedPairs(relation)}</strong></div>
              </div>
            </section>
          </div>
            <section className="math-panel ch03-properties-panel">
              <div className="panel-heading"><h3>实时性质判定</h3><small>每次切换后立即重算</small></div>
              <ul className="status-list ch03-property-list" aria-live="polite">
                {PROPERTY_DEFINITIONS.map((definition) => <PropertyItem key={definition.key} definition={definition} check={analysis[definition.key]} />)}
              </ul>
            </section>
          <div className="ch03-complete-row"><button type="button" className="completion-button" onClick={onComplete}>完成关系探索</button></div>
        </div>
      ) : (
        <div id="ch03-closure-panel" className="lab-workspace ch03-section ch03-closure-workspace">
          <div className="lab-column">
            <section className="math-panel ch03-closure-matrix">
              <div className="panel-heading">
                <h3>{closureKind === 'transitive' ? 'Warshall 当前矩阵快照' : `${closureName}结果矩阵`}</h3>
                <small>{closureKind === 'transitive' ? '当前位置用边框标出，新增项另有文字标记' : '只添加必要有序对，不删除原有序对'}</small>
              </div>
              <div className="ch03-matrix-scroll" tabIndex={0} role="region" aria-label="闭包结果矩阵，可横向滚动">
                <MatrixTable
                  matrix={closureKind === 'transitive' ? currentSnapshot.matrix : closure.matrix}
                  current={closureKind === 'transitive' && currentSnapshot.k >= 0 ? { i: currentSnapshot.i, j: currentSnapshot.j } : undefined}
                  currentAdded={closureKind === 'transitive' && currentSnapshot.added}
                />
              </div>
              <div className="readout-grid">
                <div className="readout-item"><span>原关系 |R|</span><strong>{countOrderedPairs(relation)}</strong></div>
                <div className="readout-item"><span>{closureKind === 'transitive' ? '当前快照有序对' : '闭包有序对'}</span><strong>{countOrderedPairs(closureKind === 'transitive' ? currentSnapshot.matrix : closure.matrix)}</strong></div>
                <div className="readout-item"><span>{closureKind === 'transitive' ? '闭包共需新增' : '新增有序对'}</span><strong>{closure.added.length}</strong></div>
              </div>
              {closureKind !== 'transitive' && (
                <p className="callout ch03-closure-summary">
                  {closure.added.length === 0 ? `无需添加：原关系已经满足${closureName.slice(0, 2)}性。` : `新增：${closure.added.map(pairText).join('、')}。验证：结果满足${closureName.slice(0, 2)}性。`}
                </p>
              )}
            </section>
            {closureKind === 'transitive' && (
              <StepPlayer steps={steps} current={warshallIndex} onChange={setWarshallIndex} onComplete={onComplete} label="Warshall 传递闭包快照播放器" />
            )}
          </div>
          <div className="lab-column">
            <section className="control-panel">
              <div className="panel-heading"><h3>选择闭包</h3><small>始终从当前编辑的 R 计算</small></div>
              <div className="segmented" aria-label="闭包类型">
                <button type="button" className={closureKind === 'reflexive' ? 'active' : ''} aria-pressed={closureKind === 'reflexive'} onClick={() => setClosureKind('reflexive')}>自反闭包</button>
                <button type="button" className={closureKind === 'symmetric' ? 'active' : ''} aria-pressed={closureKind === 'symmetric'} onClick={() => setClosureKind('symmetric')}>对称闭包</button>
                <button type="button" className={closureKind === 'transitive' ? 'active' : ''} aria-pressed={closureKind === 'transitive'} onClick={() => { setClosureKind('transitive'); setWarshallIndex(0); }}>传递闭包</button>
              </div>
              <Formula tex={closureFormula} />
              <p className="small muted">{closureKind === 'transitive' ? '播放器逐步执行 M[i][j] ← M[i][j] ∨ (M[i][k] ∧ M[k][j])，而不是直接给出最终矩阵。' : '闭包是包含 R 且满足相应性质的最小关系。'}</p>
              <button type="button" className="mini-button" onClick={() => { applyRelation(closure.matrix); setSection('edit'); }}>将此闭包设为当前 R 并返回编辑</button>
              <button type="button" className="completion-button" onClick={onComplete}>完成闭包探索</button>
            </section>
            <section className="math-panel ch03-closure-added">
              <div className="panel-heading"><h3>最终新增清单</h3><small>原关系中的有序对全部保留</small></div>
              {closure.added.length > 0 ? <p className="ch03-added-list">{closure.added.map(pairText).join('、')}</p> : <p className="small muted">空集：不需要新增任何有序对。</p>}
              <div className="callout">传递闭包记录正长度路径的可达性；没有回路时，不会额外加入自环。</div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
