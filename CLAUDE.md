# Perspective Design System

## Overview
A React + TypeScript component library built with Vite, Tailwind v4, and Storybook 10.
Components live in `src/stories/`. Prototypes are Storybook stories under `title: 'Examples/...'`.

## Figma
File key: `nordHMziieQgLbg3UKUudF`
Use the Figma MCP to inspect any component: paste the node URL and fetch with `mcp__figma__get_figma_data`.

---

## Prototyping

To create a new prototype, add a `.stories.tsx` file in `src/stories/` with `title: 'Examples/...'`.
Use `layout: 'fullscreen'` for page-level mockups, `layout: 'centered'` for component-level.

### Pattern
```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { Button } from './Button';
// import other components as needed

const MyPage = () => (
  <div style={{ minHeight: '100vh', background: 'var(--token-surface-section-subtle)' }}>
    {/* layout here */}
  </div>
);

const meta = { title: 'Examples/My Page', component: MyPage, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof MyPage>;
export default meta;
export const Default: Story = {};
```

---

## Design Tokens
Three layers, one direction: `primitives.css` -> `component-tokens.css` -> components.
- `src/styles/primitives.css`: raw values (`--primitive-*`). The only place hex values live.
- `src/styles/component-tokens.css`: `--token-*` names that components use. Values are `var(--primitive-*)` references. Dark mode lives here under `:root[data-mode="dark"]`.
- Components: use `--token-*` only. Never hardcode hex values and never reference `--primitive-*` directly.

To see a token's current value, read `component-tokens.css`. Themes are in `src/styles/themes/`; see `THEMING.md`.

Token names are the Figma variable names with `/` -> `-` (`--token-status-multi-tone-danger`, `--token-input-stroke-focus`). Exception: the surface tokens keep a `-default` suffix in code. Figma names them `surface/page`, `surface/card`, `surface/section`, `surface/overlay` (and `-subtle`, `-inverse`), while the code names stay `--token-surface-page-default` and so on. The code syntax set on each Figma variable is the source of truth.
Groups: `--token-text-*`, `--token-surface-*`, `--token-action-*`, `--token-status-*` (and `status-multi-tone-*` tints), `--token-stroke-color-*`, `--token-space-*`, `--token-radius-*`, `--token-font-*`, plus per-component tokens (`--token-button-*`, `--token-input-*`, `--token-chip-*`, `--token-card-*`).
Pairing: text on a fill uses its partner: `text-on-action` on `action-default`, `text-on-status-<name>` on `status-<name>`.

---

## Components

### Button
`import { Button } from './Button'`

```tsx
<Button
  variant="solid" | "outline" | "ghost"         // default: "solid"
  intent="default" | "destructive" | "warning"  // default: "default"
  state="default" | "disabled" | "loading"      // default: "default"
  label="Button"
  icon="add"                                     // any Material Symbol name, optional
  iconPosition="leading" | "trailing"            // default: "leading"
  onClick={fn}
/>
```

### InputField
`import { InputField } from './InputField'`

```tsx
<InputField
  variant="default" | "focus" | "error" | "disabled"  // default: "default"
  label="Label"
  placeholder="Input"
  value={string}
  multiline={false}   // renders a <textarea>
  rows={4}            // only for multiline
  onChange={fn}
/>
```
Focus state is automatic on focus/blur. Width is fluid — wrap in a container to constrain.

### Chip
`import { Chip } from './Chip'`

```tsx
<Chip
  intent="default" | "error" | "running" | "informational" | "success" | "urgent"
  style="solid" | "halftone" | "outline"
  label="Status"
/>
```
Icon is automatic based on intent.

### Control (Checkbox & Radio)
`import { Control } from './Control'`

```tsx
<Control
  type="checkbox" | "radio"   // default: "checkbox"
  checked={false}
  indeterminate={false}       // checkbox only
  disabled={false}
  label="Text label"
  subtext="Supporting text"   // optional
  onChange={fn}
/>
```
Manages its own state internally. Syncs if `checked` prop changes.

### Switch
`import { Switch } from './Switch'`

```tsx
<Switch
  checked={false}
  disabled={false}
  label="Text label"
  subtext="Supporting text"   // optional
  onChange={fn}
/>
```
Animates on toggle (200ms ease). Manages its own state internally.

---

## Naming Conventions
- Variants use `default` not `standard`
- Component files: PascalCase (`Button.tsx`)
- CSS files: kebab-case (`button.css`)
- Stories: `title: 'Design System/ComponentName'` for components, `title: 'Examples/PageName'` for prototypes
