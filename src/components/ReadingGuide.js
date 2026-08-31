/**
 * A full-width horizontal ruler that tracks the mouse's vertical position,
 * making it easier to follow a line of text without losing your place.
 * Rendered inside the shadow DOM (so it gets the widget's own styling), but
 * driven by pointer events on the real page.
 */
export class ReadingGuide {
  #enabled = false;
  #rafId = null;
  #onMove = (event) => this.#handleMove(event);

  render() {
    this.el = document.createElement("div");
    this.el.className = "equally-reading-guide";
    this.el.setAttribute("aria-hidden", "true");
    return this.el;
  }

  enable() {
    if (this.#enabled) return;
    this.#enabled = true;
    this.el.style.transform = `translateY(${window.innerHeight / 2}px)`;
    this.el.classList.add("is-visible");
    document.addEventListener("mousemove", this.#onMove);
  }

  disable() {
    if (!this.#enabled) return;
    this.#enabled = false;
    this.el.classList.remove("is-visible");
    document.removeEventListener("mousemove", this.#onMove);
    if (this.#rafId !== null) cancelAnimationFrame(this.#rafId);
    this.#rafId = null;
  }

  #handleMove(event) {
    if (this.#rafId !== null) return;
    const y = event.clientY;
    this.#rafId = requestAnimationFrame(() => {
      this.#rafId = null;
      this.el.style.transform = `translateY(${y}px)`;
    });
  }
}
