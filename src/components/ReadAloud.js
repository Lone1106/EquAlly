import { createTranslator } from "../i18n/index.js";

const BLOCK_SELECTOR =
  "p, h1, h2, h3, h4, h5, h6, li, blockquote, figcaption, td, th, dt, dd, a, button, label, summary, caption";
const HIGHLIGHT_PAD = 4;
const LANG_MAP = { en: "en-US", de: "de-DE" };

// macOS alone ships dozens of installed system voices per language, most of
// them "novelty" character voices (Albert, Zarvox, Eddy, Grandma, ...) —
// none of them flagged as the OS default in every configuration, so a naive
// "first voice for this language" pick can land on one of these instead of
// a normal-sounding one. The parenthesised suffix ("Eddy (English (United
// States))") reliably marks the newer novelty voices; this denylist covers
// the older ones that aren't named that way.
const NOVELTY_VOICE_NAMES = new Set([
  "Albert",
  "Bad News",
  "Bahh",
  "Bells",
  "Boing",
  "Bruce",
  "Bubbles",
  "Cellos",
  "Deranged",
  "Good News",
  "Hysterical",
  "Jester",
  "Junior",
  "Organ",
  "Pipe Organ",
  "Ralph",
  "Superstar",
  "Trinoids",
  "Whisper",
  "Wobble",
  "Zarvox",
]);
// When present, these are the well-known flagship voices for each language
// and win over anything else even if the OS didn't flag a default.
const PREFERRED_VOICE_NAMES = { en: ["Samantha", "Alex", "Ava", "Karen"], de: ["Anna", "Petra", "Markus"] };

/**
 * Text-to-speech via the browser's built-in speechSynthesis API — no
 * dependency, but voice availability/quality varies by OS and browser.
 * While enabled, clicking any text-bearing element (paragraph, heading,
 * list item, link, ...) speaks its text instead of following the default
 * action (a link click would otherwise navigate away mid-sentence). A
 * highlight box, drawn in the shadow DOM like the nav-mode outline, tracks
 * whichever element is currently being read; Escape interrupts speech
 * without leaving read-aloud mode (only the panel toggle does that).
 */
export class ReadAloud {
  #enabled = false;
  #currentEl = null;
  #onClick = (event) => this.#handleClick(event);
  #onKeydown = (event) => this.#handleKeydown(event);
  #onReposition = () => this.#position(this.#currentEl);
  #rafId = null;
  #voices = [];

  constructor({ locale, exclude }) {
    this.locale = locale;
    this.translator = createTranslator(locale);
    this.exclude = exclude;

    // getVoices() is often empty until the browser finishes enumerating
    // installed voices, signaled by "voiceschanged" — sometimes only after
    // the first speak() call. Without this, an early click can fall back to
    // a generic/robotic voice instead of the OS's actual default one.
    if ("speechSynthesis" in window) {
      this.#loadVoices();
      window.speechSynthesis.addEventListener("voiceschanged", () => this.#loadVoices());
    }
  }

  render() {
    this.highlightEl = document.createElement("div");
    this.highlightEl.className = "equally-read-highlight";
    this.highlightEl.setAttribute("aria-hidden", "true");

    this.announcerEl = document.createElement("div");
    this.announcerEl.className = "equally-read-announcer";
    this.announcerEl.setAttribute("role", "status");
    this.announcerEl.setAttribute("aria-live", "polite");

    this.wrapperEl = document.createElement("div");
    this.wrapperEl.append(this.highlightEl, this.announcerEl);
    return this.wrapperEl;
  }

  setLocale(locale) {
    this.locale = locale;
    this.translator = createTranslator(locale);
    if (this.#enabled) this.announcerEl.textContent = this.translator.t("readAloudHint");
  }

  enable() {
    if (this.#enabled || !("speechSynthesis" in window)) return;
    this.#enabled = true;
    document.addEventListener("click", this.#onClick, true);
    document.addEventListener("keydown", this.#onKeydown, true);
    window.addEventListener("scroll", this.#onReposition, { passive: true, capture: true });
    window.addEventListener("resize", this.#onReposition);
    this.announcerEl.textContent = this.translator.t("readAloudHint");
  }

  disable() {
    if (!this.#enabled) return;
    this.#enabled = false;
    document.removeEventListener("click", this.#onClick, true);
    document.removeEventListener("keydown", this.#onKeydown, true);
    window.removeEventListener("scroll", this.#onReposition, { passive: true, capture: true });
    window.removeEventListener("resize", this.#onReposition);
    if (this.#rafId !== null) cancelAnimationFrame(this.#rafId);
    this.#rafId = null;
    window.speechSynthesis?.cancel();
    this.#unhighlight();
    this.announcerEl.textContent = "";
  }

  #handleClick(event) {
    if (this.exclude && event.composedPath().includes(this.exclude)) return;

    const target = event.target.closest?.(BLOCK_SELECTOR);
    if (!target) return;

    event.preventDefault();
    event.stopPropagation();
    this.#speak(target);
  }

  #handleKeydown(event) {
    if (event.key !== "Escape" || !window.speechSynthesis?.speaking) return;
    window.speechSynthesis.cancel();
    this.#unhighlight();
  }

  #speak(el) {
    const text = (el.getAttribute("aria-label") || el.textContent || el.getAttribute("alt") || "")
      .trim()
      .replace(/\s+/g, " ");
    if (!text) return;

    window.speechSynthesis.cancel();

    const lang = LANG_MAP[this.locale] ?? LANG_MAP.en;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    const voice = this.#pickVoice(lang);
    if (voice) utterance.voice = voice;
    utterance.onstart = () => this.#highlight(el);
    utterance.onend = () => this.#unhighlight();
    utterance.onerror = () => this.#unhighlight();

    window.speechSynthesis.speak(utterance);
  }

  #loadVoices() {
    this.#voices = window.speechSynthesis.getVoices();
  }

  // Prefer a known-good flagship voice, then whatever the OS/browser itself
  // flags as the default for an exact language match, then any voice for
  // that language with the obvious novelty ones filtered out (falling back
  // to the unfiltered list only if that leaves nothing), then finally any
  // voice at all for the base language ("en") regardless of region.
  #pickVoice(lang) {
    const exact = this.#voices.filter((voice) => voice.lang === lang);
    const sane = exact.filter((voice) => !NOVELTY_VOICE_NAMES.has(voice.name) && !voice.name.includes("("));
    const pool = sane.length ? sane : exact;

    if (pool.length) {
      const preferredNames = PREFERRED_VOICE_NAMES[lang.slice(0, 2)] ?? [];
      return (
        pool.find((voice) => preferredNames.includes(voice.name)) ??
        pool.find((voice) => voice.default) ??
        pool[0]
      );
    }

    const base = lang.slice(0, 2);
    return this.#voices.find((voice) => voice.lang.slice(0, 2) === base);
  }

  #highlight(el) {
    this.#currentEl = el;
    this.#position(el);
    this.highlightEl.classList.add("is-visible");
  }

  #unhighlight() {
    this.#currentEl = null;
    this.highlightEl.classList.remove("is-visible");
  }

  #position(el) {
    if (!el) return;
    if (this.#rafId !== null) return;
    this.#rafId = requestAnimationFrame(() => {
      this.#rafId = null;
      const rect = el.getBoundingClientRect();
      Object.assign(this.highlightEl.style, {
        top: `${rect.top - HIGHLIGHT_PAD}px`,
        left: `${rect.left - HIGHLIGHT_PAD}px`,
        width: `${rect.width + HIGHLIGHT_PAD * 2}px`,
        height: `${rect.height + HIGHLIGHT_PAD * 2}px`,
      });
    });
  }
}
