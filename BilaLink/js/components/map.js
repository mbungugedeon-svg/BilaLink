// js/components/map.js
// Encapsule l'intégration Leaflet/OpenStreetMap. Aucune autre partie de l'app
// ne doit toucher à `window.L` directement — tout passe par ce module.

import { COORDS, DEFAULT_COORDS } from "../data/provinces.js";

/**
 * Affiche une carte Leaflet centrée sur la ville d'une offre, avec un marqueur.
 * @param {string} containerId - id de l'élément DOM cible (doit déjà être dans le DOM).
 * @param {{city: string, seller: string}} listing
 */
export function renderListingMap(containerId, listing) {
  const el = document.getElementById(containerId);
  if (!window.L || !el) return;

  const point = COORDS[listing.city] || DEFAULT_COORDS;
  const map = window.L.map(containerId, { scrollWheelZoom: false }).setView(point, 8);
  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap",
  }).addTo(map);
  window.L.marker(point).addTo(map).bindPopup(`${listing.seller}<br>${listing.city}`).openPopup();

  // Leaflet calcule mal sa taille si le conteneur n'était pas visible au moment du init.
  setTimeout(() => map.invalidateSize(), 100);
  return map;
}

/**
 * Affiche une carte avec un marqueur par offre (vue d'ensemble, ex. landing page).
 * @param {string} containerId
 * @param {Array<{city:string, crop:string, seller:string}>} listings
 */
export function renderOverviewMap(containerId, listings) {
  const el = document.getElementById(containerId);
  if (!window.L || !el) return;

  const map = window.L.map(containerId, { scrollWheelZoom: false }).setView(DEFAULT_COORDS, 5);
  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap",
  }).addTo(map);

  listings.forEach((l) => {
    const point = COORDS[l.city] || DEFAULT_COORDS;
    window.L.marker(point).addTo(map).bindPopup(`${l.crop} · ${l.seller}<br>${l.city}`);
  });

  setTimeout(() => map.invalidateSize(), 100);
  return map;
}
