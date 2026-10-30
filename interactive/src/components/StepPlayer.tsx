import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import type { TeachingStep } from '../types';
import { Formula } from './Formula';
import { useLabActive } from './LabActivity';

interface StepPlayerProps {
  steps: TeachingStep[];
  current: number;
  onChange: (step: number) => void;
  onComplete?: () => void;
  label?: string;
}

export function StepPlayer({ steps, current, onChange, onComplete, label = '算法步骤播放器' }: StepPlayerProps) {
  const active = useLabActive();
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const completed = useRef(false);
  const last = Math.max(0, steps.length - 1);
  const safeCurrent = Number.isFinite(current) ? Math.min(Math.max(0, Math.trunc(current)), last) : 0;
  const previousCurrent = useRef(safeCurrent);
  // 部分实验每次渲染都会重建数组，因此比较内容而非数组引用。
  const sequenceKey = JSON.stringify(steps);
  const previousSequence = useRef(sequenceKey);
  const step = steps[safeCurrent];

  useEffect(() => {
    if (!active) setPlaying(false);
  }, [active]);

  useEffect(() => {
    if (previousSequence.current === sequenceKey) return;
    previousSequence.current = sequenceKey;
    completed.current = false;
    previousCurrent.current = safeCurrent;
    setPlaying(false);
  }, [sequenceKey, safeCurrent]);

  useEffect(() => {
    if (!playing || !active) return;
    if (safeCurrent >= last) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => onChange(safeCurrent + 1), 1500 / speed);
    return () => window.clearTimeout(timer);
  }, [playing, active, safeCurrent, last, onChange, speed]);

  useEffect(() => {
    const enteredLastStep = safeCurrent === last && previousCurrent.current !== safeCurrent;
    if (enteredLastStep && steps.length > 1 && !completed.current) {
      completed.current = true;
      onComplete?.();
    } else if (safeCurrent < last) {
      completed.current = false;
    }
    previousCurrent.current = safeCurrent;
  }, [safeCurrent, last, onComplete, steps.length]);

  if (!step) return null;

  const goTo = (next: number) => {
    setPlaying(false);
    onChange(Math.min(Math.max(0, next), last));
  };

  return (
    <section className="step-player" aria-label={label}>
      <div className="step-player-top">
        <div>
          <span className="eyebrow">STEP {String(safeCurrent + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}</span>
          <h3>{step.title}</h3>
        </div>
        <label className="speed-control">速度
          <select value={speed} onChange={(event) => setSpeed(Number(event.target.value))} aria-label="播放速度">
            <option value={0.5}>0.5×</option><option value={1}>1×</option><option value={1.5}>1.5×</option><option value={2}>2×</option>
          </select>
        </label>
      </div>
      <div className="step-progress" aria-hidden="true"><i style={{ width: `${((safeCurrent + 1) / steps.length) * 100}%` }} /></div>
      <p className="step-explanation" aria-live="polite">{step.explanation}</p>
      {step.formula && <Formula tex={step.formula} className="step-formula" />}
      <div className="step-controls">
        <button className="icon-button" onClick={() => goTo(0)} disabled={safeCurrent === 0} aria-label="回到第一步" title="回到第一步"><RotateCcw size={17} /></button>
        <button className="icon-button" onClick={() => goTo(safeCurrent - 1)} disabled={safeCurrent === 0} aria-label="上一步" title="上一步"><ChevronLeft size={19} /></button>
        <button className="play-button" onClick={() => {
          if (safeCurrent === last) onChange(0);
          setPlaying((value) => !value);
        }} disabled={steps.length < 2} aria-label={playing ? '暂停' : '自动播放'} aria-pressed={playing}>{playing ? <Pause size={17} /> : <Play size={17} />}{playing ? '暂停' : '播放'}</button>
        <button className="icon-button" onClick={() => goTo(safeCurrent + 1)} disabled={safeCurrent === last} aria-label="下一步" title="下一步"><ChevronRight size={19} /></button>
        <span className="step-label">{step.label}</span>
      </div>
      <div className="step-dots" aria-label="跳转到指定步骤">
        {steps.map((item, index) => <button key={`${item.label}-${index}`} className={index === safeCurrent ? 'active' : ''} onClick={() => goTo(index)} aria-label={`第 ${index + 1} 步：${item.title}`} aria-current={index === safeCurrent ? 'step' : undefined} />)}
      </div>
    </section>
  );
}
