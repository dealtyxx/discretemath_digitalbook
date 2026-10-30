import { useMemo, useState } from 'react';
import { Formula } from '../components/Formula';
import type { LabProps } from '../types';
import {
  DIVISORS_OF_12,
  analyzeMapping,
  checkPartialOrder,
  createMapping,
  divides,
  doublingPreview,
  hasseCovers,
  pairBounds,
  toggleMapping,
} from '../lib/ch04';
import type { MappingMatrix } from '../lib/ch04';
import './Chapter04Lab.css';

const HASSE_POSITIONS: Record<number, { x: number; y: number }> = {
  1: { x: 200, y: 370 },
  2: { x: 120, y: 270 },
  3: { x: 280, y: 270 },
  4: { x: 120, y: 170 },
  6: { x: 280, y: 170 },
  12: { x: 200, y: 70 },
};
const COVERS = hasseCovers();
const ORDER_CHECK = checkPartialOrder();
const DOUBLING_PAIRS = doublingPreview();

interface MappingPreset {
  id: string;
  name: string;
  domain: string[];
  codomain: string[];
  pairs: readonly (readonly [number, number])[];
}

const MAPPING_PRESETS: MappingPreset[] = [
  { id: 'bijection', name: '双射：一一对应', domain: ['1', '2', '3'], codomain: ['a', 'b', 'c'], pairs: [[0, 0], [1, 1], [2, 2]] },
  { id: 'surjective', name: '满射但不是单射', domain: ['1', '2', '3'], codomain: ['a', 'b'], pairs: [[0, 0], [1, 1], [2, 1]] },
  { id: 'injective', name: '单射但不是满射', domain: ['1', '2'], codomain: ['a', 'b', 'c'], pairs: [[0, 0], [1, 1]] },
  { id: 'constant', name: '函数：既非单射也非满射', domain: ['1', '2', '3'], codomain: ['a', 'b', 'c'], pairs: [[0, 0], [1, 0], [2, 0]] },
  { id: 'multiple', name: '非函数：一个输入多个像', domain: ['1', '2', '3'], codomain: ['a', 'b', 'c'], pairs: [[0, 0], [0, 1], [1, 1], [2, 2]] },
  { id: 'missing', name: '非函数：有输入没有像', domain: ['1', '2', '3'], codomain: ['a', 'b', 'c'], pairs: [[0, 0], [1, 1]] },
];

function numberSet(values: readonly number[]): string {
  return values.length ? `{${values.join(', ')}}` : '∅';
}

function HasseDiagram({ a, b }: { a: number; b: number }) {
  return (
    <div className="diagram-stage ch04-hasse-stage"><svg className="svg-lab ch04-hasse" viewBox="0 0 400 430" role="img" aria-label={`12 的正因数整除偏序哈斯图；所选 A 为 ${a}，B 为 ${b}`}>
      <title>12 的正因数整除偏序哈斯图</title>
      {COVERS.map(({ lower, upper }) => {
        const start = HASSE_POSITIONS[lower];
        const end = HASSE_POSITIONS[upper];
        return (
          <line key={`${lower}-${upper}`} className="ch04-hasse-edge" x1={start.x} y1={start.y} x2={end.x} y2={end.y}>
            <title>{`${lower} 整除 ${upper}，且不存在中间元素；这是一条覆盖边`}</title>
          </line>
        );
      })}
      {DIVISORS_OF_12.map((value) => {
        const position = HASSE_POSITIONS[value];
        const isA = value === a;
        const isB = value === b;
        return (
          <g key={value} className="ch04-hasse-node">
            <circle className="ch04-node-halo" cx={position.x} cy={position.y} r="33" />
            <circle className="ch04-hasse-circle" cx={position.x} cy={position.y} r="25" />
            {isA && <circle className="ch04-selection-a" cx={position.x} cy={position.y} r="29" />}
            {isB && <circle className="ch04-selection-b" cx={position.x} cy={position.y} r="33" />}
            <text className="ch04-hasse-value" x={position.x} y={position.y + 5} textAnchor="middle">{value}</text>
            {(isA || isB) && <g className="ch04-selection-badge" transform={`translate(${position.x} ${position.y - 45})`}><rect x={isA && isB ? -25 : -17} y="-10" width={isA && isB ? 50 : 34} height="20" rx="5" /><text className="ch04-selection-label" y="4" textAnchor="middle">{isA && isB ? 'A=B' : isA ? 'A' : 'B'}</text></g>}
          </g>
        );
      })}
    </svg></div>
  );
}

function columnY(index: number, count: number): number {
  return 200 - ((count - 1) * 100) / 2 + index * 100;
}

interface MappingGraphProps {
  domain: string[];
  codomain: string[];
  matrix: MappingMatrix;
  onToggle: (from: number, to: number) => void;
}

function MappingGraph({ domain, codomain, matrix, onToggle }: MappingGraphProps) {
  const edges = matrix.flatMap((row, from) => row.map((active, to) => ({ from, to, active })))
    .sort((left, right) => Number(left.active) - Number(right.active));
  return <>
    <div className="diagram-stage ch04-mapping-stage"><svg className="svg-lab ch04-mapping-graph" viewBox="0 0 440 390" role="group" aria-label="有限集合对应图；点击箭头或用键盘切换有序对">
      <title>输入集合与陪域之间的对应</title><desc>实线为已选有序对，浅色虚线可加入。每条箭头只连接一对元素，下方状态条显示像与原像计数。</desc>
      <defs>
        <marker id="ch04-arrow-present" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M 0 0 L 9 4.5 L 0 9 Z" className="ch04-arrow-head-present" />
        </marker>
        <marker id="ch04-arrow-absent" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M 0 0 L 8 4 L 0 8 Z" className="ch04-arrow-head-absent" />
        </marker>
      </defs>
      <text className="ch04-column-title" x="80" y="42" textAnchor="middle">X（输入）</text>
      <text className="ch04-column-title" x="360" y="42" textAnchor="middle">Y（陪域）</text>
      {edges.map(({ active, from, to }) => {
        const startAngle = (to - (codomain.length - 1) / 2) * 0.28;
        const endAngle = (from - (domain.length - 1) / 2) * 0.28;
        const start = { x: 80 + Math.cos(startAngle) * 27, y: columnY(from, domain.length) + Math.sin(startAngle) * 27 };
        const end = { x: 360 - Math.cos(endAngle) * 31, y: columnY(to, codomain.length) + Math.sin(endAngle) * 31 };
        const bend = (from - (domain.length - 1) / 2 - to + (codomain.length - 1) / 2) * 22;
        const path = `M ${start.x} ${start.y} C ${start.x + 75} ${start.y + bend}, ${end.x - 75} ${end.y + bend}, ${end.x} ${end.y}`;
        return (
          <g key={`${from}-${to}`} className={`ch04-mapping-edge-button ${active ? 'is-present' : 'is-absent'}`} role="button" tabIndex={0}
            aria-pressed={active} aria-label={`${domain[from]} 对应 ${codomain[to]}：${active ? '已包含，按回车移除' : '未包含，按回车加入'}`}
            onClick={() => onToggle(from, to)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onToggle(from, to); } }}>
            <title>{`${domain[from]} → ${codomain[to]}：${active ? '实线，点击移除' : '虚线，点击加入'}`}</title>
            <path className="ch04-edge-hit" d={path} />
            {active && <path className="ch04-edge-underlay" d={path} />}
            <path className={`ch04-mapping-edge ${active ? 'is-present' : 'is-absent'}`} d={path} markerEnd={`url(#${active ? 'ch04-arrow-present' : 'ch04-arrow-absent'})`} />
          </g>
        );
      })}
      {domain.map((value, index) => <g key={value} className="ch04-mapping-node">
        <circle className="ch04-node-halo" cx="80" cy={columnY(index, domain.length)} r="33" />
        <circle className="ch04-domain-node" cx="80" cy={columnY(index, domain.length)} r="25" />
        <text className="ch04-mapping-value" x="80" y={columnY(index, domain.length) + 6} textAnchor="middle">{value}</text>
      </g>)}
      {codomain.map((value, index) => <g key={value} className="ch04-mapping-node">
        <circle className="ch04-node-halo" cx="360" cy={columnY(index, codomain.length)} r="33" />
        <circle className="ch04-codomain-node" cx="360" cy={columnY(index, codomain.length)} r="25" />
        <text className="ch04-mapping-value" x="360" y={columnY(index, codomain.length) + 6} textAnchor="middle">{value}</text>
      </g>)}
    </svg></div>
    <div className="ch04-mapping-node-key">
      <div><span>输入的像数</span><div className="ch04-node-chips">{domain.map((value, index) => {
        const count = matrix[index].filter(Boolean).length;
        return <span className="ch04-node-chip" data-issue={count !== 1} key={value}><strong>{value}</strong><span>{count === 0 ? '缺像' : `${count} 个像`}</span></span>;
      })}</div></div>
      <div><span>陪域的原像数</span><div className="ch04-node-chips">{codomain.map((value, index) => {
        const count = matrix.reduce((total, row) => total + Number(Boolean(row[index])), 0);
        return <span className="ch04-node-chip" data-issue={count === 0} key={value}><strong>{value}</strong><span>{count === 0 ? '无原像' : `${count} 个原像`}</span></span>;
      })}</div></div>
    </div>
  </>;
}

interface MappingEditorProps extends MappingGraphProps {}

function MappingEditor({ domain, codomain, matrix, onToggle }: MappingEditorProps) {
  return (
    <table className="matrix-table ch04-mapping-table">
      <caption className="ch04-sr-only">对应关系编辑矩阵，每行恰好一个 1 才满足函数定义</caption>
      <thead><tr><th scope="col">X＼Y</th>{codomain.map((value) => <th scope="col" key={value}>{value}</th>)}</tr></thead>
      <tbody>
        {domain.map((input, from) => (
          <tr key={input}>
            <th scope="row">{input}</th>
            {codomain.map((output, to) => {
              const active = matrix[from][to];
              return (
                <td key={output} className={active ? 'on' : ''}>
                  <button type="button" className={active ? 'on' : ''} aria-pressed={active} aria-label={`${input} 对应 ${output}：${active ? '1，点击移除' : '0，点击加入'}`} onClick={() => onToggle(from, to)}>{active ? '1' : '0'}</button>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Chapter04Lab({ onComplete }: LabProps) {
  const [section, setSection] = useState<'poset' | 'mapping'>('poset');
  const [selectedA, setSelectedA] = useState(4);
  const [selectedB, setSelectedB] = useState(6);
  const [presetId, setPresetId] = useState('bijection');
  const [domain, setDomain] = useState<string[]>([...MAPPING_PRESETS[0].domain]);
  const [codomain, setCodomain] = useState<string[]>([...MAPPING_PRESETS[0].codomain]);
  const [mapping, setMapping] = useState<MappingMatrix>(() => createMapping(MAPPING_PRESETS[0].domain.length, MAPPING_PRESETS[0].codomain.length, MAPPING_PRESETS[0].pairs));
  const bounds = useMemo(() => pairBounds(selectedA, selectedB), [selectedA, selectedB]);
  const mappingAnalysis = useMemo(() => analyzeMapping(mapping, codomain.length), [mapping, codomain.length]);

  const loadPreset = (id: string) => {
    const preset = MAPPING_PRESETS.find((item) => item.id === id);
    if (!preset) return;
    setPresetId(id);
    setDomain([...preset.domain]);
    setCodomain([...preset.codomain]);
    setMapping(createMapping(preset.domain.length, preset.codomain.length, preset.pairs));
  };
  const togglePair = (from: number, to: number) => {
    setMapping((current) => toggleMapping(current, from, to));
    setPresetId('custom');
  };
  const comparison = divides(selectedA, selectedB)
    ? `${selectedA} | ${selectedB}，所以 A ≼ B。`
    : divides(selectedB, selectedA)
      ? `${selectedB} | ${selectedA}，所以 B ≼ A。`
      : `${selectedA} ∤ ${selectedB} 且 ${selectedB} ∤ ${selectedA}，所以 A 与 B 不可比。`;

  const propertyText = (kind: 'injective' | 'surjective' | 'bijective') => {
    if (!mappingAnalysis.isFunction) return '先满足函数定义';
    if (kind === 'injective') return mappingAnalysis.isInjective ? '满足' : '不满足';
    if (kind === 'surjective') return mappingAnalysis.isSurjective ? '满足' : '不满足';
    return mappingAnalysis.isBijective ? '满足' : '不满足';
  };

  return (
    <div className="ch04-lab">
      <div className="lab-tabs" role="group" aria-label="第四章实验内容">
        <button type="button" aria-pressed={section === 'poset'} aria-controls="ch04-poset-panel" className={section === 'poset' ? 'active' : ''} onClick={() => setSection('poset')}>偏序与哈斯图</button>
        <button type="button" aria-pressed={section === 'mapping'} aria-controls="ch04-mapping-panel" className={section === 'mapping' ? 'active' : ''} onClick={() => setSection('mapping')}>有限函数与无限对应</button>
      </div>

      {section === 'poset' ? (
        <div id="ch04-poset-panel" className="lab-workspace ch04-section ch04-poset-workspace">
          <div className="lab-column">
            <section className="visualization-panel">
              <div className="panel-heading"><h3>12 的正因数整除哈斯图</h3><small>由下向上表示整除，只画覆盖边</small></div>
              <HasseDiagram a={selectedA} b={selectedB} />
              <div className="legend" aria-label="选择标记图例"><span className="legend-item">A：实线圆环并标注 A</span><span className="legend-item">B：虚线圆环并标注 B</span></div>
            <div className="ch04-cover-section">
              <div className="panel-heading"><h3>覆盖关系清单</h3><small>省略自反边与可由传递性推出的边</small></div>
              <details className="ch04-cover-details">
                <summary>查看全部 {COVERS.length} 条覆盖边</summary>
                <table className="data-table">
                  <thead><tr><th scope="col">覆盖</th><th scope="col">判定依据</th></tr></thead>
                  <tbody>{COVERS.map(({ lower, upper }) => <tr key={`${lower}-${upper}`}><td>{lower} ≺ {upper}</td><td>{lower} | {upper}，且无中间元素</td></tr>)}</tbody>
                </table>
              </details>
            </div>
            </section>

          </div>
          <div className="lab-column">
            <section className="control-panel">
              <div className="panel-heading"><h3>选择两个元素</h3><small>子集 S = {'{A, B}'} 的界在整个偏序集内寻找</small></div>
              <div className="control-row">
                <label>元素 A<select value={selectedA} onChange={(event) => setSelectedA(Number(event.target.value))}>{DIVISORS_OF_12.map((value) => <option value={value} key={value}>{value}</option>)}</select></label>
                <label>元素 B<select value={selectedB} onChange={(event) => setSelectedB(Number(event.target.value))}>{DIVISORS_OF_12.map((value) => <option value={value} key={value}>{value}</option>)}</select></label>
              </div>
              <Formula tex={'x\\preceq y\\iff x\\mid y'} />
              <p className="callout" aria-live="polite">{comparison}</p>
            <div className="ch04-axiom-section">
              <div className="panel-heading"><h3>偏序公理核验</h3><small>关系为整除，而非数值大小</small></div>
              <div className="readout-grid">
                <div className="readout-item"><span>自反性</span><strong>{ORDER_CHECK.reflexive ? '满足' : '不满足'}</strong></div>
                <div className="readout-item"><span>反对称性</span><strong>{ORDER_CHECK.antisymmetric ? '满足' : '不满足'}</strong></div>
                <div className="readout-item"><span>传递性</span><strong>{ORDER_CHECK.transitive ? '满足' : '不满足'}</strong></div>
              </div>
            </div>
            </section>


          </div>
            <section className="math-panel ch04-bounds-panel">
              <div className="panel-heading"><h3>上界、下界与 meet / join</h3><small>界可以等于 A 或 B</small></div>
              <div className="readout-grid">
                <div className="readout-item"><span>所有上界</span><strong>{numberSet(bounds.upperBounds)}</strong></div>
                <div className="readout-item"><span>所有下界</span><strong>{numberSet(bounds.lowerBounds)}</strong></div>
                <div className="readout-item"><span>join：最小上界 A ∨ B</span><strong>{bounds.join ?? '不存在'}</strong></div>
                <div className="readout-item"><span>meet：最大下界 A ∧ B</span><strong>{bounds.meet ?? '不存在'}</strong></div>
              </div>
              <Formula tex={`${selectedA}\\vee ${selectedB}=${bounds.join ?? '\\text{不存在}'},\\qquad ${selectedA}\\wedge ${selectedB}=${bounds.meet ?? '\\text{不存在}'}`} />
            </section>
          <div className="ch04-complete-row"><button type="button" className="completion-button" onClick={onComplete}>完成偏序探索</button></div>
        </div>
      ) : (
        <div id="ch04-mapping-panel" className="ch04-section">
          <div className="lab-workspace ch04-mapping-workspace">
              <section className="control-panel ch04-mapping-toolbar">
                <div className="panel-heading"><h3>映射预设</h3><small>也可在图或矩阵中自行编辑</small></div>
                <label className="ch04-preset-label">选择预设
                  <select value={presetId} onChange={(event) => loadPreset(event.target.value)}>
                    {presetId === 'custom' && <option value="custom" disabled>自定义关系</option>}
                    {MAPPING_PRESETS.map((preset) => <option value={preset.id} key={preset.id}>{preset.name}</option>)}
                  </select>
                </label>


              </section>
            <div className="lab-column">
              <section className="visualization-panel">
                <div className="panel-heading"><h3>有限集合对应图</h3><small>实线为已选有序对，虚线可加入；下方状态条显示计数</small></div>
                <MappingGraph domain={domain} codomain={codomain} matrix={mapping} onToggle={togglePair} />
                <div className="legend"><span className="legend-item">缺像 / 多像 / 无原像均有文字标记，不只依赖颜色</span></div>
              </section>
            </div>
            <div className="lab-column">
              <section className="math-panel">
                <div className="panel-heading"><h3>对应关系编辑矩阵</h3><small>每行恰好一个 1，才是 X → Y 的函数</small></div>
                <div className="ch04-mapping-scroll" tabIndex={0} role="region" aria-label="有限映射编辑矩阵，可横向滚动">
                  <MappingEditor domain={domain} codomain={codomain} matrix={mapping} onToggle={togglePair} />
                </div>
                <div className="readout-grid">
                  <div className="readout-item"><span>|X|</span><strong>{domain.length}</strong></div>
                  <div className="readout-item"><span>|Y|</span><strong>{codomain.length}</strong></div>
                  <div className="readout-item"><span>当前像集大小</span><strong>{mappingAnalysis.imageOutputs.length}</strong></div>
                </div>
              </section>
            </div>
              <section className="math-panel ch04-function-panel">
                <div className="panel-heading"><h3>实时函数判定</h3><small>单射、满射、双射以已经是函数为前提</small></div>
                <ul className="status-list" aria-live="polite">
                  <li className={mappingAnalysis.isFunction ? 'status-pass' : 'status-fail'}><strong>函数</strong><span>{mappingAnalysis.isFunction ? '满足 · 每个输入恰有一个像' : `不满足 · ${mappingAnalysis.issues.length} 个输入异常`}</span></li>
                  <li className={!mappingAnalysis.isFunction ? 'ch04-not-applicable' : mappingAnalysis.isInjective ? 'status-pass' : 'status-fail'}><strong>单射</strong><span>{propertyText('injective')}</span></li>
                  <li className={!mappingAnalysis.isFunction ? 'ch04-not-applicable' : mappingAnalysis.isSurjective ? 'status-pass' : 'status-fail'}><strong>满射</strong><span>{propertyText('surjective')}</span></li>
                  <li className={!mappingAnalysis.isFunction ? 'ch04-not-applicable' : mappingAnalysis.isBijective ? 'status-pass' : 'status-fail'}><strong>双射</strong><span>{propertyText('bijective')}</span></li>
                </ul>
                <div className="ch04-mapping-evidence">
                  {mappingAnalysis.issues.map((issue) => <p key={`${issue.row}-${issue.kind}`}>{issue.kind === 'missing' ? `${domain[issue.row]} 没有输出。` : `${domain[issue.row]} 同时对应 ${issue.outputs.map((output) => codomain[output]).join('、')}。`}</p>)}
                  {mappingAnalysis.isFunction && mappingAnalysis.injectionConflicts.map((conflict) => <p key={conflict.rows.join('-')}>{`${domain[conflict.rows[0]]} 与 ${domain[conflict.rows[1]]} 都对应 ${codomain[conflict.output]}，破坏单射。`}</p>)}
                  {mappingAnalysis.isFunction && !mappingAnalysis.isSurjective && <p>{mappingAnalysis.uncoveredOutputs.map((output) => codomain[output]).join('、')} 没有原像，破坏满射。</p>}
                  {mappingAnalysis.isBijective && <p>每个输入恰有一个像，且每个陪域元素恰有一个原像，所以是一一对应。</p>}
                </div>
              </section>
          </div>
          <section className="math-panel ch04-infinite-panel">
            <div className="panel-heading"><h3>无限对应小面板：n ↦ 2n</h3><small>陪域是非负偶数集 2ℕ₀，不是整个 ℕ₀</small></div>
            <div className="ch04-infinite-layout">
              <div><Formula tex={'\\begin{aligned}f&:\\mathbb{N}_0\\to 2\\mathbb{N}_0\\\\ f(n)&=2n,\\quad f^{-1}(m)=\\frac{m}{2}\\end{aligned}'} /><p className="small muted">正向没有两个 n 映到同一偶数；反向每个非负偶数 m=2n 都唯一回到 n，所以这是双射。</p></div>
              <table className="data-table"><thead><tr><th scope="col">n</th><th scope="col">2n</th><th scope="col">逆对应</th></tr></thead><tbody>{DOUBLING_PAIRS.map(({ input, output }) => <tr key={input}><td>{input}</td><td>{output}</td><td>{output} ↦ {input}</td></tr>)}</tbody></table>
            </div>
          </section>
          <div className="ch04-complete-row"><button type="button" className="completion-button" onClick={onComplete}>完成映射探索</button></div>
        </div>
      )}
    </div>
  );
}
