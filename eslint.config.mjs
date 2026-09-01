import { defineConfig, globalIgnores } from 'eslint/config';
import next from 'eslint-config-next/core-web-vitals';

export default defineConfig([
  globalIgnores(['.next/**', '.history/**', '.yarn/**', 'out/**', 'node_modules/**']),
  next,
]);
