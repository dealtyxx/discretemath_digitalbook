import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { normalizeProgress } from './store';

const STORAGE_KEY = 'dm-interactive-learning-v2';
const savedProgress = (progress: Record<number, unknown>, version = 1) => JSON.stringify({ state: { progress }, version });

function storageWindow(initial: string | null = null) {
  const local = new Map<string, string>(initial === null ? [] : [[STORAGE_KEY, initial]]);
  const storage = {
    getItem: (key: string) => local.get(key) ?? null,
    setItem: vi.fn((key: string, value: string) => { local.set(key, value); }),
    removeItem: vi.fn((key: string) => { local.delete(key); }),
  };
  const target = Object.assign(new EventTarget(), { localStorage: storage });
  vi.stubGlobal('window', target);
  const remote = (key: string | null, newValue: string | null, area: object = storage) => {
    if (area === storage) {
      if (key === null) local.clear();
      else if (newValue === null) local.delete(key);
      else local.set(key, newValue);
    }
    target.dispatchEvent(Object.assign(new Event('storage'), { key, newValue, storageArea: area }));
  };
  return { local, storage, target, remote };
}

beforeEach(() => vi.resetModules());

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('学习记录恢复', () => {
  it.each([0, undefined])('保留旧版（version=%s）已经保存的学习记录', async (version) => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const local = new Map<string, string>([['dm-interactive-learning-v2', JSON.stringify({
      state: { progress: { 1: { visits: 9, experiments: 3, bestScore: 100, lastVisited: '2026-10-29T01:00:00.000Z' } } },
      ...(version === undefined ? {} : { version }),
    })]]);
    vi.stubGlobal('window', { localStorage: {
      getItem: (key: string) => local.get(key) ?? null,
      setItem: (key: string, value: string) => local.set(key, value),
      removeItem: (key: string) => local.delete(key),
    } });
    const { useLearningStore } = await import('./store');
    expect(useLearningStore.getState().progress[1]).toMatchObject({ visits: 9, experiments: 3, bestScore: 100 });
    useLearningStore.getState().recordVisit(1);
    expect(useLearningStore.getState().progress[1].visits).toBe(10);
    expect(JSON.parse(local.get('dm-interactive-learning-v2')!).version).toBe(1);
    expect(errors).not.toHaveBeenCalled();
  });

  it('丢弃无效章节与损坏字段，同时保留有效记录', () => {
    expect(normalizeProgress({
      1: { visits: 3, experiments: 2, bestScore: 100, lastVisited: '2026-10-29T01:00:00.000Z' },
      2: { visits: '9', experiments: -4, bestScore: '100', lastVisited: 'invalid' },
      3: null,
      4: [],
      12: { visits: 1 },
      '01': { visits: 8 },
    })).toEqual({
      1: { visits: 3, experiments: 2, bestScore: 100, lastVisited: '2026-10-29T01:00:00.000Z' },
      2: { visits: 0, experiments: 0, bestScore: 0, lastVisited: '' },
    });
    for (const value of [null, [], 'broken', 42]) expect(normalizeProgress(value)).toEqual({});
    expect(normalizeProgress({ 1: { visits: Infinity, experiments: Number.MAX_SAFE_INTEGER + 1 } })[1].visits).toBe(0);
  });

  it('恢复数据不能覆盖方法，写回只包含经过校验的进度', async () => {
    const local = new Map<string, string>([['dm-interactive-learning-v2', JSON.stringify({
      state: { progress: { 1: { visits: 2, experiments: 4, bestScore: 100 } }, recordVisit: null, resetProgress: false },
      version: 1,
    })]]);
    vi.stubGlobal('window', { localStorage: {
      getItem: (key: string) => local.get(key) ?? null,
      setItem: (key: string, value: string) => local.set(key, value),
      removeItem: (key: string) => local.delete(key),
    } });
    const { useLearningStore } = await import('./store');
    useLearningStore.getState().recordVisit(1);
    useLearningStore.getState().recordQuiz(1, false);
    expect(useLearningStore.getState().progress[1]).toMatchObject({ visits: 3, experiments: 4, bestScore: 100 });
    expect(typeof useLearningStore.getState().resetProgress).toBe('function');
    expect(Object.keys(JSON.parse(local.get('dm-interactive-learning-v2')!).state)).toEqual(['progress']);
    useLearningStore.getState().recordVisit(0);
    useLearningStore.getState().completeExperiment(12);
    expect(Object.keys(useLearningStore.getState().progress)).toEqual(['1']);
  });

  it('存储不可用或JSON损坏时仍能记录本次学习', async () => {
    vi.stubGlobal('window', { localStorage: {
      getItem: () => '{bad JSON',
      setItem: () => { throw new Error('storage blocked'); },
    } });
    const { useLearningStore } = await import('./store');
    useLearningStore.getState().completeExperiment(2);
    expect(useLearningStore.getState().progress[2].experiments).toBe(1);
  });

  it('localStorage 属性本身被禁用时，在会话内恢复和清空记录', async () => {
    vi.stubGlobal('window', { get localStorage() { throw new Error('SecurityError'); } });
    const { useLearningStore } = await import('./store');
    useLearningStore.getState().recordVisit(2);
    useLearningStore.getState().completeExperiment(2);
    useLearningStore.getState().recordQuiz(2, true);
    await useLearningStore.persist.rehydrate();
    expect(useLearningStore.getState().progress[2]).toMatchObject({ visits: 1, experiments: 1, bestScore: 100 });
    useLearningStore.getState().resetProgress();
    await useLearningStore.persist.rehydrate();
    expect(useLearningStore.getState().progress).toEqual({});
  });

  it('计数到安全整数上限后饱和，非法章节不能新增记录', async () => {
    const local = new Map<string, string>([['dm-interactive-learning-v2', JSON.stringify({
      state: { progress: { 1: { visits: Number.MAX_SAFE_INTEGER, experiments: Number.MAX_SAFE_INTEGER, bestScore: 100 } } },
      version: 1,
    })]]);
    vi.stubGlobal('window', { localStorage: {
      getItem: (key: string) => local.get(key) ?? null,
      setItem: (key: string, value: string) => local.set(key, value),
    } });
    const { useLearningStore } = await import('./store');
    useLearningStore.getState().recordVisit(1);
    useLearningStore.getState().completeExperiment(1);
    useLearningStore.getState().recordQuiz(1, false);
    expect(useLearningStore.getState().progress[1]).toMatchObject({ visits: Number.MAX_SAFE_INTEGER, experiments: Number.MAX_SAFE_INTEGER, bestScore: 100 });
    for (const chapter of [-1, 0, 1.5, 12, NaN, Infinity]) {
      useLearningStore.getState().recordVisit(chapter);
      useLearningStore.getState().completeExperiment(chapter);
      useLearningStore.getState().recordQuiz(chapter, true);
    }
    expect(Object.keys(useLearningStore.getState().progress)).toEqual(['1']);
  });

  it('确实读到已删除的键时，不会再从内存缓存恢复旧记录', async () => {
    const f = storageWindow(savedProgress({ 1: { visits: 1, experiments: 1, bestScore: 100 } }));
    const { useLearningStore } = await import('./store');
    useLearningStore.getState().completeExperiment(1);
    f.local.delete(STORAGE_KEY);
    await useLearningStore.persist.rehydrate();
    expect(useLearningStore.getState().progress).toEqual({});
  });

  it.each([STORAGE_KEY, null])('收到跨文档清除事件（key=%s）后，新操作从空记录开始且监听不回写', async (key) => {
    const f = storageWindow(savedProgress({ 1: { visits: 4, experiments: 1, bestScore: 100 } }));
    const { useLearningStore } = await import('./store');
    useLearningStore.getState().recordVisit(1);
    f.storage.setItem.mockClear();
    f.remote(key, null);
    expect(useLearningStore.getState().progress).toEqual({});
    expect(f.storage.setItem).not.toHaveBeenCalled();
    useLearningStore.getState().completeExperiment(1);
    expect(useLearningStore.getState().progress[1]).toMatchObject({ visits: 0, experiments: 1, bestScore: 0 });
    f.remote(key, null);
    useLearningStore.getState().recordVisit(3);
    expect(Object.keys(useLearningStore.getState().progress)).toEqual(['3']);
    expect(JSON.parse(f.local.get(STORAGE_KEY)!).state.progress[1]).toBeUndefined();
  });

  it.each(['complete', 'switch'])('当前文档直接清空且没有自身storage事件时，后续%s不会复活旧数据', async (action) => {
    const f = storageWindow(savedProgress({ 1: { visits: 4, experiments: 1, bestScore: 100 }, 4: { visits: 2 } }));
    const { useLearningStore } = await import('./store');
    useLearningStore.getState().recordVisit(1);
    f.local.clear();
    if (action === 'complete') {
      useLearningStore.getState().completeExperiment(1);
      expect(useLearningStore.getState().progress[1]).toMatchObject({ visits: 0, experiments: 1, bestScore: 0 });
    } else {
      useLearningStore.getState().recordVisit(3);
      expect(Object.keys(useLearningStore.getState().progress)).toEqual(['3']);
    }
    expect(useLearningStore.getState().progress[4]).toBeUndefined();
  });

  it('跨文档普通更新立即同步，动作不被覆盖，版本迁移后不会反馈写入循环', async () => {
    const f = storageWindow(savedProgress({ 1: { visits: 1, experiments: 1 } }));
    const { useLearningStore } = await import('./store');
    const recordVisit = useLearningStore.getState().recordVisit;
    const update = JSON.stringify({ state: { progress: { 2: { visits: 5, experiments: 7, bestScore: 100 } }, recordVisit: null }, version: 1 });
    f.remote(STORAGE_KEY, update);
    expect(useLearningStore.getState().progress[2]).toMatchObject({ visits: 5, experiments: 7, bestScore: 100 });
    expect(useLearningStore.getState().progress[1]).toBeUndefined();
    expect(useLearningStore.getState().recordVisit).toBe(recordVisit);
    expect(f.storage.setItem).not.toHaveBeenCalled();
    f.remote(STORAGE_KEY, savedProgress({ 3: { visits: 6, experiments: 2 } }, 0));
    expect(useLearningStore.getState().progress[3]).toMatchObject({ visits: 6, experiments: 2 });
    expect(f.storage.setItem).toHaveBeenCalledTimes(1);
    const migrated = f.local.get(STORAGE_KEY)!;
    expect(JSON.parse(migrated).version).toBe(1);
    f.remote(STORAGE_KEY, migrated);
    expect(f.storage.setItem).toHaveBeenCalledTimes(1);
  });

  it('忽略其他键和sessionStorage的清空事件', async () => {
    const f = storageWindow(savedProgress({ 1: { visits: 2 } }));
    const { useLearningStore } = await import('./store');
    f.remote('unrelated-key', null);
    f.remote(null, null, {});
    expect(useLearningStore.getState().progress[1].visits).toBe(2);
    expect(f.storage.setItem).not.toHaveBeenCalled();
  });

  it('读取被禁用后仍能接收明确的跨文档清除，并保留后续会话记录', async () => {
    const f = storageWindow(savedProgress({ 1: { visits: 2, bestScore: 100 } }));
    const { useLearningStore } = await import('./store');
    useLearningStore.getState().completeExperiment(1);
    Object.defineProperty(f.target, 'localStorage', { get() { throw new Error('SecurityError'); } });
    f.remote(STORAGE_KEY, null);
    expect(useLearningStore.getState().progress).toEqual({});
    useLearningStore.getState().completeExperiment(1);
    useLearningStore.getState().completeExperiment(1);
    expect(useLearningStore.getState().progress[1]).toMatchObject({ experiments: 2, bestScore: 0 });
  });

  it.each([null, savedProgress({ 1: { visits: 3, experiments: 1, bestScore: 100 } })])('可读但配额禁止写入时，未保存的会话操作不会被旧持久值覆盖（%s）', async (initial) => {
    const f = storageWindow(initial);
    f.storage.setItem.mockImplementation(() => { throw new Error('QuotaExceededError'); });
    const { useLearningStore } = await import('./store');
    const initialExperiments = initial ? 1 : 0;
    useLearningStore.getState().completeExperiment(1);
    useLearningStore.getState().completeExperiment(1);
    await useLearningStore.persist.rehydrate();
    expect(useLearningStore.getState().progress[1].experiments).toBe(initialExperiments + 2);
    useLearningStore.getState().resetProgress();
    await useLearningStore.persist.rehydrate();
    expect(useLearningStore.getState().progress).toEqual({});
    useLearningStore.getState().completeExperiment(2);
    expect(Object.keys(useLearningStore.getState().progress)).toEqual(['2']);
  });

  it('迟到但已被写前读取吸收的普通通知，不会丢弃配额受限时的新会话增量', async () => {
    const f = storageWindow();
    const { useLearningStore } = await import('./store');
    const external = savedProgress({ 1: { visits: 3, experiments: 1, bestScore: 100 } });
    f.local.set(STORAGE_KEY, external);
    f.storage.setItem.mockImplementation(() => { throw new Error('QuotaExceededError'); });
    useLearningStore.getState().completeExperiment(1);
    expect(useLearningStore.getState().progress[1].experiments).toBe(2);
    f.target.dispatchEvent(Object.assign(new Event('storage'), { key: STORAGE_KEY, newValue: external, storageArea: f.storage }));
    expect(useLearningStore.getState().progress[1].experiments).toBe(2);
    expect(f.storage.setItem).toHaveBeenCalledTimes(1);
    f.remote(STORAGE_KEY, null);
    expect(useLearningStore.getState().progress).toEqual({});
    useLearningStore.getState().completeExperiment(1);
    useLearningStore.getState().completeExperiment(1);
    expect(useLearningStore.getState().progress[1]).toMatchObject({ experiments: 2, bestScore: 0 });
  });

  it('保存状态只读区分实际成功、配额失败和恢复成功，旧持久值不冒充新记录已保存', async () => {
    const f = storageWindow();
    const { useLearningStore, isLearningProgressPersisted } = await import('./store');
    useLearningStore.getState().completeExperiment(1);
    expect(isLearningProgressPersisted()).toBe(true);
    const persisted = f.local.get(STORAGE_KEY);
    f.storage.setItem.mockImplementation(() => { throw new Error('QuotaExceededError'); });
    useLearningStore.getState().completeExperiment(1);
    expect(useLearningStore.getState().progress[1].experiments).toBe(2);
    expect(f.local.get(STORAGE_KEY)).toBe(persisted);
    expect(isLearningProgressPersisted()).toBe(false);
    await useLearningStore.persist.rehydrate();
    expect(isLearningProgressPersisted()).toBe(false);
    const writes = f.storage.setItem.mock.calls.length;
    isLearningProgressPersisted();
    expect(f.storage.setItem).toHaveBeenCalledTimes(writes);
    f.storage.setItem.mockImplementation((key, value) => { f.local.set(key, value); });
    useLearningStore.getState().completeExperiment(1);
    expect(isLearningProgressPersisted()).toBe(true);
    expect(JSON.parse(f.local.get(STORAGE_KEY)!).state.progress[1].experiments).toBe(3);
  });

  it('读取不可用、值已清空或JSON损坏时，保存状态不返回虚假成功且不改变记录', async () => {
    const f = storageWindow();
    const { useLearningStore, isLearningProgressPersisted } = await import('./store');
    useLearningStore.getState().completeExperiment(1);
    f.local.clear();
    expect(isLearningProgressPersisted()).toBe(false);
    expect(useLearningStore.getState().progress[1].experiments).toBe(1);
    f.local.set(STORAGE_KEY, '{bad JSON');
    expect(isLearningProgressPersisted()).toBe(false);
    expect(f.local.get(STORAGE_KEY)).toBe('{bad JSON');
    Object.defineProperty(f.target, 'localStorage', { get() { throw new Error('SecurityError'); } });
    expect(isLearningProgressPersisted()).toBe(false);
    expect(useLearningStore.getState().progress[1].experiments).toBe(1);
  });
});
