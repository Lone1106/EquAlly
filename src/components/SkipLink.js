import { createTranslator } from "../i18n/index.js";
import skipLinkStyles from "../styles/skiplink.css?inline";

/**
 * A "skip to accessibility menu" link. Rendered in the light DOM (not the
 * shadow root) so it can be the very first focusable element on the page,
 * ahead of the host page's own content — the standard skip-link pattern.
 * It's invisible until it receives keyboard focus, then blends in at the
 * top of the viewport.
 */
export class SkipLink {
  constructor({ locale, onActivate }) {
    this.locale = locale;
    this.onActivate = onActivate;
  }

  render() {
    this.#injectStyles();

    const link = document.createElement("a");
    link.href = "#";
    link.className = "equally-skiplink";
    link.textContent = createTranslator(this.locale).t("skipLink");
    link.addEventListener("click", (event) => {
      event.preventDefault();
      this.onActivate?.();
    });

    this.el = link;
    return link;
  }

  setLocale(locale) {
    this.locale = locale;
    if (this.el) this.el.textContent = createTranslator(locale).t("skipLink");
  }

  #injectStyles() {
    if (document.getElementById("equally-skiplink-style")) return;

    const style = document.createElement("style");
    style.id = "equally-skiplink-style";
    style.textContent = skipLinkStyles;
    document.head.appendChild(style);
  }
}
