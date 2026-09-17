import { mergeConfig } from 'vitest/config';

import { base } from './base.ts';

export const unit = mergeConfig(base, {
  test: {
    include: ['src/**/*.spec.ts'],
    exclude: ['src/**/*.integration.spec.ts', 'src/**/*.e2e.spec.ts'],
    coverage: {
      include: ['src/domain/**', 'src/application/**'],
      thresholds: {
        lines: 90,
        branches: 85,
        functions: 90,
      },
    },
  },
});
