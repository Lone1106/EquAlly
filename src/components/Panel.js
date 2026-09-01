import { createTranslator } from "../i18n/index.js";
import { featureIcons } from "../features/icons.js";

export class Panel {
  constructor({ features, manager, locale, locales, onLocaleChange }) {
    this.features = features;
    this.manager = manager;
    this.locale = locale;
    this.locales = locales;
    this.onLocaleChange = onLocaleChange;
    this.translator = createTranslator(locale);
    this.isOpen = false;
    this.rows = new Map();
    this.localeButtons = new Map();
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.className = "equally-wrapper";

    this.toggleEl = this.#createToggle();
    this.menuEl = this.#createMenu();
    wrapper.append(this.toggleEl, this.menuEl);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.isOpen) this.close();
    });

    document.addEventListener("click", (event) => {
      if (this.isOpen && !event.composedPath().includes(wrapper)) this.close();
    });

    this.manager.onChange((id) => this.rows.get(id)?.sync());

    return wrapper;
  }

  open() {
    this.isOpen = true;
    this.menuEl.inert = false;
    this.menuEl.classList.add("is-open");
    this.toggleEl.setAttribute("aria-expanded", "true");
  }

  close() {
    this.isOpen = false;
    this.menuEl.classList.remove("is-open");
    this.menuEl.inert = true;
    this.toggleEl.setAttribute("aria-expanded", "false");
  }

  #createToggle() {
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "equally-toggle";
    toggle.setAttribute("aria-haspopup", "true");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", "equally-menu");
    toggle.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><path d="m9 20 3-6 3 6"/><path d="m6 8 6 2 6-2"/><path d="M12 10v4"/></svg>
      `;
    toggle.addEventListener("click", () => (this.isOpen ? this.close() : this.open()));

    return toggle;
  }

  #createMenu() {
    const menu = document.createElement("div");
    menu.id = "equally-menu";
    menu.className = "equally-menu";
    menu.setAttribute("role", "dialog");
    menu.inert = true;

    this.headerEl = document.createElement("div");
    this.headerEl.className = "equally-menu-header";

    const heading = document.createElement("div");
    heading.className = "equally-menu-heading";

    this.avatarEl = document.createElement("div");
    this.avatarEl.className = "equally-avatar";
    this.avatarEl.setAttribute("aria-hidden", "true");
    this.avatarEl.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><path d="m9 20 3-6 3 6"/><path d="m6 8 6 2 6-2"/><path d="M12 10v4"/></svg>
      `;

    this.titleEl = document.createElement("h2");
    this.titleEl.className = "equally-menu-title";

    heading.append(this.avatarEl, this.titleEl);

    this.quickResetEl = document.createElement("button");
    this.quickResetEl.type = "button";
    this.quickResetEl.className = "equally-quick-reset";
    this.quickResetEl.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
      `;
    this.quickResetEl.addEventListener("click", () => this.manager.reset());

    this.closeEl = document.createElement("button");
    this.closeEl.type = "button";
    this.closeEl.className = "equally-close";
    this.closeEl.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      `;
    this.closeEl.addEventListener("click", () => this.close());

    const headerActions = document.createElement("div");
    headerActions.className = "equally-header-actions";
    headerActions.append(this.quickResetEl, this.closeEl);

    this.headerEl.append(heading, headerActions);
    menu.appendChild(this.headerEl);

    this.bodyEl = document.createElement("div");
    this.bodyEl.className = "equally-menu-body";
    menu.appendChild(this.bodyEl);

    this.sectionDisplayEl = this.#createSectionLabel();
    this.bodyEl.appendChild(this.sectionDisplayEl);

    this.displayGroupEl = document.createElement("div");
    this.displayGroupEl.className = "equally-group";
    this.displayGroupEl.appendChild(this.#createLocaleRow());

    const steppers = this.features.filter((feature) => feature.type === "stepper");
    const visualAids = this.features.filter(
      (feature) => feature.type === "toggle" && feature.section === "visual",
    );
    const readingAids = this.features.filter(
      (feature) => feature.type === "toggle" && feature.section === "reading",
    );

    for (const feature of steppers) {
      const row = this.#createStepperRow(feature);
      this.rows.set(feature.id, row);
      this.displayGroupEl.appendChild(row.el);
    }
    this.bodyEl.appendChild(this.displayGroupEl);

    this.sectionVisualEl = this.#createSectionLabel();
    this.bodyEl.appendChild(this.sectionVisualEl);
    this.visualGridEl = this.#createAidGrid(visualAids);
    this.bodyEl.appendChild(this.visualGridEl);

    this.sectionReadingEl = this.#createSectionLabel();
    this.bodyEl.appendChild(this.sectionReadingEl);
    this.readingGridEl = this.#createAidGrid(readingAids);
    this.bodyEl.appendChild(this.readingGridEl);

    this.resetEl = document.createElement("button");
    this.resetEl.type = "button";
    this.resetEl.className = "equally-reset";
    this.resetEl.addEventListener("click", () => this.manager.reset());
    this.bodyEl.appendChild(this.resetEl);

    this.creditEl = document.createElement("a");
    this.creditEl.className = "equally-credit";
    this.creditEl.href = "https://equally.janrei.de/";
    this.creditEl.target = "_blank";
    this.creditEl.rel = "noopener noreferrer";

    this.creditPrefixEl = document.createTextNode("");
    this.creditBrandEl = document.createElement("span");
    this.creditBrandEl.className = "equally-credit-brand";
    this.creditBrandEl.textContent = "EquAlly";
    this.creditEl.append(this.creditPrefixEl, this.creditBrandEl);

    this.bodyEl.appendChild(this.creditEl);

    this.#applyLocale(this.locale, menu);

    return menu;
  }

  #createSectionLabel() {
    const el = document.createElement("p");
    el.className = "equally-section-label";
    return el;
  }

  #createLocaleRow() {
    const row = document.createElement("div");
    row.className = "equally-row";

    this.localeLabelEl = document.createElement("span");
    this.localeLabelEl.className = "equally-row-label";

    const group = document.createElement("div");
    group.className = "equally-locale-switch";
    group.setAttribute("role", "group");
    this.localeGroupEl = group;

    for (const { code, label } of this.locales) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "equally-locale-option";
      button.textContent = label;
      button.addEventListener("click", () => this.#selectLocale(code));
      this.localeButtons.set(code, button);
      group.appendChild(button);
    }

    row.append(this.localeLabelEl, group);
    return row;
  }

  #selectLocale(code) {
    if (code === this.locale) return;
    this.#applyLocale(code);
    this.onLocaleChange?.(code);
  }

  #applyLocale(locale, menu = this.menuEl) {
    this.locale = locale;
    this.translator = createTranslator(locale);
    const t = this.translator;

    this.toggleEl.setAttribute("aria-label", t.t("toggleLabel"));
    menu.setAttribute("aria-label", t.t("menuTitle"));
    this.titleEl.textContent = t.t("menuTitle");
    this.closeEl.setAttribute("aria-label", t.t("closeLabel"));
    this.quickResetEl.setAttribute("aria-label", t.t("resetLabel"));
    this.sectionDisplayEl.textContent = t.t("sectionDisplay");
    this.sectionVisualEl.textContent = t.t("sectionVisualAids");
    this.sectionReadingEl.textContent = t.t("sectionReadingAids");
    this.localeLabelEl.textContent = t.t("languageLabel");
    this.localeGroupEl.setAttribute("aria-label", t.t("languageLabel"));
    this.resetEl.textContent = t.t("resetLabel");
    this.creditPrefixEl.textContent = t.t("creditPrefix");

    for (const [code, button] of this.localeButtons) {
      button.setAttribute("aria-pressed", String(code === locale));
    }

    for (const row of this.rows.values()) row.relabel(t);
  }

  #createAidGrid(aidFeatures) {
    const grid = document.createElement("div");
    grid.className = "equally-aid-grid";

    for (const feature of aidFeatures) {
      const card = this.#createAidCard(feature);
      this.rows.set(feature.id, card);
      grid.appendChild(card.el);
    }

    return grid;
  }

  #createAidCard(feature) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "equally-aid-card";
    card.setAttribute("aria-pressed", String(this.manager.get(feature.id)));
    card.addEventListener("click", () => this.manager.toggle(feature.id));

    const iconEl = document.createElement("span");
    iconEl.className = "equally-aid-icon";
    iconEl.setAttribute("aria-hidden", "true");
    iconEl.innerHTML = featureIcons[feature.id] ?? "";

    const labelEl = document.createElement("span");
    labelEl.className = "equally-aid-label";

    card.append(iconEl, labelEl);

    return {
      el: card,
      sync: () => card.setAttribute("aria-pressed", String(this.manager.get(feature.id))),
      relabel: (t) => {
        labelEl.textContent = t.featureLabel(feature.id);
      },
    };
  }

  #createStepperRow(feature) {
    const row = document.createElement("div");
    row.className = "equally-row";

    const labelEl = document.createElement("span");
    labelEl.className = "equally-row-label";

    const stepper = document.createElement("div");
    stepper.className = "equally-stepper";

    const decrement = document.createElement("button");
    decrement.type = "button";
    decrement.textContent = "–";
    decrement.addEventListener("click", () => this.manager.step(feature.id, -1));

    const value = document.createElement("span");
    value.className = "equally-stepper-value";
    value.textContent = feature.format(this.manager.get(feature.id));

    const increment = document.createElement("button");
    increment.type = "button";
    increment.textContent = "+";
    increment.addEventListener("click", () => this.manager.step(feature.id, 1));

    stepper.append(decrement, value, increment);
    row.append(labelEl, stepper);

    return {
      el: row,
      sync: () => (value.textContent = feature.format(this.manager.get(feature.id))),
      relabel: (t) => {
        const label = t.featureLabel(feature.id);
        labelEl.textContent = label;
        decrement.setAttribute("aria-label", t.t("decrease", label));
        increment.setAttribute("aria-label", t.t("increase", label));
      },
    };
  }
}
