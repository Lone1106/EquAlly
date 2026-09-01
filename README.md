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

Or load it straight from the CDN instead of self-hosting the built file:

```html
<script src="https://equally.janrei.de/dist/equally.iife.js" defer></script>
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

The table below is toggled from the menu and persists across page loads via `localStorage`.

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
| Large cursor           | Swaps in a bigger, high-contrast mouse cursor |
| Reading guide          | A ruler that follows the mouse to help track the current line |
| Reading mask           | Dims the page except for a band around the cursor |
| Navigation mode        | Collects every link, button, and heading so you can jump between them with the arrow keys or Tab / Shift+Tab, tracked by a highlight outline and a screen reader announcement |

A couple more affordances are always on and don't need to be toggled:

| Feature               | What it does                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| Skip link              | A hidden "skip to accessibility menu" link, first in the tab order, that appears when focused  |
| New-tab link tooltip   | Shows a small tooltip over any link with `target="_blank"` warning that it opens in a new tab  |

Planned, not yet implemented:

- A full skip-link menu linking to your page's navigation and main content areas

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

| File                          | What it does                                    |
| ------------------------------ | ------------------------------------------------ |
| `src/main.js`                  | Entry point — boots `Equally` on `window.Equally` config |
| `src/Equally.js`                | Top-level controller wiring everything together |
| `src/ShadowHost.js`             | Creates the isolated Shadow DOM and injects widget styles |
| `src/EffectsHost.js`            | Injects effects styles into the host page's `<head>` |
| `src/FeatureManager.js`         | Owns feature state and applies it to the DOM    |
| `src/SettingsStore.js`          | `localStorage` wrapper for persisting settings  |
| `src/features/definitions.js`   | Declarative list of all accessibility features  |
| `src/components/Panel.js`       | Builds and wires up the menu UI                 |
| `src/components/SkipLink.js`    | Renders the "skip to accessibility menu" link   |
| `src/components/LinkTooltip.js` | Shows the new-tab warning tooltip on hover/focus |
| `src/components/ReadingGuide.js` | The cursor-following ruler for the reading guide feature |
| `src/components/ReadingMask.js` | The dimming overlay for the reading mask feature |
| `src/components/NavigationMode.js` | Arrow-key stepper through the page's links, buttons, and headings |
| `src/i18n/index.js`             | Locale resolution and translator factory        |
| `src/i18n/translations.js`      | EN/DE string tables                             |
| `src/styles/styles.css`         | Shadow DOM styling for the widget                |
| `src/styles/effects.css`        | Host-page styling for effects like reduced motion |
| `src/styles/skiplink.css`       | Light-DOM styling for the skip link             |
| `src/files/equally-icon.svg`    | Static icon asset                                |

## License

[MIT](LICENSE.md)
