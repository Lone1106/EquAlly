import { translations, DEFAULT_LOCALE, LOCALES } from "./translations.js";

export { LOCALES };

const SUPPORTED = Object.keys(translations);

export function resolveLocale(config = {}) {
  const candidates = [config.lang, document.documentElement.lang, ...(navigator.languages ?? [navigator.language])];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const short = candidate.slice(0, 2).toLowerCase();
    if (SUPPORTED.includes(short)) return short;
  }

  return DEFAULT_LOCALE;
}

export function createTranslator(locale) {
  const dict = translations[locale] ?? translations[DEFAULT_LOCALE];

  return {
    locale: dict === translations[locale] ? locale : DEFAULT_LOCALE,
    t(key, ...args) {
      const entry = dict[key] ?? translations[DEFAULT_LOCALE][key];
      return typeof entry === "function" ? entry(...args) : entry;
    },
    featureLabel(id) {
      return dict.features[id] ?? translations[DEFAULT_LOCALE].features[id];
    },
  };
}
