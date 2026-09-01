import { createTranslator } from "../i18n/index.js";

const STOP_SELECTOR =
  'a[href], button:not(:disabled), input[type="button"]:not(:disabled), input[type="submit"]:not(:disabled), [role="button"]:not([aria-disabled="true"]), h1, h2, h3, h4, h5, h6, [role="heading"]';
const HIGHLIGHT_PAD = 4;
const NAME_LIMIT = 120;

/**
 * Collects every link, button, and heading on the page into an ordered list
 * and lets the visitor step through them with the arrow keys (or Tab /
 * Shift+Tab) instead of hunting around with the mouse. A highlight box
 * (drawn in the shadow DOM, so it can't be hidden by the host page's own
 * CSS) tracks the current stop as a single blue outline; the target's own
 * native focus ring is suppressed while it's current so the two don't stack.
 * A visually-hidden live region announces the stop for screen readers.
 * Headings aren't natively focusable, so they get a temporary tabindex="-1"
 * while they're the current stop and lose it again as soon as focus moves on.
 */
export class NavigationMode {
  #enabled = false;
  #stops = [];
  #index = -1;
  #tempTabIndexEl = null;
  #hadTabIndex = false;
  #outlineEl = null;
  #hadStyleAttr = false;
  #prevStyleAttr = null;
  #rafId = null;
  #onKeydown = (event) => this.#handleKeydown(event);
  #onReposition = () => this.#scheduleReposition();

  constructor({ locale, exclude, onExit }) {
    this.locale = locale;
    this.translator = createTranslator(locale);
    this.exclude = exclude;
    this.onExit = onExit;
  }

  render() {
    this.highlightEl = document.createElement("div");
    this.highlightEl.className = "equally-nav-highlight";
    this.highlightEl.setAttribute("aria-hidden", "true");

    this.announcerEl = document.createElement("div");
    this.announcerEl.className = "equally-nav-announcer";
    this.announcerEl.setAttribute("role", "status");
    this.announcerEl.setAttribute("aria-live", "polite");

    this.wrapperEl = document.createElement("div");
    this.wrapperEl.append(this.highlightEl, this.announcerEl);
    return this.wrapperEl;
  }

  setLocale(locale) {
    this.locale = locale;
    this.translator = createTranslator(locale);
    if (this.#enabled) this.#announce(this.#stops[this.#index]);
  }

  enable() {
    if (this.#enabled) return;
    this.#enabled = true;
    this.#stops = this.#collectStops();
    this.#index = this.#stops.length ? 0 : -1;

    document.addEventListener("keydown", this.#onKeydown, true);
    window.addEventListener("scroll", this.#onReposition, { passive: true, capture: true });
    window.addEventListener("resize", this.#onReposition);

    if (this.#index >= 0) this.#focusCurrent();
    else this.#announceEmpty();
  }

  disable() {
    if (!this.#enabled) return;
    this.#enabled = false;

    document.removeEventListener("keydown", this.#onKeydown, true);
    window.removeEventListener("scroll", this.#onReposition, { passive: true, capture: true });
    window.removeEventListener("resize", this.#onReposition);
    if (this.#rafId !== null) cancelAnimationFrame(this.#rafId);
    this.#rafId = null;

    this.#releaseTempTabIndex();
    this.#releaseNativeOutline();
    this.highlightEl.classList.remove("is-visible");
    this.announcerEl.textContent = "";
    this.#stops = [];
    this.#index = -1;
  }

  #handleKeydown(event) {
    if (this.exclude && event.composedPath().includes(this.exclude)) return;

    if (event.key === "Escape") {
      event.preventDefault();
      this.onExit?.();
      return;
    }

    const target = event.target;
    const isEditable =
      target?.tagName === "INPUT" ||
      target?.tagName === "TEXTAREA" ||
      target?.tagName === "SELECT" ||
      target?.isContentEditable;
    if (isEditable || !this.#stops.length) return;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        this.#move(1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        this.#move(-1);
        break;
      case "Tab":
        event.preventDefault();
        this.#move(event.shiftKey ? -1 : 1);
        break;
      case "Home":
        event.preventDefault();
        this.#moveTo(0);
        break;
      case "End":
        event.preventDefault();
        this.#moveTo(this.#stops.length - 1);
        break;
    }
  }

  #move(direction) {
    this.#moveTo((this.#index + direction + this.#stops.length) % this.#stops.length);
  }

  #moveTo(index) {
    this.#index = index;
    this.#focusCurrent();
  }

  #focusCurrent() {
    const el = this.#stops[this.#index];
    if (!el) return;

    this.#releaseTempTabIndex();
    this.#releaseNativeOutline();

    if (el.tabIndex < 0) {
      this.#tempTabIndexEl = el;
      this.#hadTabIndex = el.hasAttribute("tabindex");
      el.setAttribute("tabindex", "-1");
    }
    this.#suppressNativeOutline(el);

    const reduceMotion = document.documentElement.classList.contains("equally-reduce-motion");
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });

    this.#position(el);
    this.#announce(el);
  }

  #releaseTempTabIndex() {
    if (!this.#tempTabIndexEl) return;
    if (!this.#hadTabIndex) this.#tempTabIndexEl.removeAttribute("tabindex");
    this.#tempTabIndexEl = null;
  }

  // The host page's own native focus ring would otherwise stack with our
  // highlight box, showing as a double outline. Force it off on the current
  // stop only, and restore its original inline style exactly on move-away.
  #suppressNativeOutline(el) {
    this.#outlineEl = el;
    this.#hadStyleAttr = el.hasAttribute("style");
    this.#prevStyleAttr = el.getAttribute("style");
    el.style.setProperty("outline", "none", "important");
  }

  #releaseNativeOutline() {
    if (!this.#outlineEl) return;
    if (this.#hadStyleAttr) this.#outlineEl.setAttribute("style", this.#prevStyleAttr);
    else this.#outlineEl.removeAttribute("style");
    this.#outlineEl = null;
  }

  #scheduleReposition() {
    if (this.#rafId !== null) return;
    this.#rafId = requestAnimationFrame(() => {
      this.#rafId = null;
      this.#position(this.#stops[this.#index]);
    });
  }

  #position(el) {
    if (!el) return;
    const rect = el.getBoundingClientRect();

    Object.assign(this.highlightEl.style, {
      top: `${rect.top - HIGHLIGHT_PAD}px`,
      left: `${rect.left - HIGHLIGHT_PAD}px`,
      width: `${rect.width + HIGHLIGHT_PAD * 2}px`,
      height: `${rect.height + HIGHLIGHT_PAD * 2}px`,
    });
    this.highlightEl.classList.add("is-visible");
  }

  #announce(el) {
    if (!el) return;
    const role = this.#roleFor(el);
    const name = (el.getAttribute("aria-label") || el.textContent || el.getAttribute("alt") || "")
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, NAME_LIMIT);

    this.announcerEl.textContent = this.translator.t("navPosition", role, this.#index + 1, this.#stops.length, name);
  }

  #announceEmpty() {
    this.announcerEl.textContent = this.translator.t("navEmpty");
  }

  #roleFor(el) {
    if (/^H[1-6]$/.test(el.tagName) || el.getAttribute("role") === "heading") return this.translator.t("navRoleHeading");
    if (el.tagName === "A") return this.translator.t("navRoleLink");
    return this.translator.t("navRoleButton");
  }

  #isVisible(el) {
    if (el.getClientRects().length === 0) return false;
    if (getComputedStyle(el).visibility === "hidden") return false;
    if (el.getAttribute("aria-hidden") === "true") return false;
    return true;
  }

  #collectStops() {
    return Array.from(document.querySelectorAll(STOP_SELECTOR)).filter(
      (el) => !el.classList.contains("equally-skiplink") && this.#isVisible(el),
    );
  }
}
