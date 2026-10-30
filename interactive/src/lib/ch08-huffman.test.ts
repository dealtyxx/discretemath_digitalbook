import { describe, expect, it } from 'vitest';
import {
  CH8_HUFFMAN_SYMBOLS,
  generateHuffmanSteps,
  huffmanMetrics,
  huffmanTreeDepths,
  huffmanTreeLayout,
  isPrefixCode,
} from './ch08-huffman';

function last<T>(items: T[]): T {
  return items[items.length - 1];
}

describe('第8章 Huffman 构造', () => {
  it('普通对象原型同名的合法符号也能完整编码', () => {
    const symbols = [
      { symbol: '__proto__', weight: 1 },
      { symbol: 'constructor', weight: 2 },
      { symbol: 'toString', weight: 4 },
    ];
    const done = last(generateHuffmanSteps(symbols));
    expect(Object.keys(done.codes).sort()).toEqual(symbols.map(({ symbol }) => symbol).sort());
    expect(Object.getPrototypeOf(done.codes)).toBe(Object.prototype);
    expect(isPrefixCode(done.codes)).toBe(true);
    expect(huffmanMetrics(symbols, done.codes).weightedPathLength).toBe(10);
    expect(last(generateHuffmanSteps([{ symbol: '__proto__', weight: 4 }])).codes.__proto__).toBe('0');
  });

  it('复现原书 a—h 频率例子的 274 单位 WPL 和 26 单位节省', () => {
    const steps = generateHuffmanSteps(CH8_HUFFMAN_SYMBOLS);
    const done = last(steps);
    expect(done.kind).toBe('done');
    expect(done.queue).toHaveLength(1);
    expect(done.totalCost).toBe(274);
    expect(steps.filter((step) => step.kind === 'select')).toHaveLength(7);
    expect(steps.filter((step) => step.kind === 'merge')).toHaveLength(7);

    const metrics = huffmanMetrics(CH8_HUFFMAN_SYMBOLS, done.codes);
    expect(metrics.totalWeight).toBe(100);
    expect(metrics.weightedPathLength).toBe(274);
    expect(metrics.averageLength).toBeCloseTo(2.74);
    expect(metrics.fixedWidth).toBe(3);
    expect(metrics.fixedLength).toBe(300);
    expect(metrics.savedBits).toBe(26);
  });

  it('左右分支生成确定的前缀码，码长与合并代价一致', () => {
    const done = last(generateHuffmanSteps(CH8_HUFFMAN_SYMBOLS));
    expect(done.codes).toEqual({
      a: '00', b: '0100', c: '1000', d: '011',
      e: '11', f: '1001', g: '0101', h: '101',
    });
    expect(isPrefixCode(done.codes)).toBe(true);
    expect(CH8_HUFFMAN_SYMBOLS.reduce((sum, { symbol, weight }) => (
      sum + weight * done.codes[symbol].length
    ), 0)).toBe(done.totalCost);
    expect(huffmanTreeDepths(done.nodes)[done.queue[0]]).toBe(
      Math.max(...Object.values(done.codes).map((code) => code.length)),
    );
  });

  it('选择快照先于合并，历史节点和队列不会被后续操作改写', () => {
    const steps = generateHuffmanSteps(CH8_HUFFMAN_SYMBOLS);
    const initial = steps[0];
    const firstSelection = steps[1];
    const firstMerge = steps[2];
    expect(firstSelection.kind).toBe('select');
    expect(firstSelection.selected?.map((id) => initial.nodes[id].symbol)).toEqual(['b', 'g']);
    expect(Object.keys(firstSelection.nodes)).toHaveLength(8);
    expect(firstMerge.kind).toBe('merge');
    expect(Object.keys(firstMerge.nodes)).toHaveLength(9);
    expect(firstMerge.totalCost).toBe(10);
    expect(initial.queue).toHaveLength(8);
    expect(initial.nodes['leaf-1'].left).toBeNull();
    for (let index = 1; index < steps.length; index += 1) {
      expect(steps[index].nodes).not.toBe(steps[index - 1].nodes);
      expect(steps[index].queue).not.toBe(steps[index - 1].queue);
    }
  });

  it('一个符号也分配一位码 0，避免空编码', () => {
    const symbols = [{ symbol: '仅', weight: 4 }];
    const done = last(generateHuffmanSteps(symbols));
    expect(done.codes).toEqual({ 仅: '0' });
    expect(done.totalCost).toBe(4);
    expect(huffmanMetrics(symbols, done.codes)).toMatchObject({
      weightedPathLength: 4,
      averageLength: 1,
      fixedWidth: 1,
    });
  });

  it('拒绝非正权、重复符号、缺失编码和非前缀码', () => {
    expect(() => generateHuffmanSteps([{ symbol: 'a', weight: 0 }])).toThrow(RangeError);
    expect(() => generateHuffmanSteps([{ symbol: 'a', weight: 1 }, { symbol: 'a', weight: 2 }])).toThrow(RangeError);
    expect(() => huffmanMetrics([{ symbol: 'a', weight: 1 }], {})).toThrow(RangeError);
    expect(isPrefixCode({ a: '0', b: '01' })).toBe(false);
    expect(isPrefixCode({ a: '01', b: '11' })).toBe(true);
    expect(() => huffmanMetrics([{ symbol: 'a', weight: 1 }, { symbol: 'b', weight: 2 }], { a: '0', b: '01' })).toThrow(RangeError);
  });

  it('树布局按左右子树排列，默认对称符号合并后不会产生重叠父节点', () => {
    const done = last(generateHuffmanSteps(CH8_HUFFMAN_SYMBOLS));
    const layout = huffmanTreeLayout(done.nodes, done.queue);
    const points = Object.values(layout).map(({ x, y }) => `${x},${y}`);
    expect(new Set(points).size).toBe(Object.keys(done.nodes).length);
    for (const node of Object.values(done.nodes)) {
      expect(Number.isFinite(layout[node.id].x)).toBe(true);
      expect(Number.isFinite(layout[node.id].y)).toBe(true);
      if (node.left && node.right) {
        expect(layout[node.left].x).toBeLessThan(layout[node.id].x);
        expect(layout[node.right].x).toBeGreaterThan(layout[node.id].x);
        expect(layout[node.left].y).toBeGreaterThan(layout[node.id].y);
        expect(layout[node.right].y).toBeGreaterThan(layout[node.id].y);
        expect(layout[node.left].y - layout[node.id].y).toBeGreaterThanOrEqual(78);
      }
    }
  });

  it('偏斜的七层 Huffman 树仍保留层距，节点与标注无需挤压到固定高度', () => {
    const done = last(generateHuffmanSteps([1, 1, 2, 3, 5, 8, 13, 21].map((weight, index) => ({ symbol: String(index), weight }))));
    const layout = huffmanTreeLayout(done.nodes, done.queue);
    expect(Math.max(...Object.values(layout).map((point) => point.y))).toBe(50 + 7 * 78);
    for (const node of Object.values(done.nodes)) {
      if (node.left && node.right) {
        expect(layout[node.left].y - layout[node.id].y).toBeGreaterThanOrEqual(78);
        expect(layout[node.right].y - layout[node.id].y).toBeGreaterThanOrEqual(78);
      }
    }
    expect(new Set(Object.values(done.nodes).filter((node) => node.symbol !== null).map((node) => layout[node.id].y)).size).toBe(1);
  });
});
