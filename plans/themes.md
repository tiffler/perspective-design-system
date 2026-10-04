---
status: approved
branch: themes
---

# Resync the repo's tokens and components from the current Figma variables

## Why
The Figma file was restructured (new collections, renamed variables, paired `on-*` text tokens, new neutral ramp and colors). The repo still uses the old names and old hex values, so Storybook no longer matches Figma. Anyone making a theme from the repo would be editing the wrong values. Designers and your friend notice when the Storybook components match the Figma components and both use the same token names.

## Scope
- **In:**
  - Regenerate `src/styles/primitives.css` from the Figma `_primitives` collection (148 variables, same names with `/` -> `-`).
  - Regenerate `src/styles/component-tokens.css` from the Figma `color` (Light/Dark), `components`, `layout` and `typography` collections. Token names become `--token-<figma path with - >` (matches the code syntax already set in Figma).
  - Rename every old token used in component CSS, stories and docs to the new name (table below).
  - Update `THEMING.md`, `CLAUDE.md` and the `themes/*.css` files for the new brand steps.
- **Out:**
  - No new components or stories, no layout changes beyond what the new tokens cause.
  - No change to Figma, no commit to `main` (work stays on the `themes` branch).
  - No fix for the existing lint and type errors in story files.

## Approach
`primitives.css` and `component-tokens.css` are generated mechanically from Figma, so they match its names and values exactly. Aliases become `var()` references, opacity aliases become `color-mix(in srgb, <color> N%, transparent)`, and the Dark mode is `:root[data-mode="dark"]` overriding only the values that differ from Light.

Old token -> new token (the decisions that need your call are marked **?**):

| Old | New |
|---|---|
| `text-default`, `text-subtle`, `text-urgent`, `text-danger` | same names |
| `text-muted` | placeholders -> `text-subtle` **?**; disabled subtext -> `text-disabled`; switch off track -> `switch-off`; docs/form labels -> `text-subtle` |
| `text-on-solid` | chips -> `text-on-status-<status>`; solid buttons -> `text-on-action` |
| `text-always-white` / `-black` (destructive and warning buttons) | `text-on-status-danger` / `text-on-status-urgent` |
| `action-text-disabled` | `text-disabled` |
| `action-warning-dark` (hover) | repo-only token `action-warning-hover` (no Figma token) **?** |
| `action-default/subtle/disabled/danger/warning` | same names |
| `status-running` | `status-active` |
| `status-info-dark` | `status-info` |
| `status-ht-*` | `status-multi-tone-*` (`running` -> `active`) |
| `surface-page`, `surface-section-subtle` | `surface-page-default`, `surface-section-subtle` |
| `button-padding-h/v`, `button-gap` | `button-padding-horizontal/vertical`, `button-content-gap` |
| `button-radius` (4px) | `control-radius` (pill, 9999px, what Figma buttons use) **?** |
| `input-border`, `input-border-focus` | `input-stroke`, `input-stroke-focus` |
| `input-padding` | `input-padding-md` |
| `input-radius` (8px) | `radius-lg` (24px, what Figma inputs use) **?** |
| `chip-padding-h` | `chip-padding-horizontal` |
| `card-bg`, `card-border`, `card-padding` | `surface-card-default`, `card-stroke-default`, `space-md` |
| `card-shadow` | `0 1px 4px 0 var(--token-elevation-xs)` written inline |
| `switch-knob` | repo-only token (neutral-100); Figma has none |

Rejected alternative: keep the old token names and only update their values. That is less churn, but the names would no longer match the Figma code syntax, and the paired-token rules (`on-status-*`) could not be expressed.

## Steps
1. Write `primitives.css` and `component-tokens.css` from the Figma export (no component changes yet; Storybook still renders because old names are not yet removed).
2. Rename tokens in component CSS and stories, one file at a time: `button.css`, `chip.css`, `card.css`, `input-field.css`, `control.css`, `switch.css`, `page.css`, `header.css`, `FormPage.stories.tsx`, `Typography.mdx`.
3. Update `themes/teal.css` and `_template.css` (brand steps 600 and 300 now drive actions), `THEMING.md`, `CLAUDE.md`.
4. Check that every `var(--token-*)` used in the repo is defined, and every `var(--primitive-*)` exists.
5. Run Storybook; look at Button, Chip, Card, Input, Switch and Control in Light, Dark and the teal theme.
6. Commit on `themes` (no push until you say so).

## Done when
- [ ] No undefined `--token-*` or `--primitive-*` references (script check)
- [ ] Storybook renders Button, Chip, Card, Input, Switch, Control in Light, Dark and teal without console errors
- [ ] `primitives.css` values match Figma (148 primitives) and the dark block matches Figma's Dark mode
- [ ] `pnpm lint` shows no new errors (the two existing ones stay)

## Risks & open questions
- **Visuals change on purpose.** Figma's neutral, green and status colors differ from the repo's old ones, so every component shifts. Light-mode `action-subtle` is now brand at 40% opacity (the old repo value was a pale tint), so hover fills get stronger.
- **Four marked decisions (**?**)**: pill buttons instead of 4px corners; 24px input corners instead of 8px; placeholder text on `text-subtle`; a repo-only warning-hover token. Say which to change before I build.
- **Repo-only tokens** (`switch-knob`, `action-warning-hover`) exist because Figma has no equivalent. They should be added to Figma later.
- `color-mix()` needs a modern browser (Chrome 111+, Safari 16.2+, Firefox 113+).
