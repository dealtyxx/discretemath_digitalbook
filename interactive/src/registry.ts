import { lazy } from 'react';
import type { LabComponent } from './types';

export const labRegistry: Record<number, LabComponent> = {
  1: lazy(() => import('./labs/Chapter01Lab')),
  2: lazy(() => import('./labs/Chapter02Lab')),
  3: lazy(() => import('./labs/Chapter03Lab')),
  4: lazy(() => import('./labs/Chapter04Lab')),
  5: lazy(() => import('./labs/Chapter05Lab')),
  6: lazy(() => import('./labs/Chapter06Lab')),
  7: lazy(() => import('./labs/Chapter07Lab')),
  8: lazy(() => import('./labs/Chapter08Lab')),
  9: lazy(() => import('./labs/Chapter09Lab')),
  10: lazy(() => import('./labs/Chapter10Lab')),
  11: lazy(() => import('./labs/Chapter11Lab')),
};
