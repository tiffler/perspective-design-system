import raw from '../../tokens/tokens.json';

export type CollectionKey = 'primitives' | 'components' | 'color' | 'layout' | 'typography';

/** One variable as it exists in Figma. */
export interface Token {
  collection: CollectionKey;
  /** Figma variable name, e.g. `surface/page` */
  figma: string;
  /** CSS custom property without the leading `--`, or '' when Figma-only */
  css: string;
  /** Raw values, one per mode (Light, Dark). A single entry means both modes share it. */
  values: string[];
  description: string;
}

/** What a token resolves to, in one mode. */
export interface Resolved {
  kind: 'color' | 'number' | 'string';
  /** CSS value usable as a background / color. Only for kind 'color'. */
  css?: string;
  /** Number (px, or percent for opacity). Only for kind 'number'. */
  number?: number;
  text?: string;
  /** Human label for the direct alias, e.g. `colors/brand/600` */
  via?: string;
}

export const COLLECTIONS: Record<CollectionKey, { title: string; figma: string; tier: string; summary: string }> = {
  primitives: {
    title: 'Primitives',
    figma: '_primitives',
    tier: 'Tier 1',
    summary: 'Raw values: hex colors, sizes, spacing, radii. This is the only place real values live. Hidden from publishing in Figma; themes override these.',
  },
  components: {
    title: 'Components',
    figma: 'components',
    tier: 'Tier 3',
    summary: 'Per-component decisions (button padding, input fill, chip radius). Each one points at a semantic token, so components stay themeable.',
  },
  color: {
    title: 'Color',
    figma: 'color (semantic layers)',
    tier: 'Tier 2',
    summary: 'Semantic color with Light and Dark modes. Use these for anything that shows color: they carry meaning (action, status, surface, text) rather than a hue.',
  },
  layout: {
    title: 'Layout',
    figma: 'layout (semantic layers)',
    tier: 'Tier 2',
    summary: 'Semantic spacing, corner radius, control sizing and stroke weight. Names are t-shirt sizes that point at primitives.',
  },
  typography: {
    title: 'Typography',
    figma: 'typography (semantic layers)',
    tier: 'Tier 2',
    summary: 'Font families, font sizes and the icon font settings.',
  },
};

const data = raw as unknown as {
  primitives: Record<string, [string | number, string][]>;
  components: [string, string, string[], string][];
  color: [string, string, string[], string][];
  layout: [string, string, string[], string][];
  typography: [string, string, string[], string][];
};

function build(): Token[] {
  const out: Token[] = [];
  for (const [group, steps] of Object.entries(data.primitives)) {
    const last = group.split('/').pop()!;
    for (const [step, value] of steps) {
      out.push({
        collection: 'primitives',
        figma: `${group}/${step}`,
        css: `primitive-${last}-${step}`,
        values: [value],
        description: '',
      });
    }
  }
  (['components', 'color', 'layout', 'typography'] as const).forEach((collection) => {
    for (const [figma, css, values, description] of data[collection]) {
      out.push({ collection, figma, css: css ? `token-${css}` : '', values, description });
    }
  });
  return out;
}

export const TOKENS: Token[] = build();

const byCss = new Map<string, Token>();
for (const t of TOKENS) if (t.css) byCss.set(t.css, t);

export const cssVar = (t: Token) => (t.css ? `--${t.css}` : '');

/** Parse the shape of a stored value: `p:purple-600` -> { prefix: 'p', rest: 'purple-600' } */
function split(v: string) {
  const i = v.indexOf(':');
  return { prefix: v.slice(0, i), rest: v.slice(i + 1) };
}

function target(prefix: string, rest: string): Token | undefined {
  return byCss.get(`${prefix === 'p' ? 'primitive' : 'token'}-${rest}`);
}

/** Resolve a stored value in a given mode (0 = Light, 1 = Dark). */
export function resolveValue(v: string, mode: number): Resolved {
  const { prefix, rest } = split(v);
  switch (prefix) {
    case 'c':
      return { kind: 'color', css: rest };
    case 'n':
      return { kind: 'number', number: Number(rest) };
    case 's':
      return { kind: 'string', text: rest };
    case 'p':
    case 't': {
      const t = target(prefix, rest);
      if (!t) return { kind: 'string', text: v };
      const next = t.values[Math.min(mode, t.values.length - 1)];
      const inner = resolveValue(next, mode);
      // A color that points at a primitive stays a live CSS variable so themes show through.
      if (inner.kind === 'color' && prefix === 'p' && t.collection === 'primitives') {
        return { ...inner, css: `var(--${t.css})`, via: t.figma };
      }
      return { ...inner, via: t.figma };
    }
    case 'mix': {
      const [color, opacity] = rest.split('|');
      const base = resolveValue(color, mode);
      const pct = resolveValue(opacity.includes(':') ? opacity : `n:${opacity}`, mode).number ?? 100;
      const direct = split(color);
      const via = target(direct.prefix, direct.rest)?.figma;
      return { kind: 'color', css: `color-mix(in srgb, ${base.css} ${pct}%, transparent)`, via: via ? `${via} at ${pct}%` : `${pct}%` };
    }
    default:
      return { kind: 'string', text: v };
  }
}

export const resolveToken = (t: Token, mode: number) => resolveValue(t.values[Math.min(mode, t.values.length - 1)], mode);

export const hasModes = (t: Token) => t.values.length > 1;

export const byCollection = (c: CollectionKey) => TOKENS.filter((t) => t.collection === c);

/** Group a collection's tokens by the first path segment of the Figma name (or two for colors/*). */
export function groupTokens(collection: CollectionKey): { id: string; label: string; tokens: Token[] }[] {
  const groups = new Map<string, Token[]>();
  for (const t of byCollection(collection)) {
    const parts = t.figma.split('/');
    const key = collection === 'primitives' && parts[0] === 'colors' ? `${parts[0]}/${parts[1]}` : parts[0];
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }
  return [...groups.entries()].map(([id, tokens]) => ({ id, label: id, tokens }));
}
