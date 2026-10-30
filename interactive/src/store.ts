import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

const LEARNING_STORAGE_KEY = 'dm-interactive-learning-v2';
const memoryStorage = new Map<string, string>();
// 配额等写入失败时，保留尚未保存的会话值，直到持久值确实改变或收到清除事件。
const pendingStorage = new Map<string, { baseline: string | null | undefined; value: string | null }>();

function readStorage(name: string): string | null {
  try {
    const value = window.localStorage.getItem(name);
    const pending = pendingStorage.get(name);
    if (pending && value === pending.baseline) return pending.value;
    pendingStorage.delete(name);
    if (value === null) memoryStorage.delete(name);
    else memoryStorage.set(name, value);
    return value;
  } catch { return memoryStorage.get(name) ?? null; }
}

const safeStorage: StateStorage = {
  getItem: readStorage,
  setItem: (name, value) => {
    memoryStorage.set(name, value);
    let baseline: string | null | undefined;
    try {
      const storage = window.localStorage;
      try { baseline = storage.getItem(name); } catch { /* 读取受限仍可尝试写入。 */ }
      storage.setItem(name, value);
      pendingStorage.delete(name);
    } catch { pendingStorage.set(name, { baseline, value }); }
  },
  removeItem: (name) => {
    memoryStorage.delete(name);
    pendingStorage.delete(name);
    let baseline: string | null | undefined;
    try {
      const storage = window.localStorage;
      try { baseline = storage.getItem(name); } catch { /* 读取受限仍可尝试删除。 */ }
      storage.removeItem(name);
    } catch { pendingStorage.set(name, { baseline, value: null }); }
  },
};

export interface ChapterProgress {
  visits: number;
  experiments: number;
  bestScore: number;
  lastVisited: string;
}

interface LearningState {
  progress: Record<number, ChapterProgress>;
  recordVisit: (chapter: number) => void;
  completeExperiment: (chapter: number) => void;
  recordQuiz: (chapter: number, correct: boolean) => void;
  resetProgress: () => void;
}

const emptyProgress = (): ChapterProgress => ({ visits: 0, experiments: 0, bestScore: 0, lastVisited: '' });

const validChapter = (chapter: number) => Number.isInteger(chapter) && chapter >= 1 && chapter <= 11;
const count = (value: unknown) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : 0;
const increment = (value: number) => Math.min(value + 1, Number.MAX_SAFE_INTEGER);

/** 浏览器存储可被旧版本、扩展或手工修改；只恢复可识别的学习数据。 */
export function normalizeProgress(value: unknown): Record<number, ChapterProgress> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result: Record<number, ChapterProgress> = {};
  for (const [key, item] of Object.entries(value)) {
    const chapter = Number(key);
    if (!validChapter(chapter) || key !== String(chapter) || !item || typeof item !== 'object' || Array.isArray(item)) continue;
    const saved = item as Partial<ChapterProgress>;
    result[chapter] = {
      visits: count(saved.visits),
      experiments: count(saved.experiments),
      bestScore: saved.bestScore === 100 ? 100 : 0,
      lastVisited: typeof saved.lastVisited === 'string' && Number.isFinite(Date.parse(saved.lastVisited)) ? saved.lastVisited : '',
    };
  }
  return result;
}

function progressFromStorage(serialized: string): Record<number, ChapterProgress> {
  const saved: unknown = JSON.parse(serialized);
  const state = saved && typeof saved === 'object' ? (saved as { state?: unknown }).state : undefined;
  return normalizeProgress(state && typeof state === 'object' ? (state as { progress?: unknown }).progress : undefined);
}

function latestProgress(fallback: Record<number, ChapterProgress>): Record<number, ChapterProgress> {
  const serialized = readStorage(LEARNING_STORAGE_KEY);
  if (serialized === null) return {};
  try { return progressFromStorage(serialized); }
  catch { return fallback; }
}

export const useLearningStore = create<LearningState>()(persist((set) => ({
  progress: {},
  recordVisit: (chapter) => {
    if (!validChapter(chapter)) return;
    set((state) => {
      const progress = latestProgress(state.progress);
      const previous = progress[chapter] ?? emptyProgress();
      return { progress: { ...progress, [chapter]: { ...previous, visits: increment(previous.visits), lastVisited: new Date().toISOString() } } };
    });
  },
  completeExperiment: (chapter) => {
    if (!validChapter(chapter)) return;
    set((state) => {
      const progress = latestProgress(state.progress);
      const previous = progress[chapter] ?? emptyProgress();
      return { progress: { ...progress, [chapter]: { ...previous, experiments: increment(previous.experiments), lastVisited: new Date().toISOString() } } };
    });
  },
  recordQuiz: (chapter, correct) => {
    if (!validChapter(chapter)) return;
    set((state) => {
      const progress = latestProgress(state.progress);
      const previous = progress[chapter] ?? emptyProgress();
      return { progress: { ...progress, [chapter]: { ...previous, bestScore: correct ? 100 : Math.max(previous.bestScore, 0), lastVisited: new Date().toISOString() } } };
    });
  },
  resetProgress: () => set({ progress: {} }),
}), {
  name: LEARNING_STORAGE_KEY,
  version: 1,
  storage: createJSONStorage(() => safeStorage),
  partialize: (state) => ({ progress: state.progress }),
  // 首版记录使用 persist 默认的版本 0；升级时保留仍可识别的进度。
  migrate: (saved) => ({
    progress: normalizeProgress(saved && typeof saved === 'object' ? (saved as { progress?: unknown }).progress : undefined),
  }),
  merge: (saved, current) => ({
    ...current,
    progress: normalizeProgress(saved && typeof saved === 'object' ? (saved as { progress?: unknown }).progress : undefined),
  }),
}));

/** 只读核对当前进度是否实际可恢复，不通过内存回退冒充已保存，也不补写。 */
export function isLearningProgressPersisted(): boolean {
  if (pendingStorage.has(LEARNING_STORAGE_KEY)) return false;
  try {
    const serialized = window.localStorage.getItem(LEARNING_STORAGE_KEY);
    const saved = serialized === null ? {} : progressFromStorage(serialized);
    return JSON.stringify(saved) === JSON.stringify(normalizeProgress(useLearningStore.getState().progress));
  } catch { return false; }
}

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  const target = window;
  const synchronizeStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== LEARNING_STORAGE_KEY) return;
    try {
      if (event.storageArea && event.storageArea !== target.localStorage) return;
    } catch { /* 权限可在事件到达前变化；仍使用本次事件提供的值。 */ }
    const pending = pendingStorage.get(LEARNING_STORAGE_KEY);
    const alreadyObserved = event.key === LEARNING_STORAGE_KEY && event.newValue !== null
      && pending?.baseline === event.newValue;
    if (!alreadyObserved) {
      pendingStorage.delete(LEARNING_STORAGE_KEY);
      if (event.key === null || event.newValue === null) memoryStorage.delete(LEARNING_STORAGE_KEY);
      else memoryStorage.set(LEARNING_STORAGE_KEY, event.newValue);
    }
    // rehydrate 使用 persist 内部的原始 set；普通更新和删除不再写回其他标签。
    void useLearningStore.persist.rehydrate();
  };
  target.addEventListener('storage', synchronizeStorage);
  import.meta.hot?.dispose(() => target.removeEventListener('storage', synchronizeStorage));
}
