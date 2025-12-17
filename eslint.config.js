import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

const tsFiles = ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'];

const typecheckedConfigs = tseslint.configs['flat/strict-type-checked'].map(
  (config, index) => {
    if (index === 0) {
      return {
        ...config,
        files: tsFiles,
        languageOptions: {
          ...config.languageOptions,
          parser: tsParser,
          parserOptions: {
            project: './tsconfig.json',
            tsconfigRootDir: import.meta.dirname,
          },
        },
      };
    }

    return {
      ...config,
      files: config.files ?? tsFiles,
    };
  },
);

export default [
  {
    ignores: ['node_modules'],
  },
  ...typecheckedConfigs,
  {
    files: ['tests/**/*.ts'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        expect: 'readonly',
        it: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/unbound-method': 'off',
    },
  },
];
