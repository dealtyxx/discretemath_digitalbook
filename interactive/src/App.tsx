import { Activity, Suspense, useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, CircleHelp, FlaskConical, Home, ListTree, Menu, Moon, RotateCcw, Sun, X } from 'lucide-react';
import { chapters, getChapter } from './chapters';
import { labRegistry } from './registry';
import { LabActivityContext } from './components/LabActivity';
import { LabBoundary } from './components/LabBoundary';
import { isLearningProgressPersisted, useLearningStore } from './store';
import type { Chapter } from './types';

const CHAPTER_TABS = ['lab', 'path', 'quiz'] as const;
type ChapterTab = typeof CHAPTER_TABS[number];

function compactCount(value: bigint): string {
  for (const [unit, suffix] of [[10_000_000_000_000_000n, '京'], [1_000_000_000_000n, '万亿'], [100_000_000n, '亿'], [10_000n, '万']] as const) {
    if (value < unit) continue;
    const tenths = (value * 10n + unit / 2n) / unit;
    const decimal = tenths % 10n;
    const approximate = tenths * unit !== value * 10n;
    return `${approximate ? '≈' : ''}${tenths / 10n}${decimal ? `.${decimal}` : ''}${suffix}`;
  }
  return value.toString();
}

function chapterFromUrl() {
  const value = Number(new URLSearchParams(window.location.search).get('chapter'));
  return Number.isInteger(value) && value >= 1 && value <= 11 ? value : null;
}

function Dashboard({ onSelect }: { onSelect: (chapter: number) => void }) {
  const progress = useLearningStore((state) => state.progress);
  const completed = chapters.filter((chapter) => (progress[chapter.id]?.bestScore ?? 0) === 100).length;
  const experiments = Object.values(progress).reduce((total, item) => total + BigInt(item.experiments), 0n);
  const experimentCount = compactCount(experiments);

  return <>
    <section className="dashboard-hero">
      <div className="hero-copy">
        <span className="eyebrow">DISCRETE MATHEMATICS · INTERACTIVE EDITION</span>
        <h1 id="dashboard-heading" tabIndex={-1}>把抽象，变成<br /><em>可操作的直觉。</em></h1>
        <p>不只阅读定义，而是改变参数、走过每一步、验证每个猜想。11 章交互实验与原书 996 页内容完整联动。</p>
        <div className="hero-buttons">
          <button className="primary-button" onClick={() => onSelect(1)}>从第一章开始 <ArrowRight size={18} /></button>
          <a className="text-button" href="#learning-map">查看学习地图 <ChevronRight size={16} /></a>
        </div>
      </div>
      <div className="hero-orbit" aria-hidden="true">
        <div className="orbit orbit-one" /><div className="orbit orbit-two" />
        <div className="orbit-core">∴<span>STRUCTURE</span></div>
        {['∀', '∪', '→', '○', '∘'].map((symbol, index) => <span className={`orbit-symbol symbol-${index + 1}`} key={symbol}>{symbol}</span>)}
      </div>
    </section>
    <section className="dashboard-stats" aria-label="教材规模与学习记录">
      <div><strong>11</strong><span>章知识全景</span><small>完整保留原教材</small></div>
      <div><strong>11</strong><span>个交互实验</span><small>二维 / 三维数学模型</small></div>
      <div><strong className={experimentCount.length > 7 ? 'count-long' : experimentCount.length > 5 ? 'count-compact' : undefined} title={experiments.toLocaleString('zh-CN')} aria-label={`完成实验 ${experiments} 次`}>{experimentCount}</strong><span>次实验完成</span><small>记录仅保存在本机</small></div>
      <div><strong>{completed}<sup>/11</sup></strong><span>章自测通过</span><small>预测、验证、再理解</small></div>
    </section>
    <section className="chapter-index" id="learning-map">
      <div className="section-heading"><div><span className="eyebrow">LEARNING ATLAS</span><h2>十一章学习地图</h2></div><p>选择一个章节，进入它的核心数学结构。</p></div>
      <div className="chapter-grid">
        {chapters.map((chapter) => {
          const item = progress[chapter.id];
          return <button className={`chapter-card accent-${chapter.accent}`} key={chapter.id} onClick={() => onSelect(chapter.id)}>
            <span className="chapter-number">{String(chapter.id).padStart(2, '0')}</span>
            <span className="chapter-card-icon">{chapter.id === 2 || chapter.id === 10 ? '3D' : '↗'}</span>
            <span className="chapter-english">{chapter.english}</span>
            <h3>{chapter.title}</h3>
            <p>{chapter.summary}</p>
            <span className="chapter-lab"><FlaskConical size={15} />{chapter.labName}</span>
            <span className="chapter-card-foot"><span title={item ? `${item.visits} 次学习` : undefined} aria-label={item ? `${item.visits} 次学习，${item.bestScore === 100 ? '自测通过' : '待完成自测'}` : undefined}>{item ? `${compactCount(BigInt(item.visits))} 次学习 · ${item.bestScore === 100 ? '自测通过' : '待完成自测'}` : '尚未开始'}</span><ArrowRight size={17} /></span>
          </button>;
        })}
      </div>
    </section>
  </>;
}

function LearningPath({ chapter }: { chapter: Chapter }) {
  return <section className="learning-path">
    <div className="path-intro"><span className="eyebrow">CHAPTER ROUTE</span><h2>从概念到应用的学习路径</h2><p>先建立问题意识，再进入原教材深读，最后回到实验验证。原书中的微课、正文、源码、播客和习题均保持不变。</p></div>
    <div className="route-list">
      {chapter.sections.map((section, index) => <article className="route-item" key={section.id}>
        <span className="route-index">{String(index + 1).padStart(2, '0')}</span>
        <div><span className="eyebrow">SECTION {section.id}</span><h3>{section.title}</h3><p>{section.focus}</p></div>
        <a href={`../${chapter.source}`} className="outline-button">进入原教材 <ArrowRight size={16} /></a>
      </article>)}
    </div>
    <div className="mastery-note"><BookOpen size={22} /><div><h3>建议学习闭环</h3><p>预测结果 → 操作模型 → 单步解释 → 回到定义 → 完成自测。遇到反例时，优先检查定义中的量词与前提。</p></div></div>
  </section>;
}

function ChapterQuiz({ chapter }: { chapter: Chapter }) {
  const [selected, setSelected] = useState<number | null>(null);
  const recordQuiz = useLearningStore((state) => state.recordQuiz);
  const correct = selected === chapter.quiz.answer;

  return <section className="quiz-layout">
    <div className="quiz-card">
      <span className="eyebrow">ACTIVE RECALL · 单题自测</span>
      <h2>{chapter.quiz.question}</h2>
      <p className="quiz-hint">先独立判断，再查看解释。作答后会记录本章掌握状态。</p>
      <div className="quiz-options">
        {chapter.quiz.options.map((option, index) => <button key={option} disabled={selected !== null} className={`${selected === index ? 'selected' : ''} ${selected !== null && index === chapter.quiz.answer ? 'correct' : ''}`} onClick={() => { setSelected(index); recordQuiz(chapter.id, index === chapter.quiz.answer); }}>
          <span>{String.fromCharCode(65 + index)}</span>{option}{selected !== null && index === chapter.quiz.answer && <Check size={18} />}
        </button>)}
      </div>
      {selected !== null && <div className={`quiz-feedback ${correct ? 'is-correct' : 'is-wrong'}`} role="status"><strong>{correct ? '判断正确' : '再想一步'}</strong><p>{chapter.quiz.explanation}</p></div>}
      {selected !== null && <button className="text-button retry-button" onClick={() => setSelected(null)}><RotateCcw size={15} />重新作答</button>}
    </div>
    <aside className="quiz-aside"><CircleHelp size={28} /><h3>自测不是终点</h3><p>如果答案与直觉不同，回到交互实验主动构造一个反例。能解释“为什么”，比记住选项更重要。</p></aside>
  </section>;
}

function ChapterView({ chapter, onSelect }: { chapter: Chapter; onSelect: (id: number | null) => void }) {
  const [tab, setTab] = useState<ChapterTab>('lab');
  const [toast, setToast] = useState<{ message: string } | null>(null);
  const recordedChapter = useRef<number | null>(null);
  const recordVisit = useLearningStore((state) => state.recordVisit);
  const completeExperiment = useLearningStore((state) => state.completeExperiment);
  const Lab = labRegistry[chapter.id];

  useEffect(() => {
    if (recordedChapter.current !== chapter.id) {
      recordVisit(chapter.id);
      recordedChapter.current = chapter.id;
    }
    setTab('lab');
  }, [chapter.id, recordVisit]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const onComplete = useCallback(() => {
    completeExperiment(chapter.id);
    setToast({ message: isLearningProgressPersisted()
      ? '本次实验已完成，学习记录已保存'
      : '本次实验已完成，记录仅保留在本次会话' });
  }, [chapter.id, completeExperiment]);

  const onTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = CHAPTER_TABS.indexOf(tab);
    let nextIndex: number;
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % CHAPTER_TABS.length;
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + CHAPTER_TABS.length) % CHAPTER_TABS.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = CHAPTER_TABS.length - 1;
    else return;
    event.preventDefault();
    const next = CHAPTER_TABS[nextIndex];
    setTab(next);
    document.getElementById(`chapter-${chapter.id}-tab-${next}`)?.focus();
  };

  return <>
    <header className={`chapter-hero accent-${chapter.accent}`}>
      <div className="chapter-hero-main"><span className="eyebrow">CHAPTER {String(chapter.id).padStart(2, '0')} · {chapter.english}</span><h1 id="chapter-heading" tabIndex={-1}>{chapter.title}</h1><p>{chapter.question}</p></div>
      <a className="source-link" href={`../${chapter.source}`}><BookOpen size={18} /><span>阅读原教材<small>微课 · 正文 · 源码 · 习题</small></span><ArrowRight size={18} /></a>
    </header>
    <div className="chapter-tabs" role="tablist" aria-label="本章学习模式" onKeyDown={onTabKeyDown}>
      {CHAPTER_TABS.map((item) => {
        const label = item === 'lab' ? '交互实验' : item === 'path' ? '学习路径' : '自测反馈';
        const Icon = item === 'lab' ? FlaskConical : item === 'path' ? ListTree : CircleHelp;
        return <button
          key={item}
          id={`chapter-${chapter.id}-tab-${item}`}
          role="tab"
          aria-selected={tab === item}
          aria-controls={`chapter-${chapter.id}-panel-${item}`}
          tabIndex={tab === item ? 0 : -1}
          className={tab === item ? 'active' : ''}
          onClick={() => setTab(item)}
        ><Icon size={17} />{label}</button>;
      })}
    </div>
    <div className="chapter-content">
      {CHAPTER_TABS.map((item) => {
        const content = item === 'lab' ? <>
          <div className="lab-heading"><h2>{chapter.labName}</h2><span className="lab-mode">{chapter.id === 2 || chapter.id === 10 ? '3D + 2D 联动' : '动态模型 + 数学面板'}</span></div>
          <LabBoundary><Suspense fallback={<div className="lab-loading" role="status"><span />正在构建数学模型…</div>}><Lab onComplete={onComplete} /></Suspense></LabBoundary>
          <div className="chapter-learning-notes"><div><span className="eyebrow">LEARNING GOALS</span><h3>完成实验后，你应该能够</h3><ol>{chapter.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ol></div><blockquote><span>常见误区</span><p>{chapter.misconception}</p></blockquote></div>
        </> : item === 'path' ? <LearningPath chapter={chapter} /> : <ChapterQuiz chapter={chapter} />;
        return <div
        key={item}
        role="tabpanel"
        id={`chapter-${chapter.id}-panel-${item}`}
        aria-labelledby={`chapter-${chapter.id}-tab-${item}`}
        tabIndex={0}
        hidden={tab !== item}
      >{item === 'lab'
        ? <LabActivityContext value={tab === 'lab'}>{content}</LabActivityContext>
        : <Activity mode={tab === item ? 'visible' : 'hidden'}>{content}</Activity>}
      </div>;
      })}
    </div>
    <nav className="chapter-pager" aria-label="相邻章节">
      <button disabled={chapter.id === 1} onClick={() => onSelect(chapter.id - 1)}><ArrowLeft size={17} /><span>上一章<small>{getChapter(chapter.id - 1)?.title ?? '已到第一章'}</small></span></button>
      <button disabled={chapter.id === 11} onClick={() => onSelect(chapter.id + 1)}><span>下一章<small>{getChapter(chapter.id + 1)?.title ?? '已到最后一章'}</small></span><ArrowRight size={17} /></button>
    </nav>
    {toast && <div className="toast" role="status"><Check size={18} />{toast.message}</div>}
  </>;
}

export function App() {
  const [selected, setSelected] = useState<number | null>(chapterFromUrl);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const focusChapterHeading = useRef(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try { return window.localStorage.getItem('dm-lab-theme') === 'dark' ? 'dark' : 'light'; }
    catch { return 'light'; }
  });
  const chapter = useMemo(() => selected ? getChapter(selected) : undefined, [selected]);

  useEffect(() => {
    document.title = chapter ? `第${chapter.id}章 ${chapter.title} · 离散数学交互实验室` : '离散数学 · 交互实验室';
  }, [chapter]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { window.localStorage.setItem('dm-lab-theme', theme); } catch { /* 存储不可用时保留内存主题。 */ }
  }, [theme]);

  const selectChapter = (id: number | null) => {
    const restoreMenuFocus = menuOpen;
    const moveToChapter = id !== selected;
    if (moveToChapter) focusChapterHeading.current = true;
    setSelected(id);
    setMenuOpen(false);
    if (moveToChapter) {
      const url = new URL(window.location.href);
      if (id) url.searchParams.set('chapter', String(id)); else url.searchParams.delete('chapter');
      window.history.pushState({}, '', url);
      window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }
    if (restoreMenuFocus && !moveToChapter) window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  };

  useEffect(() => {
    if (!focusChapterHeading.current) return;
    document.getElementById(selected === null ? 'dashboard-heading' : 'chapter-heading')?.focus({ preventScroll: true });
    focusChapterHeading.current = false;
  }, [selected]);

  useEffect(() => {
    let focusFrame = 0;
    const onPopState = () => {
      const next = chapterFromUrl();
      focusChapterHeading.current = true;
      setMenuOpen(false);
      setSelected(next);
      window.cancelAnimationFrame(focusFrame);
      focusFrame = window.requestAnimationFrame(() => {
        document.getElementById(next === null ? 'dashboard-heading' : 'chapter-heading')?.focus({ preventScroll: true });
        focusChapterHeading.current = false;
      });
    };
    window.addEventListener('popstate', onPopState);
    return () => { window.removeEventListener('popstate', onPopState); window.cancelAnimationFrame(focusFrame); };
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 901px)');
    const closeOnDesktop = () => {
      if (!desktop.matches || !menuOpen) return;
      setMenuOpen(false);
      window.requestAnimationFrame(() => sidebarRef.current?.querySelector<HTMLButtonElement>('nav button[aria-current="page"]')?.focus());
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const sidebar = sidebarRef.current;
    const menuButton = menuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // 等待可见性样式生效，再把焦点移入移动目录。
    const focusFrame = window.requestAnimationFrame(() => {
      sidebar?.querySelector<HTMLButtonElement>('button')?.focus();
    });
    const onMenuKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenuOpen(false);
        window.requestAnimationFrame(() => menuButton?.focus());
        return;
      }
      if (event.key !== 'Tab') return;
      const items = Array.from(sidebar?.querySelectorAll<HTMLButtonElement>('button') ?? []);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!items.includes(document.activeElement as HTMLButtonElement)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onMenuKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onMenuKeyDown);
    };
  }, [menuOpen]);

  return <div className="app-shell" data-chapter={selected ?? 0}>
    <a href="#main-content" className="skip-link">跳到主要内容</a>
    <header className="topbar" inert={menuOpen}>
      <button className="brand" onClick={() => selectChapter(null)} aria-label="返回交互实验室首页"><span className="brand-mark">∑</span><span>离散数学<small>交互实验室</small></span></button>
      <div className="topbar-actions"><a href="../index.html"><Home size={16} />教材首页</a><button className="icon-button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={theme === 'light' ? '切换深色模式' : '切换浅色模式'}>{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button><button ref={menuButtonRef} className="icon-button mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? '关闭章节目录' : '打开章节目录'} aria-expanded={menuOpen} aria-controls="chapter-sidebar">{menuOpen ? <X size={19} /> : <Menu size={19} />}</button></div>
    </header>
    <div className="app-body">
      <aside ref={sidebarRef} id="chapter-sidebar" className={`sidebar ${menuOpen ? 'open' : ''}`} role={menuOpen ? 'dialog' : undefined} aria-modal={menuOpen ? true : undefined} aria-label="章节目录">
        {menuOpen && <button className="icon-button sidebar-close" onClick={() => {
          setMenuOpen(false);
          window.requestAnimationFrame(() => menuButtonRef.current?.focus());
        }} aria-label="关闭章节目录"><X size={19} /></button>}
        <span className="eyebrow">COURSE ATLAS</span>
        <nav aria-label="十一章交互实验">
          <button className={!selected ? 'active' : ''} aria-current={!selected ? 'page' : undefined} onClick={() => selectChapter(null)}><span>00</span>学习总览</button>
          {chapters.map((item) => <button key={item.id} className={selected === item.id ? 'active' : ''} aria-current={selected === item.id ? 'page' : undefined} onClick={() => selectChapter(item.id)}><span>{String(item.id).padStart(2, '0')}</span>{item.title}</button>)}
        </nav>
        <div className="sidebar-note"><span>学习方法</span><p>先预测，再操作。<br />让每一步都有数学依据。</p></div>
      </aside>
      {menuOpen && <button className="menu-backdrop" onClick={() => {
        setMenuOpen(false);
        window.requestAnimationFrame(() => menuButtonRef.current?.focus());
      }} tabIndex={-1} aria-label="关闭章节目录" />}
      <main id="main-content" className="main-content" tabIndex={-1} inert={menuOpen}>{chapter ? <ChapterView key={chapter.id} chapter={chapter} onSelect={selectChapter} /> : <Dashboard onSelect={selectChapter} />}</main>
    </div>
    <footer className="app-footer" inert={menuOpen}><span>离散数学数字化教材 © 2026 湖南信息学院 · 谢鑫</span><span>数学在浏览器本地计算 · 无需上传学习数据</span></footer>
  </div>;
}
