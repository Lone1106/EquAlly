import { ShadowHost } from "./ShadowHost.js";
import { SettingsStore } from "./SettingsStore.js";
import { Panel } from "./components/Panel.js";

export class Equally {
  constructor(config = {}) {
    this.config = {
      ...config,
    };

    this.store = new SettingsStore("equally");
    this.host = new ShadowHost();
    this.features = [];

    this.#init();
  }

  #init() {
    this.host.mount();

    const panel = new Panel(this.config);
    this.host.root.appendChild(panel.render());
  }
}
