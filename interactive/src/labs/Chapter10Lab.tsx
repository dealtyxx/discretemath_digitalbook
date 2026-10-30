import { OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { CanvasTexture, Quaternion as ThreeQuaternion, SRGBColorSpace, Vector3 } from 'three';
import { Formula } from '../components/Formula';
import { useLabActive } from '../components/LabActivity';
import { GraphicsBoundary, supportsWebGL2 } from '../components/GraphicsBoundary';
import type { LabProps } from '../types';
import {
  composeSequence,
  facePermutation,
  FACE_DEFINITIONS,
  IDENTITY_MATRIX,
  inverseSequence,
  matricesEqual,
  matrixToQuaternion,
  QUARTER_TURN_LABELS,
  type FaceId,
  type Matrix3,
  type QuarterTurn,
} from '../lib/ch10';
import './Chapter10Lab.css';

const MAX_OPERATIONS = 30;
const INITIAL_CAMERA: [number, number, number] = [4.8, 3.8, 5.5];
type CameraAction = 'left' | 'right' | 'zoom-in' | 'zoom-out' | 'reset';
interface CameraCommand { action: CameraAction; id: number }

interface ScenePalette {
  surface: string;
  ink: string;
  line: string;
  series1: string;
  series2: string;
  series3: string;
}

const fallbackPalette: ScenePalette = {
  surface: '#fcfcfb',
  ink: '#142330',
  line: '#deddd6',
  series1: '#2a78d6',
  series2: '#eb6834',
  series3: '#1baf7a',
};

function readScenePalette(): ScenePalette {
  if (typeof window === 'undefined') return fallbackPalette;
  const styles = window.getComputedStyle(document.documentElement);
  const read = (name: keyof ScenePalette, cssName: string) => styles.getPropertyValue(cssName).trim() || fallbackPalette[name];
  return {
    surface: read('surface', '--surface'),
    ink: read('ink', '--ink'),
    line: read('line', '--line'),
    series1: read('series1', '--series-1'),
    series2: read('series2', '--series-2'),
    series3: read('series3', '--series-3'),
  };
}

function useScenePalette(): ScenePalette {
  const [palette, setPalette] = useState<ScenePalette>(readScenePalette);
  useEffect(() => {
    const update = () => setPalette(readScenePalette());
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class', 'style'],
    });
    return () => observer.disconnect();
  }, []);
  return palette;
}

const faceTransforms: Record<FaceId, {
  position: [number, number, number];
  rotation: [number, number, number];
}> = {
  R: { position: [1.206, 0, 0], rotation: [0, Math.PI / 2, 0] },
  L: { position: [-1.206, 0, 0], rotation: [0, -Math.PI / 2, 0] },
  U: { position: [0, 1.206, 0], rotation: [-Math.PI / 2, 0, 0] },
  D: { position: [0, -1.206, 0], rotation: [Math.PI / 2, 0, 0] },
  F: { position: [0, 0, 1.206], rotation: [0, 0, 0] },
  B: { position: [0, 0, -1.206], rotation: [0, Math.PI, 0] },
};

function makeFaceTextures(palette: ScenePalette): Record<FaceId, CanvasTexture> {
  const accents = [palette.series1, palette.series2, palette.series3, palette.series1, palette.series2, palette.series3];
  const entries = FACE_DEFINITIONS.map((face, index) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('无法创建立方体面标记画布');
    context.fillStyle = palette.surface;
    context.fillRect(0, 0, 256, 256);
    context.strokeStyle = accents[index];
    context.lineWidth = 5;
    context.beginPath();
    context.roundRect(10, 10, 236, 236, 20);
    context.stroke();

    context.fillStyle = accents[index];
    context.globalAlpha = 0.08;
    context.beginPath();
    context.arc(128, 129, 62, 0, Math.PI * 2);
    context.fill();
    context.globalAlpha = 1;

    context.strokeStyle = accents[index];
    context.fillStyle = accents[index];
    context.lineWidth = 5;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(66, 43);
    context.lineTo(184, 43);
    context.stroke();
    context.beginPath();
    context.moveTo(194, 43);
    context.lineTo(174, 31);
    context.lineTo(174, 55);
    context.closePath();
    context.fill();

    context.fillStyle = palette.ink;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = '700 84px "Microsoft YaHei", sans-serif';
    context.fillText(face.id, 128, 129);
    context.font = '600 25px "Microsoft YaHei", sans-serif';
    context.fillText(`${face.name} · ${face.direction}`, 128, 214);

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    return [face.id, texture] as const;
  });
  return Object.fromEntries(entries) as Record<FaceId, CanvasTexture>;
}

function SceneCameraControls({ command }: { command: CameraCommand | null }) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const { camera } = useThree();
  useEffect(() => {
    if (!command) return;
    const target = controls.current?.target ?? new Vector3();
    if (command.action === 'reset') {
      target.set(0, 0, 0);
      camera.position.set(...INITIAL_CAMERA);
    } else {
      const offset = camera.position.clone().sub(target);
      if (command.action === 'left' || command.action === 'right') {
        offset.applyAxisAngle(new Vector3(0, 1, 0), command.action === 'left' ? Math.PI / 12 : -Math.PI / 12);
      } else {
        const factor = command.action === 'zoom-in' ? 0.85 : 1.18;
        offset.setLength(Math.min(11, Math.max(4.5, offset.length() * factor)));
      }
      camera.position.copy(target).add(offset);
    }
    camera.lookAt(target);
    controls.current?.update();
  }, [camera, command]);
  return <OrbitControls ref={controls} makeDefault enablePan={false} minDistance={4.5} maxDistance={11} />;
}

function RotationScene({ matrix, palette, command }: { matrix: Matrix3; palette: ScenePalette; command: CameraCommand | null }) {
  const active = useLabActive();
  const textures = useMemo(() => makeFaceTextures(palette), [palette]);
  const quaternion = useMemo(() => new ThreeQuaternion(...matrixToQuaternion(matrix)), [matrix]);
  useEffect(() => () => {
    Object.values(textures).forEach((texture) => texture.dispose());
  }, [textures]);

  return (
    <div className="three-scene ch10-scene diagram-stage" role="group" aria-label="带六个面标识的三维立方体。拖动只改变相机，代数旋转由下方按钮执行。">
      <Canvas camera={{ position: INITIAL_CAMERA, fov: 42 }} dpr={[1, 1.5]} frameloop={active ? 'always' : 'never'}>
        <ambientLight intensity={1.25} />
        <directionalLight position={[4, 7, 5]} intensity={2.1} />
        <group quaternion={quaternion}>
          <mesh>
            <boxGeometry args={[2.4, 2.4, 2.4]} />
            <meshStandardMaterial color={palette.surface} roughness={0.72} />
          </mesh>
          {FACE_DEFINITIONS.map((face) => (
            <mesh key={face.id} position={faceTransforms[face.id].position} rotation={faceTransforms[face.id].rotation}>
              <planeGeometry args={[2.28, 2.28]} />
              <meshBasicMaterial map={textures[face.id]} toneMapped={false} />
            </mesh>
          ))}
        </group>
        <gridHelper args={[8, 8, palette.line, palette.line]} position={[0, -1.7, 0]} />
        <SceneCameraControls command={command} />
      </Canvas>
      <span className="ch10-camera-note">拖动场景 = 相机视角（不追加群运算）</span>
    </div>
  );
}

function FacePositionDiagram({ matrix }: { matrix: Matrix3 }) {
  const images = facePermutation(matrix);
  const positions: { id: FaceId; x: number; y: number }[] = [
    { id: 'U', x: 185, y: 62 }, { id: 'L', x: 65, y: 180 },
    { id: 'F', x: 185, y: 180 }, { id: 'R', x: 305, y: 180 },
    { id: 'B', x: 425, y: 180 }, { id: 'D', x: 185, y: 298 },
  ];
  return <div className="diagram-stage ch10-flat-stage">
    <svg className="svg-lab ch10-flat-net" viewBox="0 0 500 360" role="img" aria-label="立方体六面位置示意，字母表示旋转后到达该固定方向的原始面">
      <title>旋转后各固定方向上的面标记</title>
      <path className="ch10-flat-links" d="M185 62V298M65 180H425" />
      {positions.map((position) => {
        const destination = FACE_DEFINITIONS.find((face) => face.id === position.id)!;
        const source = images.find((face) => face.targetId === position.id)!;
        return <g className="ch10-flat-face" data-face={source.id} data-position={position.id} key={position.id} transform={`translate(${position.x} ${position.y})`}>
          <title>{destination.name}方向 {destination.direction}：原{source.name} {source.id}</title>
          <rect className="ch10-flat-halo" x="-52" y="-49" width="104" height="98" rx="10" />
          <rect className="ch10-flat-cell" x="-48" y="-45" width="96" height="90" rx="7" />
          <text className="ch10-flat-direction" textAnchor="middle" y="-27">{destination.name} · {destination.direction}</text>
          <text className="ch10-flat-label" textAnchor="middle" y="7">{source.id}</text>
          <text className="ch10-flat-source" textAnchor="middle" y="28">原{source.name}</text>
        </g>;
      })}
    </svg>
  </div>;
}

function MatrixView({ matrix, label }: { matrix: Matrix3; label: string }) {
  return (
    <div className="ch10-table-scroll" tabIndex={0} role="region" aria-label={`${label}，可横向滚动`}>
      <table className="matrix-table ch10-matrix" aria-label={label}>
        <caption>{label}</caption>
        <tbody>
          {[0, 1, 2].map((row) => (
            <tr key={row}>
              {[0, 1, 2].map((column) => <td key={column}>{matrix[row * 3 + column]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function turnToTex(turn: QuarterTurn): string {
  const axis = turn.charAt(0).toLowerCase();
  const angle = turn.includes('-') ? '-90^\\circ' : '90^\\circ';
  return `R_${axis}(${angle})`;
}

function sequenceProductTex(sequence: readonly QuarterTurn[]): string {
  if (sequence.length === 0) return 'I';
  return [...sequence].reverse().map(turnToTex).join('\\,');
}

function cleanFixed(value: number): string {
  const text = value.toFixed(3);
  return text === '-0.000' ? '0.000' : text;
}

export default function Chapter10Lab({ onComplete }: LabProps) {
  const [graphicsAvailable, setGraphicsAvailable] = useState(supportsWebGL2);
  const [history, setHistory] = useState<QuarterTurn[]>([]);
  const [compareFirst, setCompareFirst] = useState<QuarterTurn>('X90');
  const [compareSecond, setCompareSecond] = useState<QuarterTurn>('Y90');
  const [hasExplored, setHasExplored] = useState(false);
  const [cameraCommand, setCameraCommand] = useState<CameraCommand | null>(null);
  const palette = useScenePalette();

  const currentMatrix = useMemo(() => composeSequence(history), [history]);
  const currentQuaternion = useMemo(() => matrixToQuaternion(currentMatrix), [currentMatrix]);
  const currentPermutation = useMemo(() => facePermutation(currentMatrix), [currentMatrix]);
  const sequenceA = useMemo<QuarterTurn[]>(() => [compareFirst, compareSecond], [compareFirst, compareSecond]);
  const sequenceB = useMemo<QuarterTurn[]>(() => [compareSecond, compareFirst], [compareSecond, compareFirst]);
  const matrixA = useMemo(() => composeSequence(sequenceA), [sequenceA]);
  const matrixB = useMemo(() => composeSequence(sequenceB), [sequenceB]);
  const permutationA = useMemo(() => facePermutation(matrixA), [matrixA]);
  const permutationB = useMemo(() => facePermutation(matrixB), [matrixB]);
  const ordersEqual = matricesEqual(matrixA, matrixB);
  const differenceIndex = permutationA.findIndex((item, index) => item.targetId !== permutationB[index].targetId);
  const difference = differenceIndex >= 0 ? {
    source: permutationA[differenceIndex],
    a: permutationA[differenceIndex],
    b: permutationB[differenceIndex],
  } : null;
  const isIdentity = matricesEqual(currentMatrix, IDENTITY_MATRIX);

  const moveCamera = (action: CameraAction) => {
    setCameraCommand((current) => ({ action, id: (current?.id ?? 0) + 1 }));
  };

  const appendOperation = (operation: QuarterTurn) => {
    setHistory((current) => current.length < MAX_OPERATIONS ? [...current, operation] : current);
    setHasExplored(true);
  };

  const appendTotalInverse = () => {
    setHistory((current) => current.length * 2 <= MAX_OPERATIONS ? [...current, ...inverseSequence(current)] : current);
    setHasExplored(true);
  };

  const loadSequence = (sequence: readonly QuarterTurn[]) => {
    setHistory([...sequence]);
    setHasExplored(true);
  };

  return (
    <div className="chapter10-lab">
      <div className="lab-workspace ch10-workspace">
        <div className="lab-column">
          <section className="visualization-panel ch10-scene-panel" aria-labelledby="ch10-scene-title">
            <div className="panel-heading">
              <h3 id="ch10-scene-title">立方体旋转群</h3>
              <small>{isIdentity ? '当前总变换：恒等 I' : '当前总变换：非恒等旋转'}</small>
            </div>
            {!graphicsAvailable && <p className="graphics-fallback-note" role="status">当前环境无法启用三维视图，已显示二维面位置示意；旋转运算、矩阵和面置换仍可继续使用。</p>}
            {graphicsAvailable
              ? <GraphicsBoundary onUnavailable={() => setGraphicsAvailable(false)} fallback={<FacePositionDiagram matrix={currentMatrix} />}><RotationScene matrix={currentMatrix} palette={palette} command={cameraCommand} /></GraphicsBoundary>
              : <FacePositionDiagram matrix={currentMatrix} />}
            {graphicsAvailable && <div className="ch10-camera-controls" role="group" aria-label="三维相机键盘等价控制">
              <button type="button" className="mini-button" onClick={() => moveCamera('left')}>视角左旋</button>
              <button type="button" className="mini-button" onClick={() => moveCamera('right')}>视角右旋</button>
              <button type="button" className="mini-button" onClick={() => moveCamera('zoom-in')}>放大</button>
              <button type="button" className="mini-button" onClick={() => moveCamera('zoom-out')}>缩小</button>
              <button type="button" className="mini-button" onClick={() => moveCamera('reset')}>重置视角</button>
            </div>}
            <div className="legend ch10-face-legend" aria-label="面标记图例">
              {FACE_DEFINITIONS.map((face) => <span className="legend-item" key={face.id} data-face={face.id}><b>{face.id}</b><span>{face.name}<small>{face.direction}</small></span></span>)}
            </div>
            <p className="fallback-note">
              {graphicsAvailable
                ? '鼠标、触摸或上方相机按钮仅控制 OrbitControls 视角，不修改操作序列、矩阵或四元数。要对立方体施加群运算，请使用 X / Y / Z 旋转按钮。'
                : '方框表示固定的空间方向，字母表示当前到达该方向的原始面；完整姿态见下方旋转矩阵。使用 X / Y / Z 旋转按钮，示意图与面置换表会同步更新。'}
            </p>
          </section>

          <section className="math-panel ch10-sync-panel" aria-labelledby="ch10-sync-title">
            <div className="panel-heading">
              <h3 id="ch10-sync-title">同步代数表示</h3>
              <small>由同一操作序列实时计算</small>
            </div>
            <Formula tex={sequenceProductTex(history)} className="ch10-product-formula" />
            <p className="small muted ch10-convention">
              约定：右手系、固定世界坐标轴、矩阵作用于列向量。操作记录按时间从左到右；后追加的操作在矩阵乘积中左乘。
            </p>
            <div className="ch10-representation-grid">
              <div>
                <span className="control-label">当前旋转矩阵 M</span>
                <MatrixView matrix={currentMatrix} label="当前三维旋转矩阵" />
              </div>
              <div>
                <span className="control-label">单位四元数 q = [x, y, z, w]</span>
                <div className="readout-grid ch10-quaternion-grid">
                  {(['x', 'y', 'z', 'w'] as const).map((name, index) => (
                    <div className="readout-item" key={name}><span>q<sub>{name}</sub></span><strong>{cleanFixed(currentQuaternion[index])}</strong></div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="lab-column">
          <section className="control-panel ch10-controls-panel" aria-labelledby="ch10-controls-title">
            <div className="panel-heading">
              <h3 id="ch10-controls-title">代数旋转操作</h3>
              <small>{history.length} / {MAX_OPERATIONS} 步</small>
            </div>
            <span className="control-label" id="ch10-turn-buttons">追加绕固定轴的 +90° 主动旋转</span>
            <div className="ch10-turn-grid" role="group" aria-labelledby="ch10-turn-buttons">
              {(['X90', 'Y90', 'Z90'] as const).map((turn) => (
                <button
                  type="button"
                  className="mini-button"
                  key={turn}
                  disabled={history.length >= MAX_OPERATIONS}
                  onClick={() => appendOperation(turn)}
                >
                  {QUARTER_TURN_LABELS[turn]}
                </button>
              ))}
            </div>
            <div className="ch10-history-buttons">
              <button
                type="button"
                className="mini-button"
                disabled={history.length === 0}
                onClick={() => {
                  setHistory((current) => current.slice(0, -1));
                  setHasExplored(true);
                }}
              >
                撤销最后一步
              </button>
              <button
                type="button"
                className="mini-button"
                disabled={history.length === 0 || history.length * 2 > MAX_OPERATIONS}
                title="按相反顺序追加每一步的逆操作"
                onClick={appendTotalInverse}
              >
                追加总逆变换
              </button>
              <button
                type="button"
                className="mini-button"
                disabled={history.length === 0}
                onClick={() => {
                  setHistory([]);
                  setHasExplored(true);
                }}
              >
                重置为恒等
              </button>
            </div>
            <p className="callout">
              “撤销”删除记录末项；“总逆变换”追加逆序的逆操作，例如 [X,Y] 后追加 [Y⁻¹,X⁻¹]，所以总矩阵恢复 I，但操作记录仍保留证据。
            </p>
            <div className="ch10-operation-log">
              <strong>按发生顺序记录（{history.length} 步）</strong>
              {history.length === 0 ? (
                <p>尚无代数操作，当前为单位元 I。请追加旋转，或装入顺序 A / B。</p>
              ) : (
                <ol>
                  {history.map((turn, index) => (
                    <li key={`${index}-${turn}`}><span>{index + 1}</span>{QUARTER_TURN_LABELS[turn]}</li>
                  ))}
                </ol>
              )}
            </div>
          </section>

          <section className="data-panel ch10-order-panel" aria-labelledby="ch10-order-title">
            <div className="panel-heading">
              <h3 id="ch10-order-title">复合顺序对比</h3>
              <small>A、B 都从同一个初始姿态出发</small>
            </div>
            <div className="ch10-order-fields">
              <div className="ch10-field">
              <label htmlFor="ch10-first">先执行</label>
              <select id="ch10-first" value={compareFirst} onChange={(event) => { setCompareFirst(event.target.value as QuarterTurn); setHasExplored(true); }}>
                {(['X90', 'Y90', 'Z90'] as const).map((turn) => <option key={turn} value={turn}>{QUARTER_TURN_LABELS[turn]}</option>)}
              </select>
              </div>
              <div className="ch10-field">
              <label htmlFor="ch10-second">后执行</label>
              <select id="ch10-second" value={compareSecond} onChange={(event) => { setCompareSecond(event.target.value as QuarterTurn); setHasExplored(true); }}>
                {(['X90', 'Y90', 'Z90'] as const).map((turn) => <option key={turn} value={turn}>{QUARTER_TURN_LABELS[turn]}</option>)}
              </select>
              </div>
            </div>
            <div className="ch10-comparison-matrices">
              <div><strong>A：先 {compareFirst.slice(0, 1)}，后 {compareSecond.slice(0, 1)}</strong><MatrixView matrix={matrixA} label="顺序 A 的旋转矩阵" /></div>
              <div><strong>B：先 {compareSecond.slice(0, 1)}，后 {compareFirst.slice(0, 1)}</strong><MatrixView matrix={matrixB} label="顺序 B 的旋转矩阵" /></div>
            </div>
            <div className={`ch10-order-result ${ordersEqual ? 'status-pass' : 'status-fail'}`} aria-live="polite">
              {ordersEqual
                ? '✓ 本次 A=B：两次选择相同操作，交换记录不会改变序列。请换用两个不同坐标轴观察非交换反例。'
                : difference && `× A≠B：原${difference.source.name} ${difference.source.id}（${difference.source.sourceDirection}）在 A 后到 ${difference.a.targetId}（${difference.a.targetDirection}），在 B 后却到 ${difference.b.targetId}（${difference.b.targetDirection}）。这个具体反例说明两个旋转不交换。`}
            </div>
            <div className="ch10-load-comparison">
              <button type="button" className="mini-button" onClick={() => loadSequence(sequenceA)}>在场景执行 A</button>
              <button type="button" className="mini-button" onClick={() => loadSequence(sequenceB)}>在场景执行 B</button>
            </div>
          </section>
        </div>
      </div>

      <section className="data-panel" aria-labelledby="ch10-permutation-title">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">2D PERMUTATION · FACE MAPPING</span>
            <h3 id="ch10-permutation-title">二维面置换</h3>
          </div>
          <small>面置换描述物体，不描述相机投影</small>
        </div>
        <div className="ch10-log-grid">
          <div className="ch10-table-scroll" tabIndex={0} role="region" aria-label="立方体面置换表，可横向滚动">
            <table className="data-table ch10-permutation-table">
              <thead><tr><th scope="col">原有标记面</th><th scope="col">初始法向</th><th scope="col">当前所在面 / 法向</th></tr></thead>
              <tbody>
                {currentPermutation.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.id}</strong> · {item.name}</td>
                    <td>{item.sourceDirection}</td>
                    <td><span className="ch10-permutation-arrow">→</span> <strong>{item.targetId}</strong> · {item.targetDirection}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="ch10-completion">
          <p className="small muted">验证建议：执行 X90→Y90，再装入反向顺序 B；比较 F 面去向与矩阵。随后用“追加总逆变换”验证乘积的逆要反序。</p>
          <button type="button" className="completion-button" disabled={!hasExplored} onClick={onComplete}>完成本章实验</button>
        </div>
      </section>
    </div>
  );
}
