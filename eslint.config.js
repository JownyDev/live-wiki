import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import astroPlugin from 'eslint-plugin-astro';
import astroParser from 'astro-eslint-parser';

const tsFiles = ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'];
const astroFiles = ['**/*.astro'];

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

const astroConfigs = astroPlugin.configs['flat/recommended'].map((config) => ({
  ...config,
  files: astroFiles,
  languageOptions: {
    ...config.languageOptions,
    parser: astroParser,
    parserOptions: {
      ...config.languageOptions?.parserOptions,
      parser: tsParser,
      project: './tsconfig.json',
      tsconfigRootDir: import.meta.dirname,
      extraFileExtensions: ['.astro'],
    },
  },
}));

export default [
  {
    ignores: ['node_modules', 'dist', '.astro'],
  },
  ...astroConfigs,
  ...typecheckedConfigs,
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
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
