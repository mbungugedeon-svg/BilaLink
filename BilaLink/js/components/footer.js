// js/components/footer.js
import { i18n } from "../i18n.js";

export function footer() {
  return `<footer class="app-footer">
    <p>${i18n.footerText()}</p>
  </footer>`;
}
