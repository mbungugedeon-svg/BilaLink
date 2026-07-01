// js/pages/catalogue.js
import { shell } from "../components/navbar.js";
import { productCard, emptyState } from "../components/productCard.js";
import { selectField, inputField } from "../components/formFields.js";
import { state } from "../services/state.js";
import { filteredListings, hasAdvancedFilters } from "../services/marketplace.js";
import { allCrops } from "../utils/helpers.js";
import { esc } from "../utils/format.js";
import { PROVINCES, CITIES } from "../data/provinces.js";
import { CATEGORIES } from "../data/products.js";
import { i18n } from "../i18n.js";

function suggestions() {
  const q = state.search.trim().toLowerCase();
  const crops = allCrops().filter((c) => !q || c.toLowerCase().startsWith(q) || c.toLowerCase().includes(q)).slice(0, 6);
  return `<div class="suggestions">${crops.map((c) => `<button data-suggest="${esc(c)}">${esc(c)}</button>`).join("")}</div>`;
}

// Coordonnées approximatives par province pour la carte
const PROVINCE_COORDS = {
  "Kinshasa":       [-4.32, 15.32],
  "Kongo Central":  [-5.40, 14.44],
  "Kwilu":          [-5.00, 18.40],
  "Kasaï":          [-5.00, 21.00],
  "Kasaï Oriental": [-6.13, 23.65],
  "Haut-Katanga":   [-11.66, 27.48],
  "Lualaba":        [-10.00, 25.00],
  "Tshopo":         [0.51, 25.19],
  "Équateur":       [1.85, 19.52],
  "Maniema":        [-3.00, 26.00],
  "Sud-Kivu":       [-2.50, 28.86],
  "Nord-Kivu":      [-0.29, 29.25],
  "Sankuru":        [-3.80, 23.40],
  "Haut-Lomami":    [-7.90, 26.90],
};

function getCoords(listing) {
  const base = PROVINCE_COORDS[listing.province] || [-4.32, 15.32];
  // Léger décalage aléatoire déterministe basé sur l'id
  const jitter = (listing.id * 0.07) % 0.5;
  return [base[0] + jitter - 0.25, base[1] + jitter * 1.3 - 0.3];
}

export function catalogue() {
  const results = filteredListings();
  const viewMode = state.catalogueView || "list";
  const cityOptions = state.province === "Toutes" ? Object.values(CITIES).flat() : (CITIES[state.province] || []);

  const sortOptions = [
    ["recent",   i18n.sortRecent()],
    ["priceAsc", i18n.sortPriceAsc()],
    ["priceDesc",i18n.sortPriceDsc()],
    ["near",     i18n.sortNear()],
    ["rated",    i18n.sortRated()],
  ];
  const availOptions = ["Toutes", "Disponible", "Stock", "Commande"];

  // Sérialiser les données des listings pour la carte
  const mapListings = JSON.stringify(results.slice(0, 40).map((l) => ({
    id: l.id,
    crop: l.crop,
    price: l.price,
    unit: l.unit,
    seller: l.seller,
    city: l.city,
    province: l.province,
    coords: getCoords(l),
    verified: l.verified,
  })));

  return shell(`
    <main class="market">
      <section class="market-panel">
        <div class="search-line">
          <label class="searchbox">
            <svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
            <input id="searchInput" value="${esc(state.search)}" placeholder="${i18n.searchPlaceholder()}">
          </label>
          <button class="btn primary compact" id="nearMe">
            <svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z"></path><path d="M9 3v15"></path><path d="M15 6v15"></path></svg>
            ${i18n.btnNearMe()}
          </button>
        </div>
        ${suggestions()}
        <details class="filters" ${hasAdvancedFilters() ? "open" : ""}>
          <summary>${i18n.advancedFilters()}</summary>
          <div class="filter-grid">
            ${selectField("province", i18n.filterProvince(), ["Toutes", ...PROVINCES], state.province)}
            ${selectField("city", i18n.filterCity(), ["Toutes", ...cityOptions], state.city)}
            ${selectField("category", i18n.filterCategory(), ["Toutes", ...Object.keys(CATEGORIES)], state.category)}
            ${inputField("minPrice", i18n.filterMinPrice(), "number", state.minPrice)}
            ${inputField("maxPrice", i18n.filterMaxPrice(), "number", state.maxPrice)}
            ${selectField("availability", i18n.filterAvail(), availOptions, state.availability)}
            ${selectField("maxDistance", i18n.filterDist(), ["Toutes", "20", "60", "150", "500"], state.maxDistance)}
            ${selectField("minRating", i18n.filterRating(), ["0", "4", "4.5", "4.8"], state.minRating)}
            ${selectField("sort", i18n.filterSort(), sortOptions, state.sort)}
            <label class="check"><input id="verifiedOnly" type="checkbox" ${state.verifiedOnly ? "checked" : ""}> ${i18n.filterVerified()}</label>
          </div>
        </details>
      </section>

      <div class="section-title">
        <h2>${i18n.availableListings()}</h2>
        <div class="view-toggle">
          <span>${i18n.results(results.length)}</span>
          <div class="toggle-btns">
            <button class="view-btn ${viewMode === 'list' ? 'active' : ''}" data-view="list" title="Vue liste">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              Liste
            </button>
            <button class="view-btn ${viewMode === 'map' ? 'active' : ''}" data-view="map" title="Vue carte">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
              Carte
            </button>
          </div>
        </div>
      </div>

      ${viewMode === 'map' ? `
        <div id="catalogueMap" class="catalogue-map"></div>
        <script id="mapData" type="application/json">${mapListings}</script>
      ` : `
        <section class="cards">
          ${results.length ? results.map(productCard).join("") : emptyState(i18n.emptyTitle(), i18n.emptySub())}
        </section>
      `}
    </main>`, { bottom: true });
}
