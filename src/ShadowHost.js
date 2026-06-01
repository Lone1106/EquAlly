import equallyStyles from "./styles/styles.css?inline";

export class ShadowHost {
  mount() {
    this.el = document.createElement("div");
    this.el.id = "equally-host";
    document.body.appendChild(this.el);

    this.shadow = this.el.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = equallyStyles;

    this.root = document.createElement("div");
    this.root.className = "equally-root";

    this.shadow.append(style, this.root);
  }
}
