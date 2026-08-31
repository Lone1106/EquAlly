import { ShadowHost } from "./ShadowHost.js";
import { EffectsHost } from "./EffectsHost.js";
import { SettingsStore } from "./SettingsStore.js";
import { FeatureManager } from "./FeatureManager.js";
import { features } from "./features/definitions.js";
import { resolveLocale, LOCALES } from "./i18n/index.js";
import { Panel } from "./components/Panel.js";
import { SkipLink } from "./components/SkipLink.js";
import { LinkTooltip } from "./components/LinkTooltip.js";
import { ReadingGuide } from "./components/ReadingGuide.js";
import { ReadingMask } from "./components/ReadingMask.js";

export class Equally {
  constructor(config = {}) {
    this.config = {
      ...config,
    };

    this.store = new SettingsStore("equally");
    this.host = new ShadowHost();
    this.effects = new EffectsHost();
    this.manager = new FeatureManager({
      settingsStore: this.store,
      features,
      root: document.documentElement,
    });

    this.#init();
  }

  #init() {
    this.effects.mount();
    this.manager.init();

    this.host.mount();

    const locale = this.store.get("locale", null) ?? resolveLocale(this.config);

    let panel;
    const skipLink = new SkipLink({
      locale,
      onActivate: () => panel.toggleEl.focus(),
    });
    document.body.prepend(skipLink.render());

    const tooltip = new LinkTooltip({ locale });

    panel = new Panel({
      features,
      manager: this.manager,
      locale,
      locales: LOCALES,
      onLocaleChange: (code) => {
        this.store.set("locale", code);
        skipLink.setLocale(code);
        tooltip.setLocale(code);
      },
    });
    const readingGuide = new ReadingGuide();
    const readingMask = new ReadingMask();

    const wrapper = panel.render();
    wrapper.appendChild(tooltip.render());
    wrapper.appendChild(readingGuide.render());
    wrapper.appendChild(readingMask.render());
    this.host.root.appendChild(wrapper);
    tooltip.mount();

    this.#syncOverlay("reading-guide", readingGuide);
    this.#syncOverlay("reading-mask", readingMask);
  }

  #syncOverlay(id, controller) {
    if (this.manager.get(id)) controller.enable();
    this.manager.onChange((changedId, value) => {
      if (changedId !== id) return;
      if (value) controller.enable();
      else controller.disable();
    });
  }
}
