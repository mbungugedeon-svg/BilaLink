// js/utils/helpers.js
// Sélecteurs DOM raccourcis, logique de catégorisation produit, et bibliothèque d'icônes SVG inline.

import { CATEGORIES } from "../data/products.js";

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export const catOf = (crop) =>
  Object.entries(CATEGORIES).find(([, items]) => items.includes(crop))?.[0] || "Autres";

export const allCrops = () => Object.values(CATEGORIES).flat();

// Bibliothèque d'icônes SVG inline (pas de dépendance externe, pas de requête réseau).
const ICON_PATHS = {
  search: '<circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path>',
  map: '<path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z"></path><path d="M9 3v15"></path><path d="M15 6v15"></path>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"></path>',
  star: '<path d="m12 2 3 6 6.6 1-4.8 4.6 1.1 6.5L12 17l-5.9 3.1 1.1-6.5L2.4 9 9 8l3-6Z"></path>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"></path><path d="m9 12 2 2 4-4"></path>',
  plus: '<path d="M12 5v14"></path><path d="M5 12h14"></path>',
  chart: '<path d="M3 3v18h18"></path><path d="m7 15 4-4 3 3 5-7"></path>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"></path>',
  share: '<circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="m8.6 13.5 6.8 4"></path><path d="m15.4 6.5-6.8 4"></path>',
  bot: '<rect x="4" y="8" width="16" height="12" rx="4"></rect><path d="M12 4v4"></path><circle cx="9" cy="14" r="1"></circle><circle cx="15" cy="14" r="1"></circle>',
  leaf: '<path d="M5 19c7.5-.1 12.6-5.1 14-14-8.9 1.4-13.9 6.5-14 14Z"></path><path d="M5 19c3.4-4 7.2-7 12-9"></path>',
  home: '<path d="m3 11 9-8 9 8"></path><path d="M5 10v10h14V10"></path><path d="M10 20v-6h4v6"></path>',
  user: '<circle cx="12" cy="8" r="4"></circle><path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6"></path>',
  chat: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>',
};

export function icon(name) {
  return `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICON_PATHS[name] || ICON_PATHS.search}</svg>`;
}

export function leafIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON_PATHS.leaf}</svg>`;
}
