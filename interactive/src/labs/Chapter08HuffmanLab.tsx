import { useMemo, useRef, useState } from 'react';
import { Formula } from '../components/Formula';
import { StepPlayer } from '../components/StepPlayer';
import type { LabProps } from '../types';
import {
  CH8_HUFFMAN_SYMBOLS,
  generateHuffmanSteps,
  huffmanMetrics,
  huffmanTreeLayout,
} from '../lib/ch08-huffman';
import './Chapter08HuffmanLab.css';

export default function Chapter08HuffmanLab({ onComplete }: LabProps) {
  const [weights, setWeights] = useState(CH8_HUFFMAN_SYMBOLS.map((item) => item.weight));
  const [step, setStep] = useState(0);
  const [treeZoomed, setTreeZoomed] = useState(false);
  const treeViewport = useRef<HTMLDivElement>(null);
  const symbols = useMemo(() => CH8_HUFFMAN_SYMBOLS.map((item, index) => ({
    symbol: item.symbol,
    weight: weights[index],
  })), [weights]);
  const steps = useMemo(() => generateHuffmanSteps(symbols), [symbols]);
  const snapshot = steps[Math.min(step, steps.length - 1)];
  const finalCodes = steps[steps.length - 1].codes;
  const metrics = useMemo(() => huffmanMetrics(symbols, finalCodes), [symbols, finalCodes]);
  const playerSteps = useMemo(() => steps.map((item, index) => ({
    label: item.kind === 'init' ? '初始化' : item.kind === 'done' ? '构造完成' : `第 ${Math.floor((index - 1) / 2) + 1} 次合并`,
    title: item.title,
    explanation: item.explanation,
    formula: item.formula,
  })), [steps]);

  // 用最终树确定叶子左右次序，回放时所有已有节点位置稳定，左右分支不交叉。
  const layout = useMemo(() => {
    const final = steps[steps.length - 1];
    return huffmanTreeLayout(final.nodes, final.queue);
  }, [steps]);
  // Keep the forest readable before internal nodes exist, then reveal the
  // growing tree without changing its final left-to-right leaf order.
  const visiblePoints = Object.keys(snapshot.nodes).map((id) => layout[id]);
  const treeTop = Math.max(0, Math.min(...visiblePoints.map((point) => point.y)) - 58);
  const treeHeight = Math.max(150, Math.max(...visiblePoints.map((point) => point.y)) + 58 - treeTop);
  const branches = Object.values(snapshot.nodes).flatMap((node) => ([node.left, node.right] as const).flatMap((child, bit) => {
    if (!child) return [];
    return [{ id: `${node.id}-${child}`, from: layout[node.id], to: layout[child], bit, created: snapshot.created === node.id }];
  }));
  const selectedNames = snapshot.selected?.map((id) => {
    const node = snapshot.nodes[id];
    return `${node.symbol ?? '树'}（${node.weight}）`;
  }).join(' + ');

  const updateWeight = (index: number, weight: number) => {
    setWeights((current) => current.map((value, itemIndex) => itemIndex === index ? weight : value));
    setStep(0);
    setTreeZoomed(false);
    treeViewport.current?.scrollTo({ left: 0, top: 0 });
  };
  const toggleTreeZoom = () => {
    const next = !treeZoomed;
    setTreeZoomed(next);
    window.requestAnimationFrame(() => {
      const viewport = treeViewport.current;
      if (!viewport) return;
      const root = snapshot.queue.length === 1 ? layout[snapshot.queue[0]] : null;
      viewport.scrollTo({ left: next ? Math.max(0, (root?.x ?? 380) - viewport.clientWidth / 2) : 0, top: 0 });
    });
  };

  const scale = (bits: number) => bits * 10000 / metrics.totalWeight;

  return (
    <div className="ch08-huffman">
      <section className="control-panel ch08-huffman-controls" aria-label="Huffman 符号权重设置">
        <div className="panel-heading">
          <div><h3>符号频率就是叶子权重</h3><small>修改权重会回到初始快照 · 默认例子来自原书 8.2 节</small></div>
          <button className="text-button" onClick={() => { setWeights(CH8_HUFFMAN_SYMBOLS.map((item) => item.weight)); setStep(0); setTreeZoomed(false); treeViewport.current?.scrollTo({ left: 0, top: 0 }); }}>恢复原书频率</button>
        </div>
        <div className="ch08-frequency-grid">
          {symbols.map((item, index) => (
            <label key={item.symbol} htmlFor={`ch08-frequency-${item.symbol}`}>
              <span><strong>{item.symbol}</strong><output>{item.weight}</output></span>
              <input
                id={`ch08-frequency-${item.symbol}`}
                type="range"
                min="1"
                max="50"
                value={item.weight}
                onChange={(event) => updateWeight(index, Number(event.target.value))}
              />
            </label>
          ))}
        </div>
        <p className="ch08-mode-note">权重只需是正数，不必凑成 100。默认总权为 100，因此也可直接读作百分比；比较时统一换算到 10,000 个符号。</p>
      </section>
      <div className="lab-workspace ch08-huffman-workspace">
        <section className="visualization-panel" aria-label="Huffman 树逐步构造">
            <div className="panel-heading"><h3>合并两个最小权节点</h3><small>左分支 0 · 右分支 1 · 森林逐渐合为一棵树</small></div>
            <div className="ch08-huffman-overview" data-kind={snapshot.kind}>
              <span><i aria-hidden="true" /><strong>{snapshot.kind === 'done' ? '前缀编码树已完成' : snapshot.created ? `新节点权重 ${snapshot.nodes[snapshot.created].weight}` : snapshot.selected ? '取出当前最小的两棵树' : '初始森林'}</strong><small>{snapshot.kind === 'done' ? '从根沿 0 / 1 分支读取每个符号的码字' : snapshot.created ? '绿色节点为本次新建父节点' : selectedNames || '每个符号先形成一棵独立的树'}</small></span>
              <span className="ch08-huffman-tree-count"><small>当前树数</small><strong>{snapshot.queue.length}</strong></span>
            </div>
            <div className="ch08-huffman-view-tools"><p>{treeZoomed ? '左右滑动查看细节，点击“完整显示”回到整棵树。' : '完整显示全部节点；放大后可横向查看细节。'}</p><button type="button" className="mini-button" aria-pressed={treeZoomed} onClick={toggleTreeZoom}>{treeZoomed ? '完整显示' : '放大图形'}</button></div>
            <div ref={treeViewport} className="ch08-huffman-tree-scroll diagram-stage" data-zoomed={treeZoomed} tabIndex={0} role="region" aria-label={treeZoomed ? 'Huffman 树，放大后可横向滚动' : 'Huffman 树，完整显示全部拓扑'}>
            <svg className="svg-lab ch08-huffman-tree" data-kind={snapshot.kind} viewBox={`0 ${treeTop} 760 ${treeHeight}`} role="img" aria-label={`${snapshot.title}。当前队列 ${snapshot.queue.length} 棵树。`}>
              <title>Huffman 前缀编码树</title>
              {branches.map(({ id, from, to, created }) => <g key={id} className={`ch08-huffman-branch${created ? ' is-created' : ''}`}>
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
              </g>)}
              {branches.map(({ id, from, to, bit, created }) => {
                const x = (from.x + to.x) / 2;
                const y = (from.y + to.y) / 2;
                return <g key={id} className={`ch08-huffman-branch-label${created ? ' is-created' : ''}`}>
                  <rect className="ch08-huffman-bit-halo" x={x - 14} y={y - 14} width="28" height="28" rx="9" />
                  <rect x={x - 10} y={y - 10} width="20" height="20" rx="6" />
                  <text x={x} y={y + 4} textAnchor="middle">{bit}</text>
                </g>;
              })}
              {Object.values(snapshot.nodes).map((node) => {
                const id = node.id;
                const queueIndex = snapshot.queue.indexOf(id);
                const selected = snapshot.selected?.includes(id) ?? false;
                const created = snapshot.created === id;
                const point = layout[id];
                return (
                  <g key={id} className={`ch08-huffman-node${selected ? ' is-selected' : ''}${created ? ' is-created' : ''}`} transform={`translate(${point.x} ${point.y})`}>
                    <title>{`${node.symbol ?? '内部节点'}，权重 ${node.weight}${created ? '，本次新建' : selected ? '，本次取出' : queueIndex >= 0 ? `，队列第 ${queueIndex + 1} 项` : '，已合并到上层树'}`}</title>
                    <circle className="ch08-huffman-node-halo" r="30" />
                    {selected && <circle className="ch08-huffman-selection" r="30" />}
                    <circle className="ch08-huffman-node-circle" r="23" />
                    <text className="ch08-huffman-node-name" textAnchor="middle" y="-5">{node.symbol ?? '∪'}</text>
                    <text className="ch08-huffman-node-weight" textAnchor="middle" y="13">{node.weight}</text>
                  </g>
                );
              })}
            </svg>
            </div>
            <div className="legend" aria-label="Huffman 图例">
              <span className="legend-item"><i className="ch08-huffman-legend-selected">①</i>本次取出的最小权树</span>
              <span className="legend-item"><i className="ch08-huffman-legend-created">∪</i>新建父节点</span>
            </div>
            <div className="callout">相同权按创建顺序决胜，所以演示可复现。其他同权合并次序可能产生不同码字，但不会改变最优 WPL。</div>
          </section>
        <div className="lab-column ch08-huffman-playback"><StepPlayer
            key={weights.join('-')}
            steps={playerSteps}
            current={Math.min(step, steps.length - 1)}
            onChange={setStep}
            onComplete={onComplete}
            label="Huffman 构造完整步骤"
          /><section className="data-panel" aria-label="Huffman 优先队列">
            <div className="panel-heading"><h3>当前优先队列</h3><small>权重升序 · 同权按创建顺序</small></div>
            <div className="ch08-huffman-queue">
              {snapshot.queue.map((id) => {
                const node = snapshot.nodes[id];
                return <span key={id} className={snapshot.selected?.includes(id) ? 'is-selected' : ''}><strong>{node.symbol ?? '内部树'}</strong><small>w={node.weight}</small></span>;
              })}
            </div>
          </section></div>
      </div>
      <div className="ch08-huffman-results"><section className="data-panel" aria-label="Huffman 前缀码表">
        <div className="panel-heading"><h3>从根到叶读取 0 / 1</h3><small>{snapshot.kind === 'done' ? '任意码字都不是另一个码字的前缀' : '构造中显示当前分支路径；完整码以最后一步为准'}</small></div>
        <div className="ch08-table-scroll" tabIndex={0} role="region" aria-label="Huffman 前缀码表，可横向滚动">
          <table className="data-table">
            <caption className="ch08-sr-only">各符号的权重、当前路径、最终码长和带权代价</caption>
            <thead><tr><th>符号</th><th>权重</th><th>{snapshot.kind === 'done' ? '前缀码' : '当前路径（未完成）'}</th><th>最终码长</th><th>wᵢ × ℓᵢ</th></tr></thead>
            <tbody>
              {symbols.map((item) => (
                <tr key={item.symbol}>
                  <th scope="row">{item.symbol}</th><td>{item.weight}</td>
                  <td><code>{snapshot.kind === 'done' ? snapshot.codes[item.symbol] : snapshot.codes[item.symbol] || '待连接'}</code></td>
                  <td>{finalCodes[item.symbol].length}</td><td>{item.weight * finalCodes[item.symbol].length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section><section className="math-panel" aria-label="Huffman 代价与压缩效果">
            <div className="panel-heading"><h3>合并代价就是最优带权路径长度</h3><small>每次新节点权计入一次</small></div>
            <Formula tex={snapshot.kind === 'done'
              ? `WPL=\\sum_i w_i\\ell_i=${snapshot.totalCost}`
              : `C_{\\text{累计合并权}}=${snapshot.totalCost}`} />
            <div className="readout-grid">
              <div className="readout-item"><span>当前树数</span><strong>{snapshot.queue.length}</strong></div>
              <div className="readout-item"><span>{snapshot.kind === 'done' ? '最终 WPL' : '累计合并权'}</span><strong>{snapshot.totalCost}</strong></div>
              <div className="readout-item"><span>最终平均码长</span><strong>{snapshot.kind === 'done' ? `${metrics.averageLength.toFixed(3)} 位` : '完成后计算'}</strong></div>
              <div className="readout-item"><span>等长码需要</span><strong>{metrics.fixedWidth} 位 / 符号</strong></div>
            </div>
            <div className="ch08-compression-compare" aria-label="按当前权重比例折算到 10,000 个符号的编码位数对比">
              <div><span>等长 {metrics.fixedWidth} 位码</span><i><b style={{ width: `${Math.min(100, metrics.fixedLength / Math.max(metrics.fixedLength, metrics.weightedPathLength) * 100)}%` }} /></i><strong>{scale(metrics.fixedLength).toLocaleString('zh-CN')} 位</strong></div>
              <div><span>Huffman 前缀码</span><i><b style={{ width: `${Math.min(100, metrics.weightedPathLength / Math.max(metrics.fixedLength, metrics.weightedPathLength) * 100)}%` }} /></i><strong>{scale(metrics.weightedPathLength).toLocaleString('zh-CN')} 位</strong></div>
            </div>
            <p className="ch08-saving">最终可少 {scale(metrics.savedBits).toLocaleString('zh-CN')} 位；默认原书例子为 30,000 → 27,400 位，节省 2,600 位。</p>
          </section></div>
      <p className="fallback-note">“上一步”恢复当时的森林、队列、选中节点、部分路径和累计合并权；不会只撤销一条连线。</p>
    </div>
  );
}
