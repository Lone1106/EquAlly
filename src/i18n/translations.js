export const translations = {
  en: {
    toggleLabel: "Accessibility options",
    menuTitle: "Accessibility",
    closeLabel: "Close accessibility menu",
    languageLabel: "Language",
    resetLabel: "Reset all",
    creditLabel: "Maintained by Jan",
    increase: (label) => `Increase ${label}`,
    decrease: (label) => `Decrease ${label}`,
    features: {
      "font-size": "Font size",
      "line-height": "Line height",
      "letter-spacing": "Letter spacing",
      contrast: "High contrast",
      greyscale: "Color blind mode",
      dyslexic: "Dyslexia friendly font",
      "reduce-motion": "Seizure safe",
      readable: "Instant readability",
    },
  },
  de: {
    toggleLabel: "Barrierefreiheit-Optionen",
    menuTitle: "Barrierefreiheit",
    closeLabel: "Menü schließen",
    languageLabel: "Sprache",
    resetLabel: "Alles zurücksetzen",
    creditLabel: "Betreut von Jan",
    increase: (label) => `${label} erhöhen`,
    decrease: (label) => `${label} verringern`,
    features: {
      "font-size": "Schriftgröße",
      "line-height": "Zeilenhöhe",
      "letter-spacing": "Buchstabenabstand",
      contrast: "Hoher Kontrast",
      greyscale: "Farbenblind-Modus",
      dyslexic: "Legasthenie-Schrift",
      "reduce-motion": "Reizarmer Modus",
      readable: "Sofort lesbar",
    },
  },
};

export const DEFAULT_LOCALE = "en";

export const LOCALES = [
  { code: "en", label: "EN" },
  { code: "de", label: "DE" },
];
