# Theming

Perspective is themeable by editing primitives. You don't touch components or tokens.

```
primitives.css  ->  component-tokens.css  ->  components
 (raw values)        (--token-* = var(--primitive-*))   (read --token-* only)
```

## Make your own theme

1. Copy `src/styles/themes/_template.css` to `src/styles/themes/<your-name>.css`.
2. Rename `your-theme` inside the file to `<your-name>` (same as the filename).
3. Change primitive values. Point the brand scale at another palette, or use your own hex (`brand-600` drives light-mode actions, `brand-300` dark-mode actions):
   ```css
   :root[data-theme="sunset"] {
     --primitive-brand-600: #b8400f;
   }
   ```
4. Run `pnpm storybook`. Your theme appears in the **Theme** toolbar menu automatically. Use the **Mode** menu to check light and dark.

`themes/teal.css` is a working example.

## Rules

- Override `--primitive-*` only, never `--token-*`. That keeps light and dark mode working.
- `--primitive-brand-*` drives actions, buttons and the default status color. Start there.
- Anything you don't override falls back to `primitives.css`.

## Using a theme in an app

Set attributes on `<html>`:

```html
<html data-theme="sunset" data-mode="dark">
```

No `data-theme` means the default theme. No `data-mode` means light.

## Names (Figma and code match)

Code names are derived from the Figma variable names by replacing `/` with `-`:

| Figma | CSS |
|---|---|
| `colors/purple/500` | `--primitive-purple-500` (the leading `colors/` is dropped) |
| `surface/page/default` | `--token-surface-page-default` |
| `status/multi-tone/danger` | `--token-status-multi-tone-danger` |
| `input/stroke/focus` | `--token-input-stroke-focus` |

`primitives.css` and `component-tokens.css` are generated from Figma. After changing a variable in Figma, regenerate them; don't hand-edit values in the token file.

## Pairing

Fills that carry text have a named partner. Use them together:
`action/default` + `text/on-action`, and `status/<name>` + `text/on-status/<name>`.

## Accessibility

After changing a brand color, check contrast. Button text sits on `brand-600` (light) and `brand-300` (dark); both need 4.5:1.
