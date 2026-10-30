import { useMemo, useState } from 'react';
import { Formula } from '../components/Formula';
import { StepPlayer } from '../components/StepPlayer';
import type { LabProps } from '../types';
import {
  CH7_GRAPH,
  CH7_PSEUDOCODE,
  formatDistance,
  generateTraversalSteps,
  pathFromPredecessors,
  type TraversalMode,
  type TraversalSnapshot,
} from '../lib/ch07';
import './Chapter07Lab.css';

const POSITIONS: Record<string, { x: number; y: number }> = {
  A: { x: 75, y: 210 },
  B: { x: 210, y: 70 },
  C: { x: 210, y: 345 },
  D: { x: 475, y: 320 },
  E: { x: 475, y: 95 },
};

const MODE_NOTES: Record<TraversalMode, string> = {
  bfs: 'BFS 按层推进，距离表记录最少边数；本图边权不参与 BFS 的距离计算。',
  dfs: 'DFS 沿分支深入再回溯，距离表记录 DFS 树深度；它不保证最少边数或最小权路径。',
  dijkstra: 'Dijkstra 的距离是路径边权之和，只适用于非负权图；本固定图的 7 条边权均为正数。',
};

const MODE_FORMULAS: Record<TraversalMode, string> = {
  bfs: 'd(v)=d(u)+1\\quad(\\text{按边数计距})',
  dfs: 'd(v)=d(u)+1\\quad(\\text{DFS 树深度})',
  dijkstra: 'd(v)\\leftarrow\\min\\{d(v),d(u)+w(u,v)\\}\\quad(w\\geq 0)',
};

function nodeState(snapshot: TraversalSnapshot, node: string): string {
  if (snapshot.current === node) return '当前';
  if (snapshot.visited.includes(node)) return snapshot.mode === 'dijkstra' ? '已确定' : '已访问';
  if (snapshot.frontier.includes(node)) return snapshot.mode === 'dijkstra' ? '待确定' : '待处理';
  if (snapshot.discovered.includes(node)) return '已发现';
  return '未发现';
}

export default function Chapter07Lab({ onComplete }: LabProps) {
  const [mode, setMode] = useState<TraversalMode>('bfs');
  const [start, setStart] = useState('A');
  const [target, setTarget] = useState('E');
  const [step, setStep] = useState(0);
  const snapshots = useMemo(
    () => generateTraversalSteps(CH7_GRAPH, mode, start),
    [mode, start],
  );
  const currentIndex = Math.min(step, snapshots.length - 1);
  const snapshot = snapshots[currentIndex];
  const playerSteps = useMemo(() => snapshots.map((item) => ({
    label: `伪代码第 ${item.line} 行`,
    title: item.title,
    explanation: item.explanation,
    formula: item.formula,
  })), [snapshots]);
  const predecessorEdges = new Set(CH7_GRAPH.edges.filter((edge) => (
    snapshot.predecessors[edge.u] === edge.v || snapshot.predecessors[edge.v] === edge.u
  )).map((edge) => edge.id));
  const graphEdges = CH7_GRAPH.edges.map((edge) => {
    const isCandidate = snapshot.candidate?.edgeId === edge.id;
    const isTree = predecessorEdges.has(edge.id);
    return { edge, isCandidate, isTree, classes: `${isCandidate ? ' is-candidate' : ''}${isTree ? ' is-tree' : ''}` };
  });
  const path = pathFromPredecessors(snapshot.predecessors, start, target);
  const frontierName = mode === 'bfs'
    ? '队列 Q（左队首，右队尾）'
    : mode === 'dfs'
      ? '栈 S（左栈底，右栈顶）'
      : '优先队列（距离、顶点字母升序）';

  const selectMode = (nextMode: TraversalMode) => {
    setMode(nextMode);
    setStep(0);
  };

  return (
    <div className="ch07-lab">
      <section className="control-panel ch07-setup" aria-label="遍历实验设置">
        <div className="panel-heading">
          <h3>实验设置</h3>
          <small>固定图 · 固定邻居字母序 · 全程快照</small>
        </div>
        <div className="lab-tabs" aria-label="选择算法">
          {(['bfs', 'dfs', 'dijkstra'] as TraversalMode[]).map((item) => (
            <button
              key={item}
              className={mode === item ? 'active' : ''}
              onClick={() => selectMode(item)}
              aria-pressed={mode === item}
            >
              {item === 'bfs' ? 'BFS 广度优先' : item === 'dfs' ? 'DFS 深度优先' : 'Dijkstra 最短路径'}
            </button>
          ))}
        </div>
        <div className="control-row">
          <label htmlFor="ch07-start">起点</label>
          <select
            id="ch07-start"
            value={start}
            onChange={(event) => { setStart(event.target.value); setStep(0); }}
          >
            {CH7_GRAPH.nodes.map((node) => <option key={node} value={node}>{node}</option>)}
          </select>
          <label htmlFor="ch07-target">路径还原目标</label>
          <select id="ch07-target" value={target} onChange={(event) => setTarget(event.target.value)}>
            {CH7_GRAPH.nodes.map((node) => <option key={node} value={node}>{node}</option>)}
          </select>
          <span className="ch07-order-note">也可点击图中顶点更换起点</span>
        </div>
        <p className="ch07-mode-note">{MODE_NOTES[mode]}</p>
      </section>
      <div className="lab-workspace ch07-main-workspace">
        <section className="visualization-panel" aria-label="图算法同步视图">
            <div className="panel-heading">
              <h3>固定带权无向图</h3>
              <small>5 个顶点 · 7 条边 · 点击顶点可换起点</small>
            </div>
            <div className="ch07-graph-overview">
              <div><strong>{mode === 'bfs' ? 'BFS 广度优先' : mode === 'dfs' ? 'DFS 深度优先' : 'Dijkstra 最短路径'}</strong><span>{snapshot.candidate ? `当前边 ${snapshot.candidate.u}—${snapshot.candidate.v} · 权重 ${snapshot.candidate.weight}` : snapshot.kind === 'done' ? '本轮遍历已完成' : snapshot.current ? `当前顶点 ${snapshot.current}` : `起点 ${start} · 等待处理`}</span></div>
              <div className="ch07-graph-metrics"><span>{mode === 'dijkstra' ? '已确定' : '已访问'}<strong>{snapshot.visited.length} / {CH7_GRAPH.nodes.length}</strong></span><span>待处理<strong>{snapshot.frontier.length}</strong></span></div>
            </div>
            <div className="diagram-stage ch07-graph-stage">
            <svg className="svg-lab ch07-graph" data-kind={snapshot.kind} viewBox="0 0 560 420" role="group" aria-label="带权无向图；顶点可点击设为起点">
              <title>原书 Dijkstra 示例的固定带权无向图</title>
              <desc>蓝灰色为普通边，绿色实线加勾为当前前驱树，橙色虚线为当前考察边。各顶点状态列在图下方。</desc>
              {[...graphEdges].sort((a, b) => Number(a.isCandidate) - Number(b.isCandidate) || Number(a.isTree) - Number(b.isTree)).map(({edge, isCandidate, isTree, classes}) => {
                const a = POSITIONS[edge.u];
                const b = POSITIONS[edge.v];
                return (
                  <g
                    key={edge.id}
                    className={`ch07-edge${classes}`}
                    data-edge={edge.id}
                  >
                    <title>{`${edge.u}—${edge.v}，权重 ${edge.weight}${isCandidate ? '，当前考察' : ''}${isTree ? '，当前前驱树边' : ''}`}</title>
                    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
                  </g>
                );
              })}
              {graphEdges.map(({edge, isTree, classes}) => {
                const a = POSITIONS[edge.u], b = POSITIONS[edge.v];
                const x = (a.x + b.x) / 2, y = (a.y + b.y) / 2, width = isTree ? 44 : 34;
                return <g key={edge.id} className={`ch07-edge-label${classes}`} data-edge={edge.id}>
                  <rect className="ch07-weight-halo" x={x - width / 2 - 3} y={y - 16} width={width + 6} height="32" rx="10" />
                  <rect className="ch07-weight-bg" x={x - width / 2} y={y - 13} width={width} height="26" rx="7" />
                  {isTree && <text className="ch07-weight-mark" x={x - 10} y={y + 5} textAnchor="middle">✓</text>}
                  <text className="ch07-weight" x={x + (isTree ? 7 : 0)} y={y + 5}>{edge.weight}</text>
                </g>;
              })}
              {CH7_GRAPH.nodes.map((node) => {
                const point = POSITIONS[node];
                const state = nodeState(snapshot, node);
                const isCurrent = snapshot.current === node;
                const isVisited = snapshot.visited.includes(node);
                const isFrontier = snapshot.frontier.includes(node);
                return (
                  <g
                    key={node}
                    className={`ch07-node${isCurrent ? ' is-current' : ''}${isVisited ? ' is-visited' : ''}${isFrontier ? ' is-frontier' : ''}`}
                    data-node={node}
                    transform={`translate(${point.x} ${point.y})`}
                    role="button"
                    tabIndex={0}
                    aria-label={`顶点 ${node}，${state}；设为起点`}
                    onClick={() => { setStart(node); setStep(0); }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setStart(node);
                        setStep(0);
                      }
                    }}
                  >
                    <circle className="ch07-node-halo" r="32" />
                    {isCurrent && <circle className="ch07-current-ring" r="34" />}
                    <circle className="ch07-node-circle" r="25" />
                    {isCurrent && <path className="ch07-current-diamond" d="M 0 -42 L 5 -37 L 0 -32 L -5 -37 Z" />}
                    <text className="ch07-node-label" textAnchor="middle" y="6">{node}</text>
                    {isVisited && !isCurrent && <><circle className="ch07-visited-badge" cx="21" cy="-20" r="8" /><text className="ch07-visited-mark" x="21" y="-16" textAnchor="middle">✓</text></>}
                    {isFrontier && !isVisited && !isCurrent && <circle className="ch07-frontier-dot" cx="21" cy="-20" r="5" />}
                  </g>
                );
              })}
            </svg>
            </div>
            <div className="ch07-node-key"><span>顶点状态{mode === 'dijkstra' ? ' · d 为当前距离' : ''}</span><div className="ch07-node-chips">{CH7_GRAPH.nodes.map((node) => <span className="ch07-node-chip" data-state={nodeState(snapshot,node)} key={node}><strong>{node}</strong><span>{nodeState(snapshot,node)}</span>{mode === 'dijkstra' && <small>d = {formatDistance(snapshot.distances[node])}</small>}</span>)}</div></div>
            <div className="legend" aria-label="图例">
              <span className="legend-item"><i className="ch07-legend-current" />当前：双环与菱形</span>
              <span className="legend-item"><i className="ch07-legend-visited">✓</i>已访问／已确定</span>
              <span className="legend-item"><i className="ch07-legend-frontier" />待处理：圆点</span>
              <span className="legend-item"><i className="ch07-legend-tree">✓</i>前驱树：实线加勾</span>
              <span className="legend-item"><i className="ch07-legend-candidate" />当前边：橙色虚线</span>
            </div>
          </section>
        <div className="lab-column ch07-playback"><StepPlayer
            key={`${mode}-${start}`}
            steps={playerSteps}
            current={currentIndex}
            onChange={setStep}
            onComplete={onComplete}
            label={`${mode === 'bfs' ? 'BFS' : mode === 'dfs' ? 'DFS' : 'Dijkstra'} 完整步骤`}
          /><section className="control-panel" aria-label="同步伪代码">
            <div className="panel-heading"><h3>同步伪代码</h3><small>当前第 {snapshot.line} 行</small></div>
            <ol className="ch07-pseudocode">
              {CH7_PSEUDOCODE[mode].map((code, index) => (
                <li key={code} className={snapshot.line === index + 1 ? 'active' : ''}>
                  <span>{code}</span>
                </li>
              ))}
            </ol>
          </section></div>
      </div>
      <div className="ch07-results-grid"><section className="data-panel" aria-label="当前数据结构">
            <div className="panel-heading">
              <h3>{frontierName}</h3>
              <small>与当前步骤快照一致</small>
            </div>
            <div className="ch07-sequence" aria-label={frontierName}>
              {snapshot.frontier.length > 0
                ? snapshot.frontier.map((node, index) => (
                  <span className="ch07-chip" key={`${node}-${index}`}>
                    {mode === 'dijkstra' ? `${node} (${formatDistance(snapshot.distances[node])})` : node}
                  </span>
                ))
                : <span className="muted">空</span>}
            </div>
            <div className="readout-grid">
              <div className="readout-item"><span>当前节点</span><strong>{snapshot.current ?? '—'}</strong></div>
              <div className="readout-item"><span>候选边</span><strong>{snapshot.candidate ? `${snapshot.candidate.u}—${snapshot.candidate.v}` : '—'}</strong></div>
              <div className="readout-item"><span>访问次序</span><strong>{snapshot.order.join(' → ') || '—'}</strong></div>
              <div className="readout-item"><span>待处理数量</span><strong>{snapshot.frontier.length}</strong></div>
            </div>
          <div className="ch07-path-readout">
              <span>由当前前驱表还原：{start} → {target}</span>
              <strong>{path.length > 0 ? path.join(' → ') : '当前尚不可达'}</strong>
              <small>{Number.isFinite(snapshot.distances[target]) ? `当前距离 ${formatDistance(snapshot.distances[target])}` : '当前距离 ∞'}</small>
            </div>
          </section><section className="math-panel" aria-label="距离与前驱表">
            <div className="panel-heading"><h3>距离表与前驱</h3><small>单位随算法口径变化</small></div>
            <Formula tex={MODE_FORMULAS[mode]} />
            <div className="ch07-table-scroll" tabIndex={0} role="region" aria-label="距离与前驱表，可横向滚动">
              <table className="data-table">
                <caption className="ch07-sr-only">当前快照的顶点距离、前驱和状态</caption>
                <thead><tr><th>顶点</th><th>距离</th><th>前驱</th><th>状态</th></tr></thead>
                <tbody>
                  {CH7_GRAPH.nodes.map((node) => (
                    <tr key={node} className={snapshot.changedNode === node ? 'is-changed' : ''}>
                      <th scope="row">{node}</th>
                      <td>{formatDistance(snapshot.distances[node])}</td>
                      <td>{snapshot.predecessors[node] ?? '—'}</td>
                      <td>{nodeState(snapshot, node)}{snapshot.changedNode === node ? ' · 刚更新' : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
          </section></div>
      <p className="fallback-note">“上一步”直接恢复前一个完整快照，包括数据结构、距离、前驱和高亮；不是将动画倒放。</p>
    </div>
  );
}
