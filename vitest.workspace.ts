import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/certification-engine/vitest.config.ts',
  'packages/llm-gateway/vitest.config.ts',
  'packages/database/vitest.config.ts',
  'apps/web/vitest.config.ts',
]);
