import { Canvas, useThree, type ThreeEvent } from '@react-three/fiber';
import { Html, Line, OrbitControls } from '@react-three/drei';
import { RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ComponentRef, type RefObject } from 'react';
import { Color, Vector3 } from 'three';
import { Formula } from '../components/Formula';
import { useLabActive } from '../components/LabActivity';
import { GraphicsBoundary, supportsWebGL2 } from '../components/GraphicsBoundary';
import type { LabProps } from '../types';
import {
  BOOLEAN_NODES,
  COVER_EDGES,
  SET_ELEMENTS,
  compareSubsets,
  relationEdges,
  subsetLabel,
  type CoverEdge,
  type CubePosition,
  type RelationEdges,
  type SubsetNode,
  type SubsetOperations,
} from '../lib/ch02';
import './Chapter02Lab.css';

type ViewMode = '3d' | '2d';
type CameraAction = 'left' | 'right' | 'zoom-in' | 'zoom-out';
interface CameraCommand { action: CameraAction; id: number }
type SelectionTarget = 'A' | 'B';
type EdgeTone = 'intersection' | 'union' | 'both' | null;

interface SceneColors {
  surface: string;
  ink: string;
  lineStrong: string;
  series1: string;
  series2: string;
  series3: string;
}

// Avoid looking along the body diagonal: the empty/full-set vertices must not overlap.
const INITIAL_CAMERA: CubePosition = [2.5, 4.65, 7.53];
const DEFAULT_COLORS: SceneColors = {
  surface: '#fcfcfb',
  ink: '#142330',
  lineStrong: '#c3c2b7',
  series1: '#2a78d6',
  series2: '#eb6834',
  series3: '#1baf7a',
};

function readSceneColors(): SceneColors {
  if (typeof document === 'undefined') return DEFAULT_COLORS;
  const styles = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback;
  return {
    surface: read('--surface', DEFAULT_COLORS.surface),
    ink: read('--ink', DEFAULT_COLORS.ink),
    lineStrong: new Color(read('--line-strong', DEFAULT_COLORS.lineStrong)).lerp(new Color(read('--series-1', DEFAULT_COLORS.series1)), 0.28).getStyle(),
    series1: read('--series-1', DEFAULT_COLORS.series1),
    series2: read('--series-2', DEFAULT_COLORS.series2),
    series3: read('--series-3', DEFAULT_COLORS.series3),
  };
}

function useSceneColors(): SceneColors {
  const [colors, setColors] = useState<SceneColors>(readSceneColors);
  useEffect(() => {
    const update = () => setColors(readSceneColors());
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class', 'style'] });
    return () => observer.disconnect();
  }, []);
  return colors;
}

function edgeTone(edge: CoverEdge, relations: RelationEdges): EdgeTone {
  const intersection = relations.intersection.some((item) => item.id === edge.id);
  const union = relations.union.some((item) => item.id === edge.id);
  if (intersection && union) return 'both';
  if (intersection) return 'intersection';
  if (union) return 'union';
  return null;
}

function nodeBadges(node: SubsetNode, a: number, b: number, operations: SubsetOperations): string {
  return [
    node.mask === a ? 'A' : '',
    node.mask === b ? 'B' : '',
    node.mask === operations.intersection ? '交' : '',
    node.mask === operations.union ? '并' : '',
  ].filter(Boolean).join('·');
}

function CameraControls({ resetToken, command }: { resetToken: number; command: CameraCommand | null }) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(...INITIAL_CAMERA);
    camera.lookAt(0, 0, 0);
    if (controls.current) {
      controls.current.target.set(0, 0, 0);
      controls.current.update();
    }
  }, [camera, resetToken]);
  useEffect(() => {
    if (!command) return;
    const target = controls.current?.target ?? new Vector3();
    const offset = camera.position.clone().sub(target);
    if (command.action === 'left' || command.action === 'right') {
      offset.applyAxisAngle(new Vector3(0, 1, 0), command.action === 'left' ? Math.PI / 12 : -Math.PI / 12);
    } else {
      const distance = offset.length();
      const factor = command.action === 'zoom-in' ? 0.85 : 1.18;
      offset.setLength(Math.min(13, Math.max(4, distance * factor)));
    }
    camera.position.copy(target).add(offset);
    camera.lookAt(target);
    controls.current?.update();
  }, [camera, command]);
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      enablePan={false}
      minDistance={4}
      maxDistance={13}
      rotateSpeed={0.65}
      zoomSpeed={0.75}
    />
  );
}

interface NodeMeshProps {
  node: SubsetNode;
  a: number;
  b: number;
  target: SelectionTarget;
  operations: SubsetOperations;
  colors: SceneColors;
  labelPortal: RefObject<HTMLElement>;
  onSelect: (mask: number) => void;
}

function BooleanNodeMesh({ node, a, b, target, operations, colors, labelPortal, onSelect }: NodeMeshProps) {
  const canvasHeight = useThree((state) => state.size.height);
  // Html scales independently of the canvas pixels; keep labels proportional on narrow scenes.
  const labelDistanceFactor = Math.min(8, (canvasHeight / 350) * 8);
  const selectedA = node.mask === a;
  const selectedB = node.mask === b;
  const intersection = node.mask === operations.intersection;
  const union = node.mask === operations.union;
  const badges = nodeBadges(node, a, b, operations);
  const materialColor = selectedA
    ? colors.series1
    : selectedB || union
      ? colors.series2
      : intersection
        ? colors.series3
        : colors.surface;
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(node.mask);
  };

  return (
    <group position={node.position} onClick={handleClick}>
      <mesh>
        {selectedB
          ? <boxGeometry args={[0.36, 0.36, 0.36]} />
          : intersection
            ? <octahedronGeometry args={[0.24, 0]} />
            : <sphereGeometry args={[0.215, 24, 24]} />}
        <meshStandardMaterial color={materialColor} roughness={0.52} metalness={0.04} />
      </mesh>
      {selectedA && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.32, 0.025, 8, 32]} />
          <meshBasicMaterial color={colors.series1} />
        </mesh>
      )}
      {union && (
        <mesh>
          <sphereGeometry args={[0.285, 12, 8]} />
          <meshBasicMaterial color={colors.series2} wireframe transparent opacity={0.8} />
        </mesh>
      )}
      <Html portal={labelPortal} position={[0, 0.38, 0]} center distanceFactor={labelDistanceFactor} zIndexRange={[20, 0]}>
        <button
          type="button"
          className={`ch02-scene-label ${selectedA ? 'selected-a' : ''} ${selectedB ? 'selected-b' : ''}`}
          onClick={(event) => { event.stopPropagation(); onSelect(node.mask); }}
          aria-label={`${node.label}${badges ? `，标记 ${badges}` : ''}，点击选择`}
          aria-pressed={target === 'A' ? selectedA : selectedB}
        >
          <span>{node.label}</span>{badges && <small>{badges}</small>}
        </button>
      </Html>
    </group>
  );
}

interface CubeSceneProps {
  a: number;
  b: number;
  target: SelectionTarget;
  operations: SubsetOperations;
  relations: RelationEdges;
  resetToken: number;
  command: CameraCommand | null;
  onSelect: (mask: number) => void;
}

function CubeScene({ a, b, target, operations, relations, resetToken, command, onSelect }: CubeSceneProps) {
  const active = useLabActive();
  const colors = useSceneColors();
  const labelPortal = useRef<HTMLDivElement>(null!);
  return (
    <div className="three-scene ch02-three-scene diagram-stage">
      <Canvas
        frameloop={active ? 'always' : 'never'}
        camera={{ position: INITIAL_CAMERA, fov: 42, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        aria-label="可旋转缩放的三维布尔立方体；拖动旋转，滚轮缩放，节点标签也可键盘选择"
      >
        <ambientLight intensity={1.25} />
        <directionalLight position={[4, 6, 5]} intensity={2.1} />
        <CameraControls resetToken={resetToken} command={command} />
        {COVER_EDGES.map((edge) => {
          const tone = edgeTone(edge, relations);
          const color = tone === 'intersection'
            ? colors.series3
            : tone === 'union'
              ? colors.series2
              : tone === 'both'
                ? colors.series1
                : colors.lineStrong;
          return (
            <Line
              key={edge.id}
              points={[BOOLEAN_NODES[edge.lower].position, BOOLEAN_NODES[edge.upper].position]}
              color={color}
              lineWidth={tone ? 2.8 : 1.5}
              transparent
              opacity={tone ? 1 : 0.7}
              dashed={tone === 'union' || tone === 'both'}
              dashSize={0.13}
              gapSize={0.09}
            />
          );
        })}
        {BOOLEAN_NODES.map((node) => (
          <BooleanNodeMesh key={node.mask} node={node} a={a} b={b} target={target} operations={operations} colors={colors} labelPortal={labelPortal} onSelect={onSelect} />
        ))}
      </Canvas>
      <div ref={labelPortal} className="ch02-html-layer" />
    </div>
  );
}

const HASSE_POSITIONS: Record<number, { x: number; y: number }> = {
  0: { x: 310, y: 370 },
  1: { x: 110, y: 270 },
  2: { x: 310, y: 270 },
  4: { x: 510, y: 270 },
  3: { x: 110, y: 170 },
  5: { x: 310, y: 170 },
  6: { x: 510, y: 170 },
  7: { x: 310, y: 70 },
};

interface HasseDiagramProps {
  a: number;
  b: number;
  target: SelectionTarget;
  operations: SubsetOperations;
  relations: RelationEdges;
  onSelect: (mask: number) => void;
}

function HasseDiagram({ a, b, operations, relations, target, onSelect }: HasseDiagramProps) {
  return (
    <div className="diagram-stage ch02-hasse-stage"><svg className="svg-lab ch02-hasse" viewBox="0 0 620 430" role="group" aria-label={`二维哈斯图，向上表示包含。点击节点填入 ${target}；Enter 或空格也可选择。`}>
      <title>三元素集合的幂集哈斯图：8 个子集与 12 条覆盖边</title>
      {COVER_EDGES.map((edge) => {
        const start = HASSE_POSITIONS[edge.lower];
        const end = HASSE_POSITIONS[edge.upper];
        const tone = edgeTone(edge, relations);
        return (
          <line
            key={edge.id}
            className={`ch02-hasse-edge ${tone ? `is-${tone}` : ''}`}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
          >
            <title>{subsetLabel(edge.lower)} 被 {subsetLabel(edge.upper)} 直接覆盖</title>
          </line>
        );
      })}
      {BOOLEAN_NODES.map((node) => {
        const position = HASSE_POSITIONS[node.mask];
        const selectedA = node.mask === a;
        const selectedB = node.mask === b;
        const intersection = node.mask === operations.intersection;
        const union = node.mask === operations.union;
        const badges = nodeBadges(node, a, b, operations);
        const badgeWidth = Math.max(32, badges.length * 12 + 12);
        const classes = [
          'ch02-node-base',
          selectedA ? 'selected-a' : '',
          selectedB ? 'selected-b' : '',
          intersection ? 'is-intersection' : '',
          union ? 'is-union' : '',
        ].filter(Boolean).join(' ');
        return (
          <g
            key={node.mask}
            className="ch02-hasse-node"
            transform={`translate(${position.x} ${position.y})`}
            role="button"
            tabIndex={0}
            aria-label={`${node.label}${badges ? `，${badges}` : ''}，填入 ${target}`}
            aria-pressed={target === 'A' ? selectedA : selectedB}
            onClick={() => onSelect(node.mask)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(node.mask);
              }
            }}
          >
            <title>{node.label}；{badges || '未选中'}；点击填入 {target}</title>
            <ellipse className="ch02-node-halo" rx="63" ry="38" />
            {union && <ellipse className="ch02-union-ring" rx="62" ry="37" />}
            {intersection && <path className="ch02-intersection-marker" d="M 0 -37 L 64 0 L 0 37 L -64 0 Z" />}
            {selectedA && <ellipse className="ch02-a-ring" rx="59" ry="34" />}
            <rect className={classes} x="-54" y="-28" width="108" height="56" rx={selectedB ? 7 : 28} />
            <text className="ch02-node-label" textAnchor="middle" dominantBaseline="central">{node.label}</text>
            {badges && (
              <g className="ch02-svg-badge" transform={`translate(0 ${-48})`}>
                <rect x={-badgeWidth / 2} y={-11} width={badgeWidth} height={20} rx={4} />
                <text textAnchor="middle" dominantBaseline="central">{badges}</text>
              </g>
            )}
          </g>
        );
      })}
    </svg></div>
  );
}

function RelationLegend() {
  return (
    <div className="legend ch02-relation-legend" aria-label="节点和路径图例">
      <span className="legend-item"><i className="ch02-legend-shape ring">A</i>选择 A（圆环）</span>
      <span className="legend-item"><i className="ch02-legend-shape square">B</i>选择 B（方框）</span>
      <span className="legend-item"><i className="swatch aqua" />交集路径（“交”标记）</span>
      <span className="legend-item"><i className="ch02-legend-dash" />并集路径（虚线与“并”标记）</span>
    </div>
  );
}

export default function Chapter02Lab({ onComplete }: LabProps) {
  const [graphicsAvailable, setGraphicsAvailable] = useState(supportsWebGL2);
  const [view, setView] = useState<ViewMode>(() => supportsWebGL2() ? '3d' : '2d');
  const [a, setA] = useState(1);
  const [b, setB] = useState(6);
  const [target, setTarget] = useState<SelectionTarget>('A');
  const [resetToken, setResetToken] = useState(0);
  const [cameraCommand, setCameraCommand] = useState<CameraCommand | null>(null);
  const operations = useMemo(() => compareSubsets(a, b), [a, b]);
  const relations = useMemo(() => relationEdges(a, b), [a, b]);
  const nodeA = BOOLEAN_NODES[a];
  const nodeB = BOOLEAN_NODES[b];
  const intersection = BOOLEAN_NODES[operations.intersection];
  const union = BOOLEAN_NODES[operations.union];

  const selectNode = (mask: number) => {
    if (target === 'A') setA(mask);
    else setB(mask);
    setTarget(target === 'A' ? 'B' : 'A');
  };

  const resetSelection = () => {
    setA(1);
    setB(6);
    setTarget('A');
    setResetToken((value) => value + 1);
  };

  const moveCamera = (action: CameraAction) => {
    setCameraCommand((current) => ({ action, id: (current?.id ?? 0) + 1 }));
  };

  const changeView = (next: ViewMode) => {
    setCameraCommand(null);
    setView(next);
  };
  const useTwoDimensions = () => { setGraphicsAvailable(false); setView('2d'); setCameraCommand(null); };

  return (
    <div className="ch02-lab">
      <div className="lab-workspace ch02-workspace">
        <div className="lab-column">
          <section className="visualization-panel" aria-labelledby="ch02-visual-title">
            <div className="panel-heading">
              <div><h3 id="ch02-visual-title">P({'{'}a,b,c{'}'}) 的布尔立方体</h3><small>8 个子集 · 12 条覆盖边</small></div>
              <div className="segmented" role="group" aria-label="立方体视图">
                <button className={view === '3d' ? 'active' : ''} onClick={() => changeView('3d')} aria-pressed={view === '3d'} disabled={!graphicsAvailable} title={!graphicsAvailable ? '当前环境无法启用三维视图' : undefined}>三维立方体</button>
                <button className={view === '2d' ? 'active' : ''} onClick={() => changeView('2d')} aria-pressed={view === '2d'}>二维哈斯图</button>
              </div>
            </div>
            {!graphicsAvailable && <p className="graphics-fallback-note" role="status">当前环境无法启用三维视图，已显示二维哈斯图；子集选择和集合运算仍可完整使用。</p>}
            {view === '3d'
              ? <GraphicsBoundary onUnavailable={useTwoDimensions} fallback={<HasseDiagram a={a} b={b} operations={operations} relations={relations} target={target} onSelect={selectNode} />}><CubeScene a={a} b={b} target={target} operations={operations} relations={relations} resetToken={resetToken} command={cameraCommand} onSelect={selectNode} /></GraphicsBoundary>
              : <HasseDiagram a={a} b={b} operations={operations} relations={relations} target={target} onSelect={selectNode} />}
            <div className="ch02-view-actions">
              <p className="fallback-note">
                {view === '3d'
                  ? '拖动旋转、滚轮或双指缩放；也可使用下方按钮，或 Tab 到节点标签后按 Enter。坐标轴分别对应 a、b、c 是否属于子集。'
                  : '越向上元素越多；每条边连接恰好相差一个元素的子集。Tab 选择节点，Enter 或空格确认。'}
              </p>
            </div>
            {view === '3d' && (
              <div className="ch02-camera-controls" role="group" aria-label="三维相机键盘等价控制">
                <button type="button" className="mini-button" onClick={() => moveCamera('left')}>视角左旋</button>
                <button type="button" className="mini-button" onClick={() => moveCamera('right')}>视角右旋</button>
                <button type="button" className="mini-button" onClick={() => moveCamera('zoom-in')}>放大</button>
                <button type="button" className="mini-button" onClick={() => moveCamera('zoom-out')}>缩小</button>
                <button type="button" className="mini-button" onClick={() => setResetToken((value) => value + 1)}><RotateCcw size={14} />重置视角</button>
              </div>
            )}
            <RelationLegend />
          </section>
        </div>
        <div className="lab-column">
          <section className="control-panel" aria-labelledby="ch02-selection-title">
            <div className="panel-heading"><h3 id="ch02-selection-title">选择两个子集</h3><small>点击后自动切换 A / B</small></div>
            <div className="segmented" role="group" aria-label="当前节点填入位置">
              <button className={target === 'A' ? 'active' : ''} onClick={() => setTarget('A')} aria-pressed={target === 'A'}>下一节点填入 A</button>
              <button className={target === 'B' ? 'active' : ''} onClick={() => setTarget('B')} aria-pressed={target === 'B'}>下一节点填入 B</button>
            </div>
            <p className="small muted">当前填入 <strong>{target}</strong>。下列按钮与三维节点、二维节点使用同一状态。</p>
            <div className="ch02-subset-picker" role="group" aria-label={`从 8 个子集中选择，填入 ${target}`}>
              {BOOLEAN_NODES.map((node) => {
                const badges = nodeBadges(node, a, b, operations);
                return (
                  <button key={node.mask} className={badges.includes(target) ? 'active' : ''} onClick={() => selectNode(node.mask)} aria-pressed={target === 'A' ? node.mask === a : node.mask === b}>
                    <span>{node.label}</span>{badges && <small>{badges}</small>}
                  </button>
                );
              })}
            </div>
            <details className="ch02-data-details">
              <summary>查看 8 个子集的数据表</summary>
              <div className="ch02-table-scroll" tabIndex={0} role="region" aria-label="幂集子集数据表，可横向滚动">
                <table className="data-table">
                  <thead><tr><th>子集</th><th>a,b,c 是否属于</th><th>基数</th><th>操作</th></tr></thead>
                  <tbody>{BOOLEAN_NODES.map((node) => (
                    <tr key={node.mask}>
                      <td>{node.label}</td>
                      <td>{SET_ELEMENTS.map((_, bit) => (node.mask & (1 << bit)) !== 0 ? '1' : '0').join('')}</td>
                      <td>{node.rank}</td>
                      <td><button className="mini-button" onClick={() => selectNode(node.mask)}>填入 {target}</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </details>
            <div className="callout">位掩码口径：a、b、c 分别对应第 0、1、2 位。交集是按位与，并集是按位或；覆盖边两端只差一个二进制位。</div>
          <div className="ch02-structure-section" role="region" aria-labelledby="ch02-structure-title">
            <div className="panel-heading"><h3 id="ch02-structure-title">覆盖关系读法</h3><small>不是任意子集两两连线</small></div>
            <ul className="status-list ch02-structure-list">
              <li><span>顶点数 |P(U)| = 2³</span><strong>8</strong></li>
              <li><span>每层基数 1, 3, 3, 1</span><strong>4 层</strong></li>
              <li><span>仅连接相差一个元素的子集</span><strong>12 边</strong></li>
            </ul>
            <p className="small muted">绿色实线路径指向交集（最大下界），橙色虚线路径指向并集（最小上界）。若两条路径重合，则使用较粗的点划线，并由节点“交 / 并”徽标明确区分。</p>
          </div>
          </section>

        </div>
        <section className="math-panel ch02-operation-panel" aria-labelledby="ch02-operation-title">
          <div className="panel-heading"><h3 id="ch02-operation-title">交、并与包含关系</h3><small>随节点选择同步重算</small></div>
          <div className="ch02-operation-formulas"><Formula tex={`A=${nodeA.tex},\\qquad B=${nodeB.tex}`} />
          <div className="math-readout"><Formula tex={`A\\cap B=${intersection.tex},\\qquad A\\cup B=${union.tex}`} /></div>
          </div>
          <div className="readout-grid" aria-live="polite">
            <div className="readout-item"><span>选择 A</span><strong>{nodeA.label}</strong></div>
            <div className="readout-item"><span>选择 B</span><strong>{nodeB.label}</strong></div>
            <div className="readout-item"><span>交集 A ∩ B</span><strong>{intersection.label}</strong></div>
            <div className="readout-item"><span>并集 A ∪ B</span><strong>{union.label}</strong></div>
          </div>
          <div className="ch02-inclusion-result" role="status"><Formula tex={operations.relationTex} display={false} /><span>{operations.relationText}</span></div>
        </section>
        <div className="ch02-button-row">
          <button className="mini-button" onClick={resetSelection}><RotateCcw size={14} />恢复初始选择</button>
          <button className="completion-button" onClick={onComplete}>完成布尔立方体实验</button>
        </div>
      </div>
    </div>
  );
}
