// js/utils/format.js
// Fonctions pures de formatage texte/affichage. Aucune dépendance à l'état de l'app.

export const fmtPrice = (n) => Number(n).toLocaleString("fr-FR") + " FC";

export const initials = (name) =>
  name.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase();

export const stars = (rating) =>
  "★★★★★".slice(0, Math.round(rating)) + "☆☆☆☆☆".slice(0, 5 - Math.round(rating));

// Échappement HTML : toute donnée dynamique injectée dans un template string
// doit passer par esc() pour éviter les injections et les balises cassées.
export const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));

export const telHref = (phone) => `tel:${phone.replace(/\s/g, "")}`;

export const waHref = (phone, text) =>
  `https://wa.me/${phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(text)}`;
