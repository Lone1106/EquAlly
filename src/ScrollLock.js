const SCROLL_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
  "Spacebar",
]);

/**
 * Locks page scroll while a host-page element is open, without relying on
 * `overflow: hidden` alone. Host pages may run a JS-driven smooth-scroll
 * library (Lenis and friends) that ignores CSS overflow and keeps scrolling
 * on wheel/touch input. To defeat that without needing a reference to the
 * host's scroller instance, this intercepts wheel/touch/key input in the
 * capture phase on `window` — always the first stop in DOM event capture —
 * and stops it before it can reach any listener the host page registered,
 * while still letting scroll happen inside an explicitly allowed element
 * (e.g. the open panel itself).
 */
export class ScrollLock {
  #locked = false;
  #allowedEl = null;
  #scrollY = 0;
  #prevHtmlStyle = null;
  #prevBodyStyle = null;
  #externalLenis = null;

  #isAllowed = (event) => {
    return !!this.#allowedEl && event.composedPath().includes(this.#allowedEl);
  };

  #onWheel = (event) => {
    if (this.#isAllowed(event)) {
      event.stopPropagation();
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  };

  #onTouchMove = (event) => {
    if (this.#isAllowed(event)) {
      event.stopPropagation();
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  };

  #onKeyDown = (event) => {
    if (!SCROLL_KEYS.has(event.key) || this.#isAllowed(event)) return;

    const target = event.target;
    if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable) return;

    event.preventDefault();
    event.stopPropagation();
  };

  /** @param {Element} [allowedEl] Element allowed to keep scrolling natively (e.g. the open panel). */
  lock(allowedEl) {
    if (this.#locked) return;
    this.#locked = true;
    this.#allowedEl = allowedEl ?? null;

    const html = document.documentElement;
    const body = document.body;

    this.#scrollY = window.scrollY || html.scrollTop || 0;
    this.#prevHtmlStyle = html.getAttribute("style");
    this.#prevBodyStyle = body.getAttribute("style");

    const scrollbarGap = window.innerWidth - html.clientWidth;

    html.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${this.#scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    if (scrollbarGap > 0) body.style.paddingRight = `${scrollbarGap}px`;

    // Best-effort: pause a globally-exposed Lenis instance if the host has one.
    this.#externalLenis = typeof window.lenis?.stop === "function" ? window.lenis : null;
    this.#externalLenis?.stop();

    window.addEventListener("wheel", this.#onWheel, { passive: false, capture: true });
    window.addEventListener("touchmove", this.#onTouchMove, { passive: false, capture: true });
    window.addEventListener("keydown", this.#onKeyDown, { capture: true });
  }

  unlock() {
    if (!this.#locked) return;
    this.#locked = false;

    window.removeEventListener("wheel", this.#onWheel, { capture: true });
    window.removeEventListener("touchmove", this.#onTouchMove, { capture: true });
    window.removeEventListener("keydown", this.#onKeyDown, { capture: true });

    const html = document.documentElement;
    const body = document.body;

    if (this.#prevHtmlStyle === null) html.removeAttribute("style");
    else html.setAttribute("style", this.#prevHtmlStyle);

    if (this.#prevBodyStyle === null) body.removeAttribute("style");
    else body.setAttribute("style", this.#prevBodyStyle);

    window.scrollTo(0, this.#scrollY);

    this.#externalLenis?.start();
    this.#externalLenis = null;
    this.#allowedEl = null;
  }
}
