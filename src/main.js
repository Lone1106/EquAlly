import { Equally } from "./Equally.js";

const config = window.Equally ?? {};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new Equally(config));
} else {
  new Equally(config);
}

window.Equally = Equally;
