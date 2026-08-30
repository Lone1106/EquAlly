import { ShadowHost } from "./ShadowHost.js";
import { EffectsHost } from "./EffectsHost.js";
import { SettingsStore } from "./SettingsStore.js";
import { FeatureManager } from "./FeatureManager.js";
import { features } from "./features/definitions.js";
import { resolveLocale, LOCALES } from "./i18n/index.js";
import { Panel } from "./components/Panel.js";

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
    const panel = new Panel({
      features,
      manager: this.manager,
      locale,
      locales: LOCALES,
      onLocaleChange: (code) => this.store.set("locale", code),
    });
    this.host.root.appendChild(panel.render());
  }
}
