// js/components/formFields.js
// Petits constructeurs de champs de formulaire réutilisés par le catalogue (filtres)
// et la page de publication. Évite de dupliquer le HTML des <select>/<input> partout.

import { esc } from "../utils/format.js";

export function selectField(id, label, options, value) {
  return `<label class="field small"><span>${label}</span><select id="${id}">${options.map((o) => {
    const val = Array.isArray(o) ? o[0] : o;
    const txt = Array.isArray(o) ? o[1] : o;
    return `<option value="${esc(val)}" ${String(value) === String(val) ? "selected" : ""}>${esc(txt)}</option>`;
  }).join("")}</select></label>`;
}

export function inputField(id, label, type, value) {
  return `<label class="field small"><span>${label}</span><input id="${id}" type="${type}" value="${esc(value)}" placeholder="0"></label>`;
}

export function fact(key, value) {
  return `<div><span>${esc(key)}</span><strong>${esc(value)}</strong></div>`;
}

export function metric(label, value, emoji = "") {
  return `<article class="metric">${emoji ? `<span class="metric-emoji">${emoji}</span>` : ""}<span>${label}</span><strong>${value}</strong></article>`;
}
