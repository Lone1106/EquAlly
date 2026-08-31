import { createTranslator } from "../i18n/index.js";

const TOOLTIP_GAP = 10;
const VIEWPORT_PADDING = 8;

/**
 * Shows a small tooltip above any link that opens in a new tab
 * (`target="_blank"`) while it's hovered or focused, e.g. "Opens in a new
 * tab". The tooltip element itself lives inside the shadow DOM (so it picks
 * up the widget's own styling via the --equally-* tokens), but the links it
 * watches live on the host page, so it listens on the real document.
 */
export class LinkTooltip {
  constructor({ locale }) {
    this.locale = locale;
    this.translator = createTranslator(locale);
    this.activeLink = null;
    this.previousDescribedBy = null;

    this.onOver = this.onOver.bind(this);
    this.onOut = this.onOut.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
  }

  render() {
    this.el = document.createElement("div");
    this.el.id = "equally-tooltip";
    this.el.className = "equally-tooltip";
    this.el.setAttribute("role", "tooltip");
    this.el.textContent = this.translator.t("opensNewTab");
    return this.el;
  }

  mount() {
    document.addEventListener("mouseover", this.onOver);
    document.addEventListener("mouseout", this.onOut);
    document.addEventListener("focusin", this.onOver);
    document.addEventListener("focusout", this.onOut);
    window.addEventListener("scroll", this.onDismiss, true);
    window.addEventListener("resize", this.onDismiss);
  }

  setLocale(locale) {
    this.locale = locale;
    this.translator = createTranslator(locale);
    this.el.textContent = this.translator.t("opensNewTab");
  }

  onOver(event) {
    const link = event.target.closest?.('a[target="_blank"]');
    if (!link || link === this.activeLink) return;
    this.#show(link);
  }

  onOut(event) {
    if (!this.activeLink) return;
    const related = event.relatedTarget;
    if (related && this.activeLink.contains(related)) return;
    this.#hide();
  }

  onDismiss() {
    if (this.activeLink) this.#hide();
  }

  #show(link) {
    this.activeLink = link;
    this.previousDescribedBy = link.getAttribute("aria-describedby");
    link.setAttribute("aria-describedby", this.el.id);

    this.el.classList.add("is-visible");
    this.#reposition(link);
  }

  #hide() {
    if (this.previousDescribedBy) this.activeLink.setAttribute("aria-describedby", this.previousDescribedBy);
    else this.activeLink.removeAttribute("aria-describedby");

    this.activeLink = null;
    this.previousDescribedBy = null;
    this.el.classList.remove("is-visible");
  }

  #reposition(link) {
    const linkRect = link.getBoundingClientRect();
    const tipRect = this.el.getBoundingClientRect();

    const left = linkRect.left + linkRect.width / 2 - tipRect.width / 2;
    const maxLeft = window.innerWidth - tipRect.width - VIEWPORT_PADDING;
    const top = linkRect.top - tipRect.height - TOOLTIP_GAP;

    this.el.style.left = `${Math.max(VIEWPORT_PADDING, Math.min(left, maxLeft))}px`;
    this.el.style.top = `${Math.max(VIEWPORT_PADDING, top)}px`;
  }
}
