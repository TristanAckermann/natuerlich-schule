import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

/*
 * eslint-config-next 16 liefert bereits Flat Configs. Der Umweg über
 * `FlatCompat` aus @eslint/eslintrc, den das Template mitbrachte, liess ESLint
 * mit „Converting circular structure to JSON" abstürzen — die eslintrc-Brücke
 * kann die neuen Configs nicht mehr normalisieren.
 */
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
    },
  },
  {
    ignores: [
      '.next/',
      // Von `wrangler types` generiert.
      'cloudflare-env.d.ts',
      '.open-next/',
      '.wrangler/',
      'playwright-report/',
      'test-results/',
      'src/app/(payload)/admin/importMap.js',
      'src/payload-types.ts',
      'src/payload-generated-schema.ts',
    ],
  },
]

export default eslintConfig
