const FALLBACK_LINE_HEIGHT = 28;
const WINDOW_LINES = 3;

/**
 * Dims the whole page with a translucent overlay, except for a full-width
 * band around the cursor's vertical position — roughly three lines of text
 * tall — that stays clear. Built from two panels (above/below the cursor)
 * rather than a single masked layer, which keeps it simple and cheap to
 * reposition on every pointer move.
 */
export class ReadingMask {
  #enabled = false;
  #rafId = null;
  #lastY = window.innerHeight / 2;
  #onMove = (event) => this.#handleMove(event);
  #onResize = () => this.#reposition();

  render() {
    this.wrapper = document.createElement("div");
    this.wrapper.className = "equally-reading-mask";
    this.wrapper.setAttribute("aria-hidden", "true");

    this.topEl = document.createElement("div");
    this.topEl.className = "equally-reading-mask-panel equally-reading-mask-top";

    this.bottomEl = document.createElement("div");
    this.bottomEl.className = "equally-reading-mask-panel equally-reading-mask-bottom";

    this.wrapper.append(this.topEl, this.bottomEl);
    return this.wrapper;
  }

  enable() {
    if (this.#enabled) return;
    this.#enabled = true;
    this.wrapper.classList.add("is-visible");
    document.addEventListener("mousemove", this.#onMove);
    window.addEventListener("resize", this.#onResize);
    this.#reposition();
  }

  disable() {
    if (!this.#enabled) return;
    this.#enabled = false;
    this.wrapper.classList.remove("is-visible");
    document.removeEventListener("mousemove", this.#onMove);
    window.removeEventListener("resize", this.#onResize);
    if (this.#rafId !== null) cancelAnimationFrame(this.#rafId);
    this.#rafId = null;
  }

  #handleMove(event) {
    this.#lastY = event.clientY;
    if (this.#rafId !== null) return;
    this.#rafId = requestAnimationFrame(() => {
      this.#rafId = null;
      this.#reposition();
    });
  }

  #reposition() {
    const half = this.#windowHeight() / 2;
    const top = Math.max(0, this.#lastY - half);
    const bottom = Math.max(0, window.innerHeight - (this.#lastY + half));
    this.topEl.style.height = `${top}px`;
    this.bottomEl.style.height = `${bottom}px`;
  }

  // Roughly three lines tall, based on the page's own line height, so it
  // scales along with EquAlly's own line-height/font-size features.
  #windowHeight() {
    const lineHeight = parseFloat(getComputedStyle(document.body).lineHeight);
    return (Number.isFinite(lineHeight) ? lineHeight : FALLBACK_LINE_HEIGHT) * WINDOW_LINES;
  }
}
