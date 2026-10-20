import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';


// Keep the look in src/index.css: components may only use the design tokens defined there.
const tokenRule = (pattern, message) => [
  { selector: `Literal[value=/${pattern}/]`, message },
  { selector: `TemplateElement[value.raw=/${pattern}/]`, message },
];
const RAW_PALETTE = String.raw`\b(?:bg|text|border(?:-[lrtbxy])?|ring(?:-offset)?|from|to|via|shadow|divide|outline|fill|stroke|decoration|placeholder)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d`;
const RAW_BW_OR_HEX = String.raw`\b(?:bg|text|border|ring|from|to|via|shadow|divide|fill|stroke)-(?:white|black)\b|-\[#`;
const RAW_RADIUS = String.raw`\brounded(?:-[trbl]{1,2})?-(?:sm|md|lg|xl|2xl|3xl)\b`;

export default defineConfig(
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended, reactHooks.configs.flat.recommended],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
      'react-hooks/set-state-in-effect': 'off',
      'no-restricted-syntax': [
        'error',
        ...tokenRule(RAW_PALETTE, 'Use a status token (danger/success/warning/info) or a neutral/accent token from src/index.css, not a raw palette color.'),
        ...tokenRule(RAW_BW_OR_HEX, 'Use a token from src/index.css (e.g. on-accent, surface, canvas) instead of white/black or a hex value.'),
        ...tokenRule(RAW_RADIUS, 'Use a radius token (rounded-card/control/small/chip/panel/pill) from src/index.css.'),
      ],
    },
  },
);
