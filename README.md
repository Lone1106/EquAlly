## What is EquAlly?

EquAlly adds a floating button to your site that opens a small menu of accessibility
options — high contrast, a dyslexia-friendly font, larger text, reduced motion, and more.
Visitors turn on whatever helps them; their choices are remembered on their next visit,
and nothing about your site's own design or markup has to change.

## Quick start

Add this script tag right before the closing `</body>` tag of your page:

```html
<script src="equally.js"></script>
```

That's it — the accessibility menu appears automatically.

### Configuration

Set `window.Equally` to a config object _before_ the script tag to customize it:

```html
<script>
  window.Equally = {
    lang: "de", // force a language instead of auto-detecting it
  };
</script>
<script src="equally.js"></script>
```

If `lang` isn't set, EquAlly picks a language automatically: it checks the page's own
`<html lang>`, then the visitor's browser language, and falls back to English. A language
a visitor picks manually in the menu is remembered and wins on later visits.

## Features

Everything below is toggled from the menu and persists across page loads via
`localStorage`.

| Feature                | What it does                                  |
| ---------------------- | --------------------------------------------- |
| Font size              | Scales the page's root font size up or down   |
| Line height            | Adjusts line height for easier reading        |
| Letter spacing         | Adds breathing room between characters        |
| High contrast          | Boosts contrast across the page               |
| Color blind mode       | Renders the page in greyscale                 |
| Dyslexia friendly font | Switches body text to a more legible typeface |
| Seizure safe           | Disables animations and transitions           |
| Instant readability    | Forces high-contrast white-on-black text      |

Planned, not yet implemented:

- A skip-link menu linking to your page's navigation and main content
- A tooltip on links that open in a new tab

## Development

```bash
npm install
npm run dev       # start a local dev server with a demo page
npm run build     # build the distributable equally.iife.js bundle
npm run preview   # preview the production build
```

The demo page (`index.html`) doubles as a live showcase and a manual test page for every
feature above.

## Project structure

- **`src/main.js`** — Entry point. Reads `window.Equally` as config, boots `Equally` once
  the DOM is ready, then replaces `window.Equally` with the class itself.
- **`src/Equally.js`** — Top-level controller. Wires up the shadow host, effects host,
  settings store, feature manager, and panel.
- **`src/ShadowHost.js`** — Creates the `#equally-host` element, attaches an open Shadow
  DOM to it, and injects `styles.css` so the widget's styling is isolated from the host
  page.
- **`src/EffectsHost.js`** — Injects `effects.css` into the host page's own `<head>`
  (once) for effects — like reduced motion — that must apply outside the shadow root.
- **`src/FeatureManager.js`** — Owns feature state: reads/writes values via
  `SettingsStore`, applies each feature to the DOM (CSS classes/vars/filters), and
  notifies listeners (the `Panel`) on change.
- **`src/SettingsStore.js`** — Thin `localStorage` wrapper, namespaced per key, that
  persists a visitor's chosen settings across page loads.
- **`src/features/definitions.js`** — Declarative list of every feature (id, type,
  default, min/max/step for steppers, CSS class/filter for toggles). Add a new
  accessibility feature here.
- **`src/components/Panel.js`** — Builds the visible menu UI (toggle button + panel) as
  plain DOM nodes, and wires up open/close, locale switching, and each row to the
  `FeatureManager`.
- **`src/i18n/index.js`** — Locale resolution (page `lang` → browser language → default)
  and the translator factory used by `Panel`.
- **`src/i18n/translations.js`** — The EN/DE string tables (labels, section headers,
  feature names).
- **`src/styles/styles.css`** — Shadow DOM styling for the widget itself (menu, toggle,
  rows, switches, etc.).
- **`src/styles/effects.css`** — Host-page styling for effects that can't live in the
  shadow root (e.g. globally disabling animations).
- **`src/files/equally-icon.svg`** — Static icon asset.

## License

[MIT](LICENSE.md)
