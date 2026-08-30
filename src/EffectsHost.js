import equallyEffects from "./styles/effects.css?inline";

export class EffectsHost {
  mount() {
    if (document.getElementById("equally-effects")) return;

    const style = document.createElement("style");
    style.id = "equally-effects";
    style.textContent = equallyEffects;
    document.head.appendChild(style);
  }
}
