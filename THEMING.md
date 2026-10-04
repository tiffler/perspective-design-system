# Theming

Perspective is themeable by editing primitives. You don't touch components or tokens.

```
primitives.css  ->  component-tokens.css  ->  components
 (raw values)        (--token-* = var(--primitive-*))   (read --token-* only)
```

## Make your own theme

1. Copy `src/styles/themes/_template.css` to `src/styles/themes/<your-name>.css`.
2. Rename `your-theme` inside the file to `<your-name>` (same as the filename).
3. Change primitive values. Point the brand scale at another palette, or use your own hex:
   ```css
   :root[data-theme="sunset"] {
     --primitive-brand-500: #ff6b35;
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

## Figma names

Primitive names are the Figma variable names with `/` replaced by `-`
(`colors/purple/500` becomes `--primitive-purple-500`), because `/` isn't valid in a CSS custom property name.
