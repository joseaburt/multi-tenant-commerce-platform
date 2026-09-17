import { base, disableTypeChecked } from '@mtcp/eslint-config/base';

export default [
  ...base,
  { ignores: ['infra/**'] },
  {
    files: ['**/*.js', '**/*.mjs'],
    ...disableTypeChecked,
    languageOptions: {
      parserOptions: { projectService: false },
    },
  },
];
