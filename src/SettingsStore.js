export class SettingsStore {
  constructor(namespace) {
    this.namespace = namespace;
  }

  #key(id) {
    return `${this.namespace}:${id}`;
  }

  get(id, fallback) {
    let raw;
    try {
      raw = localStorage.getItem(this.#key(id));
    } catch {
      return fallback;
    }

    if (raw === null) return fallback;

    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  set(id, value) {
    try {
      localStorage.setItem(this.#key(id), JSON.stringify(value));
    } catch {}
  }
}
