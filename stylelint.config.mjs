// Token-only rule: component CSS reads --token-* and never holds raw color values.
// Raw values live in src/styles (primitives, themes). See CLAUDE.md "Design Tokens".
const tokenOnly = {
  'color-no-hex': true,
  'color-named': 'never',
  'function-disallowed-list': ['rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab', 'oklch'],
  'declaration-property-value-disallowed-list': {
    '/.*/': ['/var\\(\\s*--primitive-/'],
  },
};

export default {
  rules: tokenOnly,
  overrides: [
    {
      // The only place raw values and --primitive-* are allowed.
      files: ['src/styles/**/*.css'],
      rules: {
        'color-no-hex': null,
        'color-named': null,
        'function-disallowed-list': null,
        'declaration-property-value-disallowed-list': null,
      },
    },
  ],
};
