import { useEffect, useMemo, useState } from 'react';
import { Formula } from '../components/Formula';
import { StepPlayer } from '../components/StepPlayer';
import type { LabProps, TeachingStep } from '../types';
import {
  SMALL_PRIMES,
  countingRuleTotal,
  countSelections,
  createRsaDemo,
  enumerateSelections,
  validPublicExponents,
  type CountingKind,
  type CountingRule,
} from '../lib/ch01';
import './Chapter01Lab.css';

const ELEMENT_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

type CountingSection = 'selection' | 'rules';

function SelectionExperiment() {
  const [kind, setKind] = useState<CountingKind>('permutation');
  const [n, setN] = useState(4);
  const [r, setR] = useState(2);
  const total = countSelections(n, r, kind);
  const examples = useMemo(() => enumerateSelections(n, r, kind, 8), [n, r, kind]);
  const ordered = kind === 'permutation';
  const formula = ordered
    ? `P(${n},${r})=\\frac{${n}!}{(${n}-${r})!}=${total}`
    : `C(${n},${r})=\\frac{${n}!}{${r}!(${n}-${r})!}=${total}`;

  const updateN = (value: number) => {
    const next = Math.min(8, Math.max(1, Math.round(value || 1)));
    setN(next);
    setR((current) => Math.min(current, next));
  };

  return (
    <>
      <div className="lab-column">
        <section className="visualization-panel" aria-labelledby="ch01-selection-visual-title">
          <div className="panel-heading">
            <h3 id="ch01-selection-visual-title">{ordered ? '排列：选取并排定顺序' : '组合：只关心选入哪些元素'}</h3>
            <small>结果按字典序列出</small>
          </div>
          <div className="diagram-stage ch01-selection-stage">
          <div className="ch01-pool" aria-label={`元素池，共 ${n} 个不同元素`}>
            <span className="control-label">元素池</span>
            <div className="ch01-token-row">
              {ELEMENT_NAMES.slice(0, n).map((name) => <span className="ch01-element-token" key={name}>{name}</span>)}
            </div>
          </div>
          <div className="ch01-slots">
            <span className="control-label">{ordered ? '有序位置' : '选入名额'}</span>
            <div className="ch01-token-row" aria-label={`需要选取 ${r} 个元素`}>
              {r === 0
                ? <span className="ch01-empty-selection">空选取也有 1 种</span>
                : Array.from({ length: r }, (_, index) => (
                  <span className="ch01-slot-token" key={index}>{ordered ? `第 ${index + 1} 位` : `名额 ${index + 1}`}</span>
                ))}
            </div>
          </div>
          </div>
          <div className="ch01-outcomes">
            <div className="ch01-outcomes-heading">
              <strong>真实枚举样例</strong>
              <span>显示 {examples.length} / 共 {total} 种</span>
            </div>
            <ol className="ch01-outcome-list" aria-label="部分字典序枚举结果">
              {examples.map((example, index) => {
                const names = example.map((value) => ELEMENT_NAMES[value]);
                const text = example.length === 0
                  ? (ordered ? '()' : '∅')
                  : (ordered ? `(${names.join(' → ')})` : `{${names.join(', ')}}`);
                return <li key={`${index}-${text}`}><code>{text}</code></li>;
              })}
            </ol>
            {total > examples.length && (
              <p className="fallback-note">只枚举前 {examples.length} 项以免大结果撑爆页面；上方总数不是样例数，而是由公式精确计算。</p>
            )}
          </div>
        </section>
      </div>
      <div className="lab-column">
        <section className="control-panel" aria-labelledby="ch01-selection-controls-title">
          <div className="panel-heading"><h3 id="ch01-selection-controls-title">排列 / 组合参数</h3><small>1 ≤ n ≤ 8，0 ≤ r ≤ n</small></div>
          <div className="segmented" role="group" aria-label="计数类型">
            <button className={ordered ? 'active' : ''} onClick={() => setKind('permutation')} aria-pressed={ordered}>排列 P(n,r)</button>
            <button className={!ordered ? 'active' : ''} onClick={() => setKind('combination')} aria-pressed={!ordered}>组合 C(n,r)</button>
          </div>
          <div className="control-row">
            <label htmlFor="ch01-n">不同元素总数 n</label>
            <input id="ch01-n" type="number" min={1} max={8} step={1} value={n} onChange={(event) => updateN(Number(event.target.value))} />
            <label htmlFor="ch01-r">选取个数 r</label>
            <input id="ch01-r" type="number" min={0} max={n} step={1} value={r} onChange={(event) => setR(Math.min(n, Math.max(0, Math.round(Number(event.target.value) || 0))))} />
          </div>
          <label className="ch01-range-label" htmlFor="ch01-r-range">调整 r（当前 {r}）</label>
          <input id="ch01-r-range" className="range-input" type="range" min={0} max={n} step={1} value={r} onChange={(event) => setR(Number(event.target.value))} />
          <div className="callout">
            {ordered
              ? '顺序会区分结果：(A, B) 与 (B, A) 是两种排列。每一位选定后，后续可选元素减少。'
              : '同组元素不区分先后：{A, B} 与 {B, A} 是同一组合，因此不会出现重复排列。'}
          </div>
        </section>
        <section className="math-panel" aria-labelledby="ch01-selection-formula-title">
          <div className="panel-heading"><h3 id="ch01-selection-formula-title">精确计数</h3><small>不重复、不遗漏</small></div>
          <div className="math-readout"><Formula tex={formula} /></div>
          <div className="readout-grid">
            <div className="readout-item"><span>元素数 n</span><strong>{n}</strong></div>
            <div className="readout-item"><span>选取数 r</span><strong>{r}</strong></div>
            <div className="readout-item"><span>{ordered ? '排列数' : '组合数'}</span><strong>{total}</strong></div>
            <div className="readout-item"><span>是否计顺序</span><strong>{ordered ? '是' : '否'}</strong></div>
          </div>
        </section>
      </div>
    </>
  );
}

function RuleTokens({ prefix, count }: { prefix: string; count: number }) {
  return (
    <div className="ch01-token-row">
      {Array.from({ length: count }, (_, index) => (
        <span className={`ch01-rule-token ${prefix === '甲' ? 'first' : 'second'}`} key={index}>{prefix}{index + 1}</span>
      ))}
    </div>
  );
}

function RuleDiagram({ rule, m, n }: { rule: CountingRule; m: number; n: number }) {
  if (rule === 'addition') {
    return (
      <div className="diagram-stage ch01-addition-diagram" aria-label={`加法法则：甲类 ${m} 种与乙类 ${n} 种互斥，合计 ${m + n} 种`}>
        <div className="ch01-rule-group"><h4>类别甲 · {m} 种</h4><RuleTokens prefix="甲" count={m} /></div>
        <span className="ch01-rule-symbol" aria-hidden="true">+</span>
        <div className="ch01-rule-group"><h4>类别乙 · {n} 种</h4><RuleTokens prefix="乙" count={n} /></div>
      </div>
    );
  }
  return (
    <div className="ch01-product-diagram">
      <p className="small muted">每一个格子都是一次完整的“先甲后乙”搭配，例如甲1·乙2。</p>
      <div className="diagram-stage ch01-product-stage" tabIndex={0} role="region" aria-label="乘法法则搭配网格，可横向滚动">
      <div className="ch01-product-grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(48px, 1fr))` }} aria-label={`乘法法则的 ${m} 行 ${n} 列搭配网格`}>
        {Array.from({ length: m }, (_, row) => (
          Array.from({ length: n }, (_, column) => (
            <span className="ch01-product-cell" key={`${row}-${column}`} title={`先选甲${row + 1}，再选乙${column + 1}`}>甲{row + 1}·乙{column + 1}</span>
          ))
        ))}
      </div>
      </div>
    </div>
  );
}

function RuleExperiment() {
  const [rule, setRule] = useState<CountingRule>('addition');
  const [m, setM] = useState(3);
  const [n, setN] = useState(2);
  const total = countingRuleTotal(m, n, rule);
  const addition = rule === 'addition';

  return (
    <>
      <div className="lab-column">
        <section className="visualization-panel" aria-labelledby="ch01-rule-visual-title">
          <div className="panel-heading"><h3 id="ch01-rule-visual-title">{addition ? '互斥二选一：把两类方式合并' : '顺序分两步：每种甲都搭配每种乙'}</h3><small>{addition ? '类别不重叠' : '逐格一一对应'}</small></div>
          <RuleDiagram rule={rule} m={m} n={n} />
          <div className="legend" aria-label="图例">
            <span className="legend-item"><i className="swatch" />甲类方式（文字前缀“甲”）</span>
            <span className="legend-item"><i className="swatch orange" />乙类方式（文字前缀“乙”）</span>
          </div>
        </section>
      </div>
      <div className="lab-column">
        <section className="control-panel" aria-labelledby="ch01-rule-controls-title">
          <div className="panel-heading"><h3 id="ch01-rule-controls-title">加法 / 乘法法则</h3><small>参数范围 1–6</small></div>
          <div className="segmented" role="group" aria-label="基本计数法则">
            <button className={addition ? 'active' : ''} onClick={() => setRule('addition')} aria-pressed={addition}>加法法则</button>
            <button className={!addition ? 'active' : ''} onClick={() => setRule('multiplication')} aria-pressed={!addition}>乘法法则</button>
          </div>
          <div className="control-row">
            <label htmlFor="ch01-rule-m">{addition ? '甲类方式数 m' : '第一步方式数 m'}</label>
            <input id="ch01-rule-m" type="number" min={1} max={6} value={m} onChange={(event) => setM(Math.min(6, Math.max(1, Math.round(Number(event.target.value) || 1))))} />
            <label htmlFor="ch01-rule-n">{addition ? '乙类方式数 n' : '第二步方式数 n'}</label>
            <input id="ch01-rule-n" type="number" min={1} max={6} value={n} onChange={(event) => setN(Math.min(6, Math.max(1, Math.round(Number(event.target.value) || 1))))} />
          </div>
          <div className="callout">
            {addition
              ? '适用条件：完成同一件事的两类方式互不相交，只选其中一种，所以用 m + n。若类别有重叠，不能直接相加。'
              : '适用条件：先完成第一步，再完成第二步；每一种第一步选择都对应全部 n 种第二步选择，所以用 m × n。'}
          </div>
        </section>
        <section className="math-panel" aria-labelledby="ch01-rule-formula-title">
          <div className="panel-heading"><h3 id="ch01-rule-formula-title">法则验证</h3><small>{addition ? '并集计数（互斥）' : '笛卡尔积计数'}</small></div>
          <div className="math-readout"><Formula tex={addition ? `m+n=${m}+${n}=${total}` : `m\\times n=${m}\\times${n}=${total}`} /></div>
          <div className="readout-grid">
            <div className="readout-item"><span>{addition ? '甲类' : '第一步'}</span><strong>{m} 种</strong></div>
            <div className="readout-item"><span>{addition ? '乙类' : '第二步'}</span><strong>{n} 种</strong></div>
            <div className="readout-item"><span>完整方式总数</span><strong>{total} 种</strong></div>
          </div>
        </section>
      </div>
    </>
  );
}

function CountingLab({ onComplete, section }: LabProps & { section: CountingSection }) {
  return (
    <div>
      <div className="lab-workspace ch01-counting-workspace">
        {section === 'selection' ? <SelectionExperiment /> : <RuleExperiment />}
      </div>
      <div className="ch01-complete-row"><button className="completion-button" onClick={onComplete}>完成计数原理实验</button></div>
    </div>
  );
}

function RsaLab({ onComplete }: LabProps) {
  const [p, setP] = useState(3);
  const [q, setQ] = useState(11);
  const [e, setE] = useState(7);
  const [message, setMessage] = useState(5);
  const [euclidStep, setEuclidStep] = useState(0);
  const phi = (p - 1) * (q - 1);
  const exponents = useMemo(() => validPublicExponents(phi), [phi]);
  const effectiveE = exponents.includes(e) ? e : exponents[0];
  const boundedMessage = Math.min(message, p * q - 1);
  const demo = useMemo(
    () => createRsaDemo(p, q, effectiveE, boundedMessage),
    [p, q, effectiveE, boundedMessage],
  );

  useEffect(() => setEuclidStep(0), [p, q, effectiveE]);
  useEffect(() => setMessage(boundedMessage), [boundedMessage]);

  const steps = useMemo<TeachingStep[]>(() => demo.euclidean.map((snapshot) => {
    if (snapshot.index === 0) {
      return {
        label: '初始化',
        title: '从 φ(n) 与公钥指数 e 开始',
        explanation: `令 a = φ(n) = ${snapshot.a}，b = e = ${snapshot.b}。播放器会保留每次带余除法的商、余数和下一组 (a,b)。`,
        formula: `(a,b)=(${snapshot.a},${snapshot.b})`,
      };
    }
    const terminal = snapshot.remainder === 0;
    return {
      label: terminal ? '得到 gcd' : `第 ${snapshot.index} 次除法`,
      title: terminal ? '余数为 0，确认 e 与 φ(n) 互素' : `用 ${snapshot.b} 除 ${snapshot.a}`,
      explanation: terminal
        ? `最后余数为 0，所以 gcd(${demo.phi}, ${demo.e}) = ${snapshot.gcd}。因为最大公因数为 1，e 在模 φ(n) 下存在逆元 d。`
        : `商为 ${snapshot.quotient}，余数为 ${snapshot.remainder}；下一步令 a ← ${snapshot.nextA}，b ← ${snapshot.nextB}，继续辗转相除。`,
      formula: `${snapshot.a}=${snapshot.b}\\times${snapshot.quotient}+${snapshot.remainder},\\quad(a,b)\\leftarrow(${snapshot.nextA},${snapshot.nextB})`,
    };
  }), [demo]);

  const safeStep = Math.min(euclidStep, demo.euclidean.length - 1);
  const snapshot = demo.euclidean[safeStep];
  const bezoutMultiplier = Math.floor((demo.e * demo.d) / demo.phi);

  return (
    <div>
      <div className="lab-workspace ch01-rsa-workspace">
        <div className="lab-column">
          <section className="visualization-panel" aria-labelledby="ch01-rsa-flow-title">
            <div className="panel-heading"><h3 id="ch01-rsa-flow-title">小整数 RSA 加解密闭环</h3><small>平方-乘模幂，结果实时重算</small></div>
            <div className="diagram-stage ch01-rsa-flow" aria-live="polite">
              <div className="ch01-message-card plaintext"><span>明文 M</span><strong>{demo.message}</strong><small>0 ≤ M &lt; {demo.n}</small></div>
              <div className="ch01-flow-arrow"><span>使用公钥 ({demo.n}, {demo.e})</span><b aria-hidden="true">→</b><code>C = Mᵉ mod n</code></div>
              <div className="ch01-message-card ciphertext"><span>密文 C</span><strong>{demo.ciphertext}</strong><small>{demo.message}^{demo.e} mod {demo.n}</small></div>
              <div className="ch01-flow-arrow"><span>使用私钥 ({demo.n}, {demo.d})</span><b aria-hidden="true">→</b><code>M′ = Cᵈ mod n</code></div>
              <div className="ch01-message-card decrypted"><span>解密 M′</span><strong>{demo.decrypted}</strong><small>{demo.ciphertext}^{demo.d} mod {demo.n}</small></div>
            </div>
            <div className={`ch01-consistency ${demo.decrypted === demo.message ? 'pass' : 'fail'}`} role="status">
              一致性验证：M′ = {demo.decrypted}，M = {demo.message}，{demo.decrypted === demo.message ? '二者相等，往返成功。' : '二者不相等。'}
            </div>
          </section>
          <section className="visualization-panel" aria-labelledby="ch01-snapshot-title">
            <div className="panel-heading"><h3 id="ch01-snapshot-title">当前欧几里得快照</h3><small>与下方播放器同步</small></div>
            <div className="ch01-table-scroll" tabIndex={0} role="region" aria-label="欧几里得算法当前快照，可横向滚动">
              <table className="data-table ch01-snapshot-table">
                <thead><tr><th>步次</th><th>a</th><th>b</th><th>商 q</th><th>余数 r</th><th>下一组 (a,b)</th><th>结论</th></tr></thead>
                <tbody><tr>
                  <td>{snapshot.index}</td><td>{snapshot.a}</td><td>{snapshot.b}</td>
                  <td>{snapshot.quotient ?? '—'}</td><td>{snapshot.remainder ?? '—'}</td>
                  <td>{snapshot.nextA === null ? '—' : `(${snapshot.nextA}, ${snapshot.nextB})`}</td>
                  <td>{snapshot.gcd === null ? '继续' : `gcd = ${snapshot.gcd}`}</td>
                </tr></tbody>
              </table>
            </div>
          </section>
          <StepPlayer steps={steps} current={safeStep} onChange={setEuclidStep} label="欧几里得算法完整快照步骤播放器" />
        </div>
        <div className="lab-column">
          <section className="control-panel" aria-labelledby="ch01-rsa-controls-title">
            <div className="panel-heading"><h3 id="ch01-rsa-controls-title">RSA 教学参数</h3><small>仅预列小素数</small></div>
            <div className="control-row">
              <label htmlFor="ch01-prime-p">素数 p</label>
              <select id="ch01-prime-p" value={p} onChange={(event) => setP(Number(event.target.value))}>
                {SMALL_PRIMES.filter((prime) => prime !== q).map((prime) => <option key={prime} value={prime}>{prime}</option>)}
              </select>
              <label htmlFor="ch01-prime-q">素数 q</label>
              <select id="ch01-prime-q" value={q} onChange={(event) => setQ(Number(event.target.value))}>
                {SMALL_PRIMES.filter((prime) => prime !== p).map((prime) => <option key={prime} value={prime}>{prime}</option>)}
              </select>
            </div>
            <div className="control-row">
              <label htmlFor="ch01-public-e">公钥指数 e（与 φ(n) 互素）</label>
              <select id="ch01-public-e" value={demo.e} onChange={(event) => setE(Number(event.target.value))}>
                {exponents.map((exponent) => <option key={exponent} value={exponent}>{exponent}</option>)}
              </select>
            </div>
            <div className="control-row">
              <label htmlFor="ch01-message">消息整数 M（0 至 {demo.n - 1}）</label>
              <input id="ch01-message" type="number" min={0} max={demo.n - 1} step={1} value={demo.message} onChange={(event) => setMessage(Math.min(demo.n - 1, Math.max(0, Math.round(Number(event.target.value) || 0))))} />
            </div>
            <input className="range-input" type="range" min={0} max={demo.n - 1} value={demo.message} onChange={(event) => setMessage(Number(event.target.value))} aria-label="消息整数 M 滑块" />
            <div className="readout-grid">
              <div className="readout-item"><span>n = pq</span><strong>{demo.n}</strong></div>
              <div className="readout-item"><span>φ(n) = (p−1)(q−1)</span><strong>{demo.phi}</strong></div>
              <div className="readout-item"><span>私钥指数 d</span><strong>{demo.d}</strong></div>
              <div className="readout-item"><span>ed mod φ(n)</span><strong>{demo.inverseProof}</strong></div>
            </div>
            <p className="fallback-note">范围限定：p、q ∈ {'{'}3, 5, 7, 11, 13, 17, 19{'}'} 且 p ≠ q；e 只能从合法候选中选择。此实验不支持任意大整数。</p>
          </section>

          <div className="callout warning">这是无填充的小整数教学模型，用来验证数论关系；它不是安全通信工具，请勿用于真实数据或生产环境。</div>

        </div>
          <section className="math-panel ch01-inverse-panel" aria-labelledby="ch01-inverse-title">
            <div className="panel-heading"><h3 id="ch01-inverse-title">模逆元与密钥</h3><small>扩展欧几里得求 d</small></div>
            <Formula tex={`\\begin{aligned}d&\\equiv e^{-1}\\pmod{\\varphi(n)}\\\\ ${demo.e}\\times${demo.d}&=${demo.e * demo.d}=${bezoutMultiplier}\\times${demo.phi}+1\\end{aligned}`} />
            <div className="math-readout"><Formula tex={`\\begin{aligned}C&\\equiv M^{e}\\pmod n\\\\ M&\\equiv C^{d}\\pmod n\\end{aligned}`} /></div>
            <div className="readout-grid">
              <div className="readout-item"><span>公钥 (n,e)</span><strong>({demo.n}, {demo.e})</strong></div>
              <div className="readout-item"><span>私钥 (n,d)</span><strong>({demo.n}, {demo.d})</strong></div>
            </div>
          </section>
          <div className="ch01-rsa-complete-row"><button className="completion-button" onClick={onComplete}>完成 RSA 与算法实验</button></div>
      </div>
    </div>
  );
}

export default function Chapter01Lab({ onComplete }: LabProps) {
  const [mode, setMode] = useState<'counting' | 'rsa'>('counting');
  const [section, setSection] = useState<CountingSection>('selection');
  return (
    <div className="ch01-lab">
      <div className="ch01-toolbar">
        <div className="ch01-tool-group"><span className="control-label">实验模块</span>
      <div className="lab-tabs ch01-mode-tabs" role="group" aria-label="第 1 章实验模式">
        <button className={mode === 'counting' ? 'active' : ''} onClick={() => setMode('counting')} aria-pressed={mode === 'counting'}>计数原理</button>
        <button className={mode === 'rsa' ? 'active' : ''} onClick={() => setMode('rsa')} aria-pressed={mode === 'rsa'}>欧几里得算法与 RSA</button>
      </div>
        </div>
        {mode === 'counting' && <div className="ch01-tool-group"><span className="control-label">计数主题</span>
          <div className="lab-tabs ch01-section-tabs" role="group" aria-label="计数实验内容">
            <button className={section === 'selection' ? 'active' : ''} onClick={() => setSection('selection')} aria-pressed={section === 'selection'}>排列与组合</button>
            <button className={section === 'rules' ? 'active' : ''} onClick={() => setSection('rules')} aria-pressed={section === 'rules'}>加法与乘法法则</button>
          </div>
        </div>}
      </div>
      {mode === 'counting' ? <CountingLab onComplete={onComplete} section={section} /> : <RsaLab onComplete={onComplete} />}
    </div>
  );
}
