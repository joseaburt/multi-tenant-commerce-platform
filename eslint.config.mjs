import { base, disableTypeChecked } from '@mtcp/eslint-config/base';

export default [
  ...base,
  { ignores: ['infra/**'] },
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    ...disableTypeChecked,
    languageOptions: {
      parserOptions: { projectService: false },
    },
  },
];
