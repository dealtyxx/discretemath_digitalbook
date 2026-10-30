import { useMemo, useState } from 'react';
import { Formula } from '../components/Formula';
import { StepPlayer } from '../components/StepPlayer';
import type { LabProps } from '../types';
import Chapter08HuffmanLab from './Chapter08HuffmanLab';
import {
  CH8_KRUSKAL_PSEUDOCODE,
  CH8_PRESETS,
  analyzeEuler,
  generateKruskalSteps,
  rootFromParent,
  sortEdgesForKruskal,
  type GraphEdge,
} from '../lib/ch08';
import './Chapter08Lab.css';

type Point = { x: number; y: number };

const POSITIONS: Record<string, Record<string, Point>> = {
  campus: {
    A: { x: 75, y: 210 }, B: { x: 190, y: 70 }, C: { x: 240, y: 180 },
    D: { x: 430, y: 70 }, E: { x: 345, y: 270 }, F: { x: 485, y: 345 }, G: { x: 75, y: 345 },
  },
  ring: {
    A: { x: 80, y: 210 }, B: { x: 180, y: 70 }, C: { x: 380, y: 70 },
    D: { x: 480, y: 210 }, E: { x: 380, y: 350 }, F: { x: 180, y: 350 },
  },
  trail: {
    A: { x: 75, y: 210 }, B: { x: 190, y: 65 }, C: { x: 405, y: 90 },
    D: { x: 465, y: 305 }, E: { x: 190, y: 355 },
  },
};

function edgeLabelPoint(presetId: string, edge: GraphEdge): Point {
  const a = POSITIONS[presetId][edge.u];
  const b = POSITIONS[presetId][edge.v];
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export default function Chapter08Lab({ onComplete }: LabProps) {
  const [mode, setMode] = useState<'kruskal' | 'euler' | 'huffman'>('kruskal');
  const [presetId, setPresetId] = useState(CH8_PRESETS[0].id);
  const [step, setStep] = useState(0);
  const preset = CH8_PRESETS.find((item) => item.id === presetId) ?? CH8_PRESETS[0];
  const kruskalSteps = useMemo(() => generateKruskalSteps(preset.graph), [preset]);
  const euler = useMemo(() => analyzeEuler(preset.graph), [preset]);
  const sortedEdges = useMemo(() => sortEdgesForKruskal(preset.graph), [preset]);
  const currentIndex = Math.min(step, kruskalSteps.length - 1);
  const snapshot = kruskalSteps[currentIndex];
  const accepted = new Set(mode === 'kruskal' ? snapshot.accepted : []);
  const rejected = new Set(mode === 'kruskal' ? snapshot.rejected : []);
  const cycleEdges = new Set(mode === 'kruskal' ? snapshot.cycleEdges : []);
  const graphEdges = preset.graph.edges.map((edge) => {
    const isCurrent = mode === 'kruskal' && snapshot.currentEdge?.id === edge.id;
    const isAccepted = accepted.has(edge.id);
    const isRejected = rejected.has(edge.id);
    const isCycle = cycleEdges.has(edge.id);
    return {
      edge, isCurrent, isAccepted, isRejected,
      classes: `${isAccepted ? ' is-accepted' : ''}${isRejected ? ' is-rejected' : ''}${isCycle ? ' is-cycle' : ''}${isCurrent ? ' is-current' : ''}`,
      layer: isCurrent ? 3 : isCycle ? 2 : isAccepted ? 1 : 0,
    };
  });
  const graphStatus = mode === 'euler'
    ? euler.kind === 'circuit' ? '存在欧拉回路' : euler.kind === 'path' ? '存在欧拉通路' : '不满足欧拉条件'
    : snapshot.currentEdge
      ? `${snapshot.decision === 'accept' ? '接受' : snapshot.decision === 'reject' ? '拒绝' : '考察'} ${snapshot.currentEdge.u}—${snapshot.currentEdge.v}`
      : snapshot.decision === 'done' ? snapshot.title : '初始森林';
  const graphHint = mode === 'euler'
    ? `${euler.oddNodes.length} 个奇度顶点`
    : snapshot.currentEdge ? `权重 ${snapshot.currentEdge.weight} · ${snapshot.decision === 'reject' ? '加入会成环' : snapshot.decision === 'accept' ? '已合并分量' : '比较两端的根'}`
      : snapshot.decision === 'done' ? '所有边均已考察' : '按权重从小到大选边';
  const playerSteps = useMemo(() => kruskalSteps.map((item) => ({
    label: `伪代码第 ${item.line} 行`,
    title: item.title,
    explanation: item.explanation,
    formula: item.decision === 'done'
      ? `${item.components.length === 1 ? 'W(T)' : 'W(F)'}=\\sum_{e\\in \\text{已选边}}w(e)=${item.totalWeight}`
      : undefined,
  })), [kruskalSteps]);

  return (
    <div className="ch08-lab">
      <section className="control-panel ch08-setup" aria-label="特殊图实验设置">
        <div className="panel-heading"><h3>{mode === 'huffman' ? '实验主题' : '实验主题与图预设'}</h3><small>{mode === 'huffman' ? 'Huffman 实验可独立调整符号频率' : '切换预设会恢复 Kruskal 初始快照'}</small></div>
        <div className="lab-tabs" aria-label="选择实验主题">
          <button className={mode === 'kruskal' ? 'active' : ''} onClick={() => setMode('kruskal')} aria-pressed={mode === 'kruskal'}>Kruskal 最小生成树</button>
          <button className={mode === 'euler' ? 'active' : ''} onClick={() => setMode('euler')} aria-pressed={mode === 'euler'}>欧拉性与边遍历</button>
          <button className={mode === 'huffman' ? 'active' : ''} onClick={() => setMode('huffman')} aria-pressed={mode === 'huffman'}>Huffman 前缀编码</button>
        </div>
        {mode !== 'huffman' && <>
        <div className="ch08-presets" aria-label="选择图预设">
          {CH8_PRESETS.map((item) => (
            <button
              key={item.id}
              className={preset.id === item.id ? 'active' : ''}
              onClick={() => { setPresetId(item.id); setStep(0); }}
              aria-pressed={preset.id === item.id}
            >
              <strong>{item.name}</strong>
              <span>{item.graph.nodes.length} 点 · {item.graph.edges.length} 边</span>
            </button>
          ))}
        </div>
        <p className="ch08-preset-description">{preset.description}</p>
        </>}
      </section>
      {mode === 'huffman' ? <Chapter08HuffmanLab onComplete={onComplete} /> : <>
        <div className="lab-workspace ch08-main-workspace">
          <section className="visualization-panel" aria-label="特殊图可视化">
            <div className="panel-heading">
              <h3>{mode === 'kruskal' ? 'Kruskal 选边与成环高亮' : '奇度顶点与连通性'}</h3>
              <small>{preset.name} · 无向带权图</small>
            </div>
            <div className="ch08-graph-overview" data-decision={mode === 'kruskal' ? snapshot.decision : 'euler'}>
              <div className="ch08-graph-phase"><i aria-hidden="true" /><div><strong>{graphStatus}</strong><span>{graphHint}</span></div></div>
              <div className="ch08-graph-metrics">
                <span>{mode === 'kruskal' ? '已选边' : '顶点'}<strong>{mode === 'kruskal' ? `${accepted.size} / ${preset.graph.nodes.length - 1}` : preset.graph.nodes.length}</strong></span>
                <span>{mode === 'kruskal' ? '总权重' : '边数'}<strong>{mode === 'kruskal' ? snapshot.totalWeight : preset.graph.edges.length}</strong></span>
              </div>
            </div>
            <div className="ch08-graph-stage">
            <svg className="svg-lab ch08-graph" data-preset={preset.id} data-decision={mode === 'kruskal' ? snapshot.decision : 'euler'} viewBox="0 0 560 420" role="img" aria-label={`${preset.name}，${mode === 'kruskal' ? snapshot.title : euler.reason}`}>
              <title>{preset.name}</title>
              <desc>边上的数字为权重。实线加勾表示已接受，虚线加叉表示已拒绝；下方状态条显示各顶点当前的根或度数。</desc>
              {[...graphEdges].sort((a, b) => a.layer - b.layer).map(({ edge, classes, isAccepted, isRejected }) => {
                const a = POSITIONS[preset.id][edge.u];
                const b = POSITIONS[preset.id][edge.v];
                return (
                  <g key={edge.id} className={`ch08-edge${classes}`} data-edge={edge.id}>
                    <title>{`${edge.u}—${edge.v}，权 ${edge.weight}${isAccepted ? '，已接受' : ''}${isRejected ? '，已拒绝' : ''}`}</title>
                    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
                  </g>
                );
              })}
              {graphEdges.map(({ edge, classes, isAccepted, isRejected }) => {
                const label = edgeLabelPoint(preset.id, edge);
                const marked = isAccepted || isRejected;
                const width = marked ? 44 : 34;
                return <g key={edge.id} className={`ch08-edge-label${classes}`} data-edge={edge.id}>
                  <rect className="ch08-weight-halo" x={label.x - width / 2 - 3} y={label.y - 16} width={width + 6} height="32" rx="10" />
                  <rect className="ch08-weight-bg" x={label.x - width / 2} y={label.y - 13} width={width} height="26" rx="7" />
                  {marked && <text className="ch08-weight-mark" textAnchor="middle" x={label.x - 10} y={label.y + 5}>{isAccepted ? '✓' : '×'}</text>}
                  <text className="ch08-weight" x={label.x + (marked ? 7 : 0)} y={label.y + 5}>{edge.weight}</text>
                </g>;
              })}
              {preset.graph.nodes.map((node) => {
                const point = POSITIONS[preset.id][node];
                const isEndpoint = mode === 'kruskal'
                  && (snapshot.currentEdge?.u === node || snapshot.currentEdge?.v === node);
                const isOdd = mode === 'euler' && euler.oddNodes.includes(node);
                const state = mode === 'euler'
                  ? `${euler.degrees[node]} 度 · ${euler.degrees[node] === 0 ? '孤立' : isOdd ? '奇度' : '偶度'}`
                  : `根 ${rootFromParent(snapshot.parent, node)}`;
                return (
                  <g key={node} className={`ch08-node${isEndpoint ? ' is-endpoint' : ''}${isOdd ? ' is-odd' : ''}${accepted.size > 0 && snapshot.components.some((component) => component.length > 1 && component.includes(node)) ? ' is-connected' : ''}`} data-node={node} transform={`translate(${point.x} ${point.y})`}>
                    <title>{`${node}，${state}${isEndpoint ? '，当前边端点' : ''}`}</title>
                    <circle className="ch08-node-halo" r="32" />
                    {isEndpoint && <circle className="ch08-endpoint-ring" r="34" />}
                    {isOdd && <path className="ch08-odd-diamond" d="M 0 -40 L 6 -34 L 0 -28 L -6 -34 Z" />}
                    <circle className="ch08-node-circle" r="25" />
                    <text className="ch08-node-label" textAnchor="middle" y="6">{node}</text>
                  </g>
                );
              })}
            </svg>
            </div>
            <div className="ch08-node-key" data-decision={mode === 'kruskal' ? snapshot.decision : 'euler'}>
              <span>{mode === 'kruskal' ? '当前根' : '顶点度数'}</span>
              <div className="ch08-node-chips">{preset.graph.nodes.map((node) => <span key={node} className="ch08-node-chip" data-endpoint={mode === 'kruskal' && (snapshot.currentEdge?.u === node || snapshot.currentEdge?.v === node)} data-odd={mode === 'euler' && euler.oddNodes.includes(node)}>
                <strong>{node}</strong><span aria-hidden="true">{mode === 'kruskal' ? '→' : '·'}</span><span>{mode === 'kruskal' ? rootFromParent(snapshot.parent, node) : `${euler.degrees[node]}度`}</span>
              </span>)}</div>
            </div>
            {mode === 'kruskal' ? (
              <>
                <div className="legend" aria-label="Kruskal 图例">
                  <span className="legend-item"><i className="ch08-legend-accepted">✓</i>接受边：实线加勾</span>
                  <span className="legend-item"><i className="ch08-legend-rejected">×</i>拒绝边：虚线加叉</span>
                  <span className="legend-item"><i className="ch08-legend-cycle" />成环依据：橙色虚线</span>
                </div>
                <div className={`callout${snapshot.cycleEdges.length > 0 ? ' warning' : ''}`}>
                  {snapshot.cycleEdges.length > 0
                    ? `成环依据：已选路径 ${snapshot.cyclePath.join(' → ')}，再闭合当前候选边。`
                    : '并查集用父指针表示分量；接受边会合并根，拒绝边不会改变总权。'}
                </div>
              </>
            ) : (
              <>
                <div className="legend" aria-label="欧拉图例">
                  <span className="legend-item"><i className="ch08-legend-odd" />奇度：菱形加文字</span>
                  <span className="legend-item"><i className="ch08-legend-even" />偶度：圆形加文字</span>
                </div>
                <div className="callout">欧拉回路／通路要求每条边恰好经过一次，不是每个顶点恰好一次；顶点可以重复经过，孤立点不影响有边部分的判定。</div>
              </>
            )}
          </section>
          {mode === 'kruskal' ? <div className="lab-column ch08-playback"><StepPlayer
                key={preset.id}
                steps={playerSteps}
                current={currentIndex}
                onChange={setStep}
                onComplete={onComplete}
                label="Kruskal 与并查集完整步骤"
              /><section className="control-panel" aria-label="Kruskal 同步伪代码">
                <div className="panel-heading"><h3>同步伪代码</h3><small>当前第 {snapshot.line} 行</small></div>
                <ol className="ch08-pseudocode">
                  {CH8_KRUSKAL_PSEUDOCODE.map((code, index) => (
                    <li key={code} className={snapshot.line === index + 1 ? 'active' : ''}><span>{code}</span></li>
                  ))}
                </ol>
              </section></div> : <section className="math-panel" aria-label="欧拉性判定">
                <div className="panel-heading"><h3>先看有边部分连通，再数奇度顶点</h3><small>无向图充要条件</small></div>
                <Formula className="ch08-euler-rule" tex={'\\begin{gathered}\\text{有边部分连通}\\\\|\\mathrm{Odd}|=0\\Rightarrow\\text{欧拉回路}\\end{gathered}'} />
                <Formula className="ch08-euler-rule" tex={'\\begin{gathered}\\text{有边部分连通}\\\\|\\mathrm{Odd}|=2\\Rightarrow\\text{欧拉通路（非回路）}\\end{gathered}'} />
                <div className="readout-grid">
                  <div className="readout-item"><span>有边部分连通</span><strong>{euler.connected ? '是' : '否'}</strong></div>
                  <div className="readout-item"><span>奇度顶点</span><strong>{euler.oddNodes.join('、') || '无'}</strong></div>
                  <div className="readout-item"><span>奇度数量</span><strong>{euler.oddNodes.length}</strong></div>
                  <div className="readout-item"><span>判定结果</span><strong>{euler.kind === 'circuit' ? '欧拉回路' : euler.kind === 'path' ? '欧拉通路' : '均不存在'}</strong></div>
                </div>
                <p className="ch08-euler-reason">{euler.reason}</p>
                <div className="ch08-table-scroll" tabIndex={0} role="region" aria-label="顶点度数与奇偶性表，可横向滚动">
                  <table className="data-table">
                    <caption className="ch08-sr-only">各顶点度数和奇偶性</caption>
                    <thead><tr><th>顶点</th><th>度数</th><th>奇偶／角色</th></tr></thead>
                    <tbody>
                      {preset.graph.nodes.map((node) => (
                        <tr key={node} className={euler.oddNodes.includes(node) ? 'is-odd' : ''}>
                          <th scope="row">{node}</th><td>{euler.degrees[node]}</td>
                          <td>{euler.degrees[node] === 0 ? '孤立点' : euler.oddNodes.includes(node) ? (euler.kind === 'path' ? '奇度 · 通路端点' : '奇度') : '偶度'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>}
        </div>
        {mode === 'kruskal' ? <div className="ch08-results-grid"><section className="data-panel" aria-label="边排序与决策表">
              <div className="panel-heading"><h3>边权排序与逐项决策</h3><small>同权按端点字母序</small></div>
              <div className="ch08-table-scroll" tabIndex={0} role="region" aria-label="边排序与决策表，可横向滚动">
                <table className="data-table">
                  <caption className="ch08-sr-only">Kruskal 的排序边、当前考察、接受和拒绝状态</caption>
                  <thead><tr><th>次序</th><th>边</th><th>权重</th><th>决策</th></tr></thead>
                  <tbody>
                    {sortedEdges.map((edge, index) => {
                      const isCurrent = snapshot.currentEdge?.id === edge.id;
                      const decision = accepted.has(edge.id) ? '✓ 接受' : rejected.has(edge.id) ? '× 拒绝（成环）' : isCurrent ? '考察中' : '待考察';
                      return (
                        <tr key={edge.id} className={`${isCurrent ? 'is-current' : ''}${accepted.has(edge.id) ? ' is-accepted' : ''}${rejected.has(edge.id) ? ' is-rejected' : ''}`}>
                          <td>{index + 1}</td><th scope="row">{edge.u}—{edge.v}</th><td>{edge.weight}</td><td>{decision}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section><section className="math-panel" aria-label="并查集快照">
                <div className="panel-heading"><h3>并查集父指针</h3><small>按秩合并 · find 路径压缩</small></div>
                <div className="readout-grid ch08-kruskal-stats">
                  <div className="readout-item"><span>已接受</span><strong>{snapshot.accepted.length}</strong></div>
                  <div className="readout-item"><span>已拒绝</span><strong>{snapshot.rejected.length}</strong></div>
                  <div className="readout-item"><span>累计权重</span><strong>{snapshot.totalWeight}</strong></div>
                  <div className="readout-item"><span>分量数</span><strong>{snapshot.components.length}</strong></div>
                </div>
                <div className="ch08-components">
                  <span>当前分量</span>
                  {snapshot.components.map((component) => <strong key={component.join('-')}>{component.join(' · ')}</strong>)}
                </div>
                <div className="ch08-table-scroll" tabIndex={0} role="region" aria-label="并查集父指针表，可横向滚动">
                  <table className="data-table">
                    <caption className="ch08-sr-only">每个顶点的父指针、秩与当前根</caption>
                    <thead><tr><th>顶点</th><th>parent</th><th>rank</th><th>当前根</th></tr></thead>
                    <tbody>
                      {preset.graph.nodes.map((node) => (
                        <tr key={node}>
                          <th scope="row">{node}</th><td>{snapshot.parent[node]}</td><td>{snapshot.rank[node]}</td><td>{rootFromParent(snapshot.parent, node)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Formula tex={`W=\\sum_{e\\in T}w(e)=${snapshot.totalWeight}`} />
              </section></div> : <>
          <section className="data-panel" aria-label="实际欧拉边序列">
                <div className="panel-heading"><h3>一条实际欧拉边序列</h3><small>按边走，而非按点计数</small></div>
                {euler.trail ? (
                  <>
                    <p className="ch08-trail-summary">
                      {euler.kind === 'circuit' ? '闭合回路' : '开放通路'}：走过 {euler.trail.edgeIds.length} / {preset.graph.edges.length} 条边，每条恰好一次；顶点序列可含重复顶点。
                    </p>
                    <div className="ch08-trail-vertices" aria-label="欧拉顶点序列">
                      {euler.trail.vertices.map((node, index) => <span key={`${node}-${index}`}>{node}</span>)}
                    </div>
                    <div className="ch08-table-scroll" tabIndex={0} role="region" aria-label="欧拉边序列表，可横向滚动">
                      <table className="data-table">
                        <caption className="ch08-sr-only">欧拉路线依次使用的无向边及行走方向</caption>
                        <thead><tr><th>走边次序</th><th>方向</th><th>边</th><th>权</th></tr></thead>
                        <tbody>
                          {euler.trail.edgeIds.map((edgeId, index) => {
                            const edge = preset.graph.edges.find((item) => item.id === edgeId) as GraphEdge;
                            return (
                              <tr key={edgeId}><td>{index + 1}</td><td>{euler.trail?.vertices[index]} → {euler.trail?.vertices[index + 1]}</td><td>{edge.u}—{edge.v}</td><td>{edge.weight}</td></tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : <p className="ch08-no-trail">当前图不满足连通与奇度条件，无法给出走遍所有边的欧拉回路或通路。请切换其他预设对照。</p>}
              </section>
          <button className="completion-button" onClick={onComplete}>完成欧拉性实验</button>
        </>}
        {mode === 'kruskal' && <p className="fallback-note">每条边先显示 find 结果，再保存接受／拒绝后的新快照；“上一步”恢复此前的父指针、秩、分量和总权。</p>}
      </>}
    </div>
  );
}
