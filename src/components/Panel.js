export class Panel {
  constructor(config = {}) {
    this.config = config;
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.className = "equally-wrapper";
    wrapper.appendChild(this.createToggle());

    return wrapper;
  }

  createToggle() {
    const toggle = document.createElement("button");
    toggle.className = "equally-toggle";
    toggle.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><path d="m9 20 3-6 3 6"/><path d="m6 8 6 2 6-2"/><path d="M12 10v4"/></svg>
      `;

    return toggle;
  }
}
