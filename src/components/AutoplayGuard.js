const AUTOPLAY_PARAM = /([?&])autoplay=1\b/;

/**
 * Second half of "seizure safe" mode (the first half, freezing CSS
 * animations/transitions, lives in effects.css under .equally-reduce-motion).
 * Pauses autoplaying <video>/<audio> and strips autoplay from embedded
 * players (YouTube, Vimeo, ...) that use an `autoplay=1` query param, since
 * neither is something CSS can reach. A MutationObserver keeps catching
 * media injected after the mode is turned on — e.g. lazy-loaded players
 * further down the page.
 */
export class AutoplayGuard {
  #observer = null;

  enable() {
    if (this.#observer) return;
    this.#stopWithin(document.body);
    this.#observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          this.#stopNode(node);
          this.#stopWithin(node);
        }
      }
    });
    this.#observer.observe(document.body, { childList: true, subtree: true });
  }

  disable() {
    this.#observer?.disconnect();
    this.#observer = null;
  }

  #stopWithin(root) {
    for (const el of root.querySelectorAll?.("video, audio, iframe") ?? []) {
      this.#stopNode(el);
    }
  }

  #stopNode(el) {
    if (el.tagName === "VIDEO" || el.tagName === "AUDIO") {
      if (el.autoplay) el.autoplay = false;
      if (!el.paused) el.pause();
    } else if (el.tagName === "IFRAME") {
      const src = el.getAttribute("src");
      if (src && AUTOPLAY_PARAM.test(src)) {
        el.setAttribute("src", src.replace(AUTOPLAY_PARAM, "$1autoplay=0"));
      }
    }
  }
}
