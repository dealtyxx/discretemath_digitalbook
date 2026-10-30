import { describe, expect, it } from 'vitest';
import {
  applyMatrixToVector,
  composeSequence,
  faceAtVector,
  facePermutation,
  IDENTITY_MATRIX,
  inverseQuarterTurn,
  inverseSequence,
  matricesEqual,
  matrixToQuaternion,
  multiplyMatrices,
  QUARTER_TURN_MATRICES,
  transposeMatrix,
  type QuarterTurn,
} from './ch10';

const turns: QuarterTurn[] = ['X90', 'X-90', 'Y90', 'Y-90', 'Z90', 'Z-90'];

describe('第 10 章：右手系四分之一转', () => {
  it('X90 把前面 +Z 送到下面 -Y，Y90 把前面 +Z 送到右面 +X', () => {
    expect(applyMatrixToVector(QUARTER_TURN_MATRICES.X90, [0, 0, 1])).toEqual([0, -1, 0]);
    expect(applyMatrixToVector(QUARTER_TURN_MATRICES.Y90, [0, 0, 1])).toEqual([1, 0, 0]);
    expect(faceAtVector(applyMatrixToVector(QUARTER_TURN_MATRICES.X90, [0, 1, 0])).id).toBe('F');
  });

  it('每个逆操作都是矩阵转置，并恢复单位矩阵', () => {
    for (const operation of turns) {
      const matrix = QUARTER_TURN_MATRICES[operation];
      const inverse = QUARTER_TURN_MATRICES[inverseQuarterTurn(operation)];
      expect(inverse).toEqual(transposeMatrix(matrix));
      expect(multiplyMatrices(inverse, matrix)).toEqual(IDENTITY_MATRIX);
    }
  });

  it('一般三维旋转不交换，X90→Y90 与 Y90→X90 给出不同结果', () => {
    const xy = composeSequence(['X90', 'Y90']);
    const yx = composeSequence(['Y90', 'X90']);
    expect(xy).toEqual(multiplyMatrices(QUARTER_TURN_MATRICES.Y90, QUARTER_TURN_MATRICES.X90));
    expect(yx).toEqual(multiplyMatrices(QUARTER_TURN_MATRICES.X90, QUARTER_TURN_MATRICES.Y90));
    expect(matricesEqual(xy, yx)).toBe(false);
    expect(applyMatrixToVector(xy, [0, 0, 1])).not.toEqual(applyMatrixToVector(yx, [0, 0, 1]));
  });

  it('绕同一轴的旋转可交换，四次恢复恒等', () => {
    expect(composeSequence(['X90', 'X90', 'X90', 'X90'])).toEqual(IDENTITY_MATRIX);
    expect(composeSequence(['X90', 'X-90'])).toEqual(IDENTITY_MATRIX);
    expect(composeSequence(['Y90', 'Y90', 'Y90', 'Y90'])).toEqual(IDENTITY_MATRIX);
  });

  it('总逆序列按相反顺序追加，能够精确还原', () => {
    const operations: QuarterTurn[] = ['X90', 'Y90', 'Z-90', 'X-90'];
    const restored = composeSequence([...operations, ...inverseSequence(operations)]);
    expect(inverseSequence(operations)).toEqual(['X90', 'Z90', 'Y-90', 'X-90']);
    expect(restored).toEqual(IDENTITY_MATRIX);
    expect(inverseSequence([])).toEqual([]);
  });

  it('面置换始终给出六个不同的空间方向，非交换性在二维视图中可见', () => {
    for (const operations of [[], ['X90'], ['X90', 'Y90'], ['Y90', 'X90']] as QuarterTurn[][]) {
      const permutation = facePermutation(composeSequence(operations));
      expect(new Set(permutation.map((item) => item.targetId)).size).toBe(6);
    }
    const xy = facePermutation(composeSequence(['X90', 'Y90']));
    const yx = facePermutation(composeSequence(['Y90', 'X90']));
    expect(xy.map((item) => item.targetId)).not.toEqual(yx.map((item) => item.targetId));
    expect(() => faceAtVector([1, 1, 0])).toThrow(RangeError);
  });
});

describe('第 10 章：旋转矩阵与四元数同步', () => {
  it('单位旋转与 X90 四元数的顺序均为 [x,y,z,w]', () => {
    expect(matrixToQuaternion(IDENTITY_MATRIX)).toEqual([0, 0, 0, 1]);
    const quaternion = matrixToQuaternion(QUARTER_TURN_MATRICES.X90);
    expect(quaternion[0]).toBeCloseTo(Math.SQRT1_2);
    expect(quaternion[1]).toBe(0);
    expect(quaternion[2]).toBe(0);
    expect(quaternion[3]).toBeCloseTo(Math.SQRT1_2);
  });

  it('所有基础旋转、复合与总逆旋转的四元数均为单位四元数', () => {
    const sequences = [
      ...turns.map((turn) => [turn]),
      ['X90', 'Y90'],
      ['Y90', 'X90'],
      ['X90', 'Y90', 'Z90', 'X-90'],
    ] as QuarterTurn[][];
    for (const sequence of sequences) {
      const quaternion = matrixToQuaternion(composeSequence(sequence));
      expect(Math.hypot(...quaternion)).toBeCloseTo(1);
    }
  });

  it('四元数旋转向量与矩阵结果一致，并覆盖各个转换分支', () => {
    const sequences = [
      [],
      ['X90', 'X90'],
      ['Y90', 'Y90'],
      ['Z90', 'Z90'],
      ['X90', 'Y90'],
      ['Y90', 'X90'],
      ['X90', 'Y90', 'Z90', 'X-90'],
    ] as QuarterTurn[][];
    const vectors = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [1, -2, 3]] as const;

    for (const sequence of sequences) {
      const matrix = composeSequence(sequence);
      const [x, y, z, w] = matrixToQuaternion(matrix);
      for (const vector of vectors) {
        const [vx, vy, vz] = vector;
        const tx = 2 * (y * vz - z * vy);
        const ty = 2 * (z * vx - x * vz);
        const tz = 2 * (x * vy - y * vx);
        const quaternionImage = [
          vx + w * tx + y * tz - z * ty,
          vy + w * ty + z * tx - x * tz,
          vz + w * tz + x * ty - y * tx,
        ];
        const matrixImage = applyMatrixToVector(matrix, vector);
        quaternionImage.forEach((value, index) => expect(value).toBeCloseTo(matrixImage[index]));
      }
    }
  });
});
