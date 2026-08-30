export class FeatureManager {
  #filters = new Map();
  #listeners = new Set();

  constructor({ settingsStore, features, root }) {
    this.settingsStore = settingsStore;
    this.features = features;
    this.root = root;
    this.state = {};
  }

  init() {
    for (const feature of this.features) {
      const value = this.settingsStore.get(feature.id, feature.default);
      this.state[feature.id] = value;
      this.#apply(feature, value);
    }
  }

  get(id) {
    return this.state[id];
  }

  toggle(id) {
    const feature = this.#find(id);
    this.#set(feature, !this.state[id]);
  }

  step(id, direction) {
    const feature = this.#find(id);
    const raw = this.state[id] + direction * feature.step;
    const clamped = Math.min(feature.max, Math.max(feature.min, raw));
    const value = Math.round(clamped / feature.step) * feature.step;
    this.#set(feature, value);
  }

  reset() {
    for (const feature of this.features) {
      this.#set(feature, feature.default);
    }
  }

  onChange(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  #set(feature, value) {
    this.state[feature.id] = value;
    this.settingsStore.set(feature.id, value);
    this.#apply(feature, value);
    for (const listener of this.#listeners) listener(feature.id, value);
  }

  #apply(feature, value) {
    if (feature.type === "toggle") {
      if (feature.filter) {
        if (value) this.#filters.set(feature.id, feature.filter);
        else this.#filters.delete(feature.id);
        this.root.style.filter = [...this.#filters.values()].join(" ");
      } else {
        this.root.classList.toggle(feature.className, value);
      }
      return;
    }

    if (value === feature.default) {
      this.root.style.removeProperty(feature.cssVar);
    } else {
      this.root.style.setProperty(feature.cssVar, `${value}${feature.unit}`);
    }
  }

  #find(id) {
    return this.features.find((feature) => feature.id === id);
  }
}
