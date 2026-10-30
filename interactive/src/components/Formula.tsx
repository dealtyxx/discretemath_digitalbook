import katex from 'katex';
import { useEffect, useMemo, useRef, useState } from 'react';

interface FormulaProps {
  tex: string;
  display?: boolean;
  className?: string;
}

export function Formula({ tex, display = true, className = '' }: FormulaProps) {
  const container = useRef<HTMLDivElement & HTMLSpanElement>(null);
  const [scrollable, setScrollable] = useState(false);
  const html = useMemo(() => katex.renderToString(tex, {
    displayMode: display,
    throwOnError: false,
    strict: 'ignore',
    output: 'htmlAndMathml',
  }), [display, tex]);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const measure = () => setScrollable(element.scrollWidth > element.clientWidth + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    const content = element.firstElementChild;
    if (content) observer.observe(content);
    return () => observer.disconnect();
  }, [html]);

  const accessibility = {
    ref: container,
    role: scrollable ? 'region' : undefined,
    tabIndex: scrollable ? 0 : undefined,
    'aria-label': scrollable ? '数学公式，可横向滚动查看完整内容' : undefined,
  };

  return display
    ? <div {...accessibility} className={`formula ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
    : <span {...accessibility} className={`formula formula-inline ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
