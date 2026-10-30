export type Vector3 = readonly [number, number, number];
export type Matrix3 = readonly [
  number, number, number,
  number, number, number,
  number, number, number,
];
/** 四元数顺序固定为 [x, y, z, w]，与 three.js 一致。 */
export type Quaternion = readonly [number, number, number, number];
export type QuarterTurn = 'X90' | 'Y90' | 'Z90' | 'X-90' | 'Y-90' | 'Z-90';
export type FaceId = 'R' | 'L' | 'U' | 'D' | 'F' | 'B';

export interface FaceDefinition {
  id: FaceId;
  name: string;
  direction: '+X' | '-X' | '+Y' | '-Y' | '+Z' | '-Z';
  vector: Vector3;
}

export interface FacePermutationItem {
  id: FaceId;
  name: string;
  sourceDirection: string;
  targetId: FaceId;
  targetDirection: string;
  image: Vector3;
}

export const IDENTITY_MATRIX: Matrix3 = [
  1, 0, 0,
  0, 1, 0,
  0, 0, 1,
];

/** 右手系中的主动旋转，矩阵按行存储，作用于列向量。 */
export const QUARTER_TURN_MATRICES: Record<QuarterTurn, Matrix3> = {
  X90: [
    1, 0, 0,
    0, 0, -1,
    0, 1, 0,
  ],
  'X-90': [
    1, 0, 0,
    0, 0, 1,
    0, -1, 0,
  ],
  Y90: [
    0, 0, 1,
    0, 1, 0,
    -1, 0, 0,
  ],
  'Y-90': [
    0, 0, -1,
    0, 1, 0,
    1, 0, 0,
  ],
  Z90: [
    0, -1, 0,
    1, 0, 0,
    0, 0, 1,
  ],
  'Z-90': [
    0, 1, 0,
    -1, 0, 0,
    0, 0, 1,
  ],
};

export const QUARTER_TURN_LABELS: Record<QuarterTurn, string> = {
  X90: 'X +90°',
  'X-90': 'X −90°',
  Y90: 'Y +90°',
  'Y-90': 'Y −90°',
  Z90: 'Z +90°',
  'Z-90': 'Z −90°',
};

export const FACE_DEFINITIONS: readonly FaceDefinition[] = [
  { id: 'R', name: '右面', direction: '+X', vector: [1, 0, 0] },
  { id: 'L', name: '左面', direction: '-X', vector: [-1, 0, 0] },
  { id: 'U', name: '上面', direction: '+Y', vector: [0, 1, 0] },
  { id: 'D', name: '下面', direction: '-Y', vector: [0, -1, 0] },
  { id: 'F', name: '前面', direction: '+Z', vector: [0, 0, 1] },
  { id: 'B', name: '后面', direction: '-Z', vector: [0, 0, -1] },
];

export function multiplyMatrices(a: Matrix3, b: Matrix3): Matrix3 {
  return [
    a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
    a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
    a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
    a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
    a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
    a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
    a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
    a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
    a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
  ];
}

export function transposeMatrix(matrix: Matrix3): Matrix3 {
  return [
    matrix[0], matrix[3], matrix[6],
    matrix[1], matrix[4], matrix[7],
    matrix[2], matrix[5], matrix[8],
  ];
}

export function applyMatrixToVector(matrix: Matrix3, vector: Vector3): Vector3 {
  return [
    matrix[0] * vector[0] + matrix[1] * vector[1] + matrix[2] * vector[2],
    matrix[3] * vector[0] + matrix[4] * vector[1] + matrix[5] * vector[2],
    matrix[6] * vector[0] + matrix[7] * vector[1] + matrix[8] * vector[2],
  ];
}

/**
 * operations 按实际发生的时间顺序排列。
 * 因此 [X90, Y90] 的总矩阵为 R_y·R_x，即后发生的操作在左侧。
 */
export function composeSequence(operations: readonly QuarterTurn[]): Matrix3 {
  return operations.reduce<Matrix3>(
    (accumulated, operation) => multiplyMatrices(QUARTER_TURN_MATRICES[operation], accumulated),
    IDENTITY_MATRIX,
  );
}

export function inverseQuarterTurn(operation: QuarterTurn): QuarterTurn {
  const inverses: Record<QuarterTurn, QuarterTurn> = {
    X90: 'X-90',
    'X-90': 'X90',
    Y90: 'Y-90',
    'Y-90': 'Y90',
    Z90: 'Z-90',
    'Z-90': 'Z90',
  };
  return inverses[operation];
}

/** 总逆变换必须把各个逆操作按相反顺序追加。 */
export function inverseSequence(operations: readonly QuarterTurn[]): QuarterTurn[] {
  return [...operations].reverse().map(inverseQuarterTurn);
}

export function matricesEqual(a: Matrix3, b: Matrix3): boolean {
  return a.every((value, index) => value === b[index]);
}

export function matrixToQuaternion(matrix: Matrix3): Quaternion {
  const trace = matrix[0] + matrix[4] + matrix[8];
  let x: number;
  let y: number;
  let z: number;
  let w: number;

  if (trace > 0) {
    const scale = Math.sqrt(trace + 1) * 2;
    w = 0.25 * scale;
    x = (matrix[7] - matrix[5]) / scale;
    y = (matrix[2] - matrix[6]) / scale;
    z = (matrix[3] - matrix[1]) / scale;
  } else if (matrix[0] > matrix[4] && matrix[0] > matrix[8]) {
    const scale = Math.sqrt(1 + matrix[0] - matrix[4] - matrix[8]) * 2;
    w = (matrix[7] - matrix[5]) / scale;
    x = 0.25 * scale;
    y = (matrix[1] + matrix[3]) / scale;
    z = (matrix[2] + matrix[6]) / scale;
  } else if (matrix[4] > matrix[8]) {
    const scale = Math.sqrt(1 + matrix[4] - matrix[0] - matrix[8]) * 2;
    w = (matrix[2] - matrix[6]) / scale;
    x = (matrix[1] + matrix[3]) / scale;
    y = 0.25 * scale;
    z = (matrix[5] + matrix[7]) / scale;
  } else {
    const scale = Math.sqrt(1 + matrix[8] - matrix[0] - matrix[4]) * 2;
    w = (matrix[3] - matrix[1]) / scale;
    x = (matrix[2] + matrix[6]) / scale;
    y = (matrix[5] + matrix[7]) / scale;
    z = 0.25 * scale;
  }

  const length = Math.hypot(x, y, z, w);
  const normalized: Quaternion = [x / length, y / length, z / length, w / length];
  const sign = normalized[3] < 0 ? -1 : 1;
  return normalized.map((value) => {
    const cleaned = Math.abs(value) < 1e-12 ? 0 : value;
    return cleaned * sign;
  }) as unknown as Quaternion;
}

export function faceAtVector(vector: Vector3): FaceDefinition {
  const face = FACE_DEFINITIONS.find((candidate) =>
    candidate.vector.every((value, index) => value === vector[index]),
  );
  if (!face) throw new RangeError('该向量不是立方体的六个面法向之一');
  return face;
}

/** 记录“原来的有标记面被送到哪个空间方向”，不是相机投影。 */
export function facePermutation(matrix: Matrix3): FacePermutationItem[] {
  return FACE_DEFINITIONS.map((face) => {
    const image = applyMatrixToVector(matrix, face.vector);
    const target = faceAtVector(image);
    return {
      id: face.id,
      name: face.name,
      sourceDirection: face.direction,
      targetId: target.id,
      targetDirection: target.direction,
      image,
    };
  });
}
