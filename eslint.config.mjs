import { defineConfig, globalIgnores } from 'eslint/config';
import { fixupConfigRules } from '@eslint/compat';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import unusedImports from 'eslint-plugin-unused-imports';

const eslintConfig = defineConfig([
  ...fixupConfigRules(nextVitals),
  ...fixupConfigRules(nextTs),
  eslintPluginPrettierRecommended,
  globalIgnores(['.next/**', 'next-env.d.ts']),
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    // Payload migration codegen emits hook signatures with unused params
    // (payload/req/db); manual fixes would be lost on the next migrate:create.
    // This override must come AFTER the plugin block — in flat config the
    // later entry wins.
    files: ['src/migrations/**'],
    rules: {
      'unused-imports/no-unused-vars': 'off',
    },
  },
]);

export default eslintConfig;
