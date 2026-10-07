import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './token-docs.css';
import type { CollectionKey, Resolved, Token } from './tokenData';
import {
  COLLECTIONS,
  byCollection,
  cssVar,
  groupTokens,
  hasModes,
  resolveToken,
} from './tokenData';

/* ---------- helpers ---------- */

/**
 * Docs-only pages have no story, so the preview decorator never applies the Theme / Mode toolbar.
 * Mirror it here: read the toolbar globals and set the same <html> attributes.
 */
type Globals = { theme?: string; mode?: string };
type PreviewHandle = {
  channel?: { on: (event: string, cb: (payload: { globals?: Globals }) => void) => void; off: (event: string, cb: (payload: { globals?: Globals }) => void) => void };
  storyStoreValue?: { userGlobals?: { get: () => Globals } };
};

function applyGlobals(g?: Globals) {
  if (!g) return;
  const root = document.documentElement;
  if (g.theme && g.theme !== 'default') root.setAttribute('data-theme', g.theme);
  else root.removeAttribute('data-theme');
  root.setAttribute('data-mode', g.mode ?? 'light');
}

function useStorybookGlobals() {
  useEffect(() => {
    const preview = (window as unknown as { __STORYBOOK_PREVIEW__?: PreviewHandle }).__STORYBOOK_PREVIEW__;
    if (!preview) return undefined;
    applyGlobals(preview.storyStoreValue?.userGlobals?.get());
    const onUpdate = (payload: { globals?: Globals }) => applyGlobals(payload.globals);
    preview.channel?.on('globalsUpdated', onUpdate);
    return () => preview.channel?.off('globalsUpdated', onUpdate);
  }, []);
}

/** Re-render when the Storybook Theme / Mode toolbar changes the <html> attributes. */
function useThemeTick() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const observer = new MutationObserver(() => setTick((n) => n + 1));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-mode'] });
    return () => observer.disconnect();
  }, []);
  return tick;
}

const toHex = (rgb: string) => {
  const m = rgb.match(/[\d.]+/g)?.map(Number);
  if (!m || m.length < 3) return rgb;
  // Colors from color-mix() come back as color(srgb r g b / a) with channels in 0-1.
  const unit = rgb.startsWith('color(') ? 255 : 1;
  const [r0, g0, b0, a = 1] = m;
  const [r, g, b] = [r0 * unit, g0 * unit, b0 * unit];
  const h = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}${a < 1 ? h(a * 255) : ''}`;
};

const unitFor = (t: Token) => (t.figma.startsWith('opacity') ? '%' : 'px');

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => undefined);
    setCopied(text);
    window.setTimeout(() => setCopied((c) => (c === text ? null : c)), 1200);
  };
  return { copied, copy };
}

/* ---------- small building blocks ---------- */

const CopyName = ({ token }: { token: Token }) => {
  const { copied, copy } = useCopy();
  if (!token.css) return <span className="td-name__css td-name__css--none">Figma only</span>;
  const text = `var(${cssVar(token)})`;
  return (
    <button type="button" className="td-name__css" onClick={() => copy(text)} title="Copy var()">
      {copied === text ? 'Copied' : cssVar(token)}
    </button>
  );
};

const Swatch = ({ css, label }: { css: string; label?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const tick = useThemeTick();
  const [hex, setHex] = useState('');
  useLayoutEffect(() => {
    if (ref.current) setHex(toHex(getComputedStyle(ref.current).backgroundColor));
  }, [css, tick]);
  return (
    <span className="td-swatch" title={label}>
      <span className="td-swatch__checker">
        <span ref={ref} className="td-swatch__fill" style={{ background: css }} />
      </span>
      <span className="td-swatch__hex">{hex}</span>
    </span>
  );
};

/** Visual preview of a resolved number, depending on what the token is. */
const NumberPreview = ({ token, value }: { token: Token; value: number }) => {
  const f = token.figma;
  if (f.startsWith('radius') || f.includes('/radius') || f.startsWith('control/radius')) {
    return <span className="td-radius" style={{ borderTopLeftRadius: `${value}px` }} />;
  }
  if (f.startsWith('font-size') || f.includes('font-size')) {
    return <span className="td-fontsize" style={{ fontSize: `${value}px` }}>Aa</span>;
  }
  if (f.startsWith('opacity')) {
    return <span className="td-opacity"><span className="td-opacity__fill" style={{ width: `${value}%` }} /></span>;
  }
  return <span className="td-bar"><span className="td-bar__fill" style={{ width: `${value}px` }} /></span>;
};

const ValuePreview = ({ token, r }: { token: Token; r: Resolved }) => {
  if (r.kind === 'color' && r.css) return <Swatch css={r.css} />;
  if (r.kind === 'number' && r.number !== undefined) return <NumberPreview token={token} value={r.number} />;
  if (r.kind === 'string') {
    if (token.figma.startsWith('icon/') && token.figma !== 'icon/size') {
      return <span className="td-glyph" aria-hidden="true">{r.text}</span>;
    }
    if (token.figma === 'font/icon') {
      return <span className="td-glyph" aria-hidden="true">star home search</span>;
    }
    if (token.figma === 'font/default') {
      return <span className="td-family" style={{ fontFamily: `var(${cssVar(token)})` }}>Aa Bb Cc 123</span>;
    }
  }
  return null;
};

const valueText = (token: Token, r: Resolved) => {
  if (r.kind === 'number') return `${r.number}${unitFor(token)}`;
  if (r.kind === 'string') return r.text ?? '';
  return '';
};

const ValueCell = ({ token, mode, label }: { token: Token; mode: number; label?: string }) => {
  useThemeTick();
  const r = resolveToken(token, mode);
  const text = valueText(token, r);
  return (
    <div className="td-value">
      {label && <span className="td-value__mode">{label}</span>}
      <ValuePreview token={token} r={r} />
      <span className="td-value__text">
        {r.via && <span className="td-value__via">{r.via}</span>}
        {text && <span className="td-value__raw">{text}</span>}
      </span>
    </div>
  );
};

/* ---------- table ---------- */

const TokenTable = ({ tokens }: { tokens: Token[] }) => {
  const modal = tokens.some(hasModes);
  return (
    <div className="td-table" role="table">
      <div className="td-row td-row--head" role="row">
        <span role="columnheader">Token</span>
        <span role="columnheader">{modal ? 'Light / Dark' : 'Value'}</span>
        <span role="columnheader">Use for</span>
      </div>
      {tokens.map((t) => (
        <div className="td-row" role="row" key={t.figma}>
          <div className="td-name" role="cell">
            <span className="td-name__figma">{t.figma}</span>
            <CopyName token={t} />
          </div>
          <div className="td-values" role="cell">
            {hasModes(t) ? (
              <>
                <ValueCell token={t} mode={0} label="Light" />
                <ValueCell token={t} mode={1} label="Dark" />
              </>
            ) : (
              <ValueCell token={t} mode={0} label={modal ? 'Both' : undefined} />
            )}
          </div>
          <p className="td-desc" role="cell">{t.description}</p>
        </div>
      ))}
    </div>
  );
};

/* ---------- color ramp (primitives) ---------- */

const Ramp = ({ tokens }: { tokens: Token[] }) => {
  const { copied, copy } = useCopy();
  useThemeTick();
  return (
    <div className="td-ramp">
      {tokens.map((t) => {
        const r = resolveToken(t, 0);
        const step = t.figma.split('/').pop();
        const text = `var(${cssVar(t)})`;
        return (
          <button type="button" key={t.figma} className="td-ramp__item" onClick={() => copy(text)} title={`${t.figma} — click to copy var()`}>
            <span className="td-swatch__checker td-ramp__checker">
              <span className="td-ramp__chip" style={{ background: r.css }} />
            </span>
            <span className="td-ramp__step">{copied === text ? 'Copied' : step}</span>
            <RampHex css={r.css ?? ''} />
          </button>
        );
      })}
    </div>
  );
};

const RampHex = ({ css }: { css: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const tick = useThemeTick();
  const [hex, setHex] = useState('');
  useLayoutEffect(() => {
    if (ref.current) setHex(toHex(getComputedStyle(ref.current).backgroundColor));
  }, [css, tick]);
  return (
    <span className="td-ramp__hex">
      <span ref={ref} className="td-ramp__probe" style={{ background: css }} />
      {hex}
    </span>
  );
};

/* ---------- sections ---------- */

const SECTION_NOTES: Record<string, string> = {
  'primitives:colors/brand': 'The brand ramp aliases a hue (purple by default). Point it at another ramp to re-brand the whole system. brand-600 drives light-mode actions, brand-300 drives dark-mode actions.',
  'primitives:colors/shadow': 'Shadow colors include their own alpha. Elevation tokens switch between the light and dark pair.',
  'primitives:opacity': 'Unitless percentages. Used by the multi-tone status tints.',
  'primitives:font-size': 'Raw type scale. Use the semantic font-size tokens (body, label, caption, h1, h2) in components.',
  'primitives:size': 'Raw sizes. Icon sizes, control height, stroke weight and heading sizes all point here.',
  'primitives:space': 'Raw spacing scale. Use the semantic space tokens (xxs to xxl) in components where one fits.',
  'primitives:radius': 'Raw corner radii. radius-1000 is the pill shape used by controls.',
};

const Section = ({ id, label, tokens, collection }: { id: string; label: string; tokens: Token[]; collection: CollectionKey }) => {
  const isColorRamp = collection === 'primitives' && id.startsWith('colors/');
  const note = SECTION_NOTES[`${collection}:${id}`];
  return (
    <section className="td-section" id={`td-${id.replace(/\//g, '-')}`}>
      <header className="td-section__head">
        <h3 className="td-section__title">{label}</h3>
        <span className="td-section__count">{tokens.length}</span>
      </header>
      {note && <p className="td-section__note">{note}</p>}
      {isColorRamp ? <Ramp tokens={tokens} /> : <TokenTable tokens={tokens} />}
    </section>
  );
};

/* ---------- public components ---------- */

export const TokenCollection = ({ collection }: { collection: CollectionKey }) => {
  useStorybookGlobals();
  const meta = COLLECTIONS[collection];
  const groups = groupTokens(collection);
  const total = byCollection(collection).length;
  return (
    <div className="td">
      <header className="td-hero">
        <div className="td-hero__meta">
          <span className="td-badge">{meta.tier}</span>
          <span className="td-hero__figma">Figma collection: <code>{meta.figma}</code></span>
          <span className="td-hero__figma">{total} variables</span>
        </div>
        <p className="td-hero__summary">{meta.summary}</p>
        <nav className="td-jump" aria-label="Groups">
          {groups.map((g) => (
            <a key={g.id} className="td-jump__link" href={`#td-${g.id.replace(/\//g, '-')}`}>{g.label}</a>
          ))}
        </nav>
      </header>
      {groups.map((g) => (
        <Section key={g.id} id={g.id} label={g.label} tokens={g.tokens} collection={collection} />
      ))}
    </div>
  );
};

const TIERS: { key: CollectionKey; name: string; line: string }[] = [
  { key: 'primitives', name: 'Primitives', line: 'Raw values' },
  { key: 'color', name: 'Color', line: 'Meaning, with Light / Dark' },
  { key: 'layout', name: 'Layout', line: 'Spacing, radius, sizing' },
  { key: 'typography', name: 'Typography', line: 'Fonts and type sizes' },
  { key: 'components', name: 'Components', line: 'Per-component decisions' },
];

export const TokenOverview = () => {
  useStorybookGlobals();
  useThemeTick();
  return (
    <div className="td">
      <header className="td-hero">
        <p className="td-hero__summary">
          Every design decision in Perspective is a token. Tokens are laid out here exactly as they are in the Figma file, one page per collection.
          Values update live with the Theme and Mode menus in the toolbar.
        </p>
      </header>

      <section className="td-section">
        <header className="td-section__head"><h3 className="td-section__title">How tokens connect</h3></header>
        <div className="td-flow">
          <div className="td-flow__step">
            <span className="td-flow__name">Primitives</span>
            <span className="td-flow__code">--primitive-*</span>
            <span className="td-flow__line">Raw values. Themes change these.</span>
          </div>
          <span className="td-flow__arrow" aria-hidden="true">→</span>
          <div className="td-flow__step">
            <span className="td-flow__name">Semantic</span>
            <span className="td-flow__code">--token-*</span>
            <span className="td-flow__line">Color, Layout, Typography. Carry meaning; Color has Light and Dark.</span>
          </div>
          <span className="td-flow__arrow" aria-hidden="true">→</span>
          <div className="td-flow__step">
            <span className="td-flow__name">Components</span>
            <span className="td-flow__code">--token-button-*, …</span>
            <span className="td-flow__line">Per-component decisions that point at semantic tokens.</span>
          </div>
        </div>
      </section>

      <section className="td-section">
        <header className="td-section__head"><h3 className="td-section__title">Collections</h3></header>
        <div className="td-cards">
          {TIERS.map((t) => (
            <div className="td-card" key={t.key}>
              <span className="td-badge">{COLLECTIONS[t.key].tier}</span>
              <span className="td-card__name">{t.name}</span>
              <span className="td-card__line">{t.line}</span>
              <span className="td-card__count">{byCollection(t.key).length} variables</span>
              <code className="td-card__figma">{COLLECTIONS[t.key].figma}</code>
            </div>
          ))}
        </div>
      </section>

      <section className="td-section">
        <header className="td-section__head"><h3 className="td-section__title">Using tokens</h3></header>
        <ol className="td-steps">
          <li>Components read <code>--token-*</code> only. Never use a hex value or a <code>--primitive-*</code> directly.</li>
          <li>Pick the most specific token that fits: a component token if one exists, otherwise a semantic token.</li>
          <li>Pair text with its fill: <code>text/on-action</code> on <code>action/default</code>, <code>text/on-status/*</code> on <code>status/*</code>.</li>
          <li>Click any CSS name on these pages to copy <code>var(--…)</code>.</li>
        </ol>
        <pre className="td-code">{`.my-button {
  background: var(--token-action-default);
  color: var(--token-text-on-action);
  border-radius: var(--token-control-radius);
  padding: var(--token-space-xs) var(--token-space-sm);
}`}</pre>
      </section>

      <section className="td-section">
        <header className="td-section__head"><h3 className="td-section__title">Naming</h3></header>
        <p className="td-section__note">
          The CSS name is the Figma variable name with <code>/</code> replaced by <code>-</code>, prefixed <code>--token-</code> (or <code>--primitive-</code>, dropping <code>colors/</code>).
          The code syntax set on each Figma variable is the source of truth, so a few names differ.
          For example the Figma variable <code>surface/page</code> is <code>--token-surface-page-default</code>.
        </p>
      </section>
    </div>
  );
};
