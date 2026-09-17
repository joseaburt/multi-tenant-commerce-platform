import { mergeConfig } from 'vitest/config';

import { base } from './base.ts';

export const integration = mergeConfig(base, {
  test: {
    include: ['src/**/*.integration.spec.ts', 'src/**/*.e2e.spec.ts'],
    testTimeout: 60_000,
    hookTimeout: 120_000,
    fileParallelism: false,
  },
});
