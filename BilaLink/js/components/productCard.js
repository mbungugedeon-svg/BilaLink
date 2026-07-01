// js/components/productCard.js
import { fmtPrice, stars, initials, esc } from "../utils/format.js";
import { catOf, icon } from "../utils/helpers.js";
import { IMAGES, FALLBACK_IMAGE } from "../data/products.js";
import { marketTone } from "../services/marketplace.js";
import { i18n } from "../i18n.js";

// Résoudre l'image : photo custom du producteur en priorité, sinon prédéfinie, sinon fallback
export const productImage = (crop, customPhoto) => {
  if (customPhoto) return customPhoto;
  return IMAGES[crop] || FALLBACK_IMAGE;
};

export function productCard(listing) {
  const tone = marketTone(listing);
  const imgSrc = productImage(listing.crop, listing.customPhoto);
  return `<article class="product-card" data-detail="${listing.id}">
    <div class="product-img">
      <img src="${imgSrc}" alt="${esc(listing.crop)}" onerror="this.src='${FALLBACK_IMAGE}'">
      <span>${esc(catOf(listing.crop))}</span>
    </div>
    <div class="product-body">
      <div class="card-heading">
        <h3>${esc(listing.crop)}</h3>
        <strong>${fmtPrice(listing.price)} <small>/ ${esc(listing.unit)}</small></strong>
      </div>
      <div class="muted">${esc(listing.qty)} · ${esc(listing.city)}, ${esc(listing.province)} · ${listing.distance} km</div>
      <div class="seller-line">
        <span class="avatar">${initials(listing.seller)}</span>
        <span>${esc(listing.seller)}</span>
        ${listing.verified ? `<b class="badge">${icon("shield")} ${i18n.verified()}</b>` : ""}
      </div>
      <div class="trust-row">
        <span>${stars(listing.rating)} ${listing.rating}</span>
        <span>${i18n.sales(listing.sales)}</span>
        <span>${esc(listing.available)}</span>
      </div>
      <div class="price-tone ${tone.cls}">${tone.text}</div>
      <div class="card-actions">
        <button class="btn ghost" data-detail="${listing.id}">${i18n.btnViewDetails()}</button>
        <button class="btn primary" data-contact="${listing.id}">${icon("phone")} ${i18n.btnContact()}</button>
        <button class="btn reserve" data-reserve="${listing.id}">${i18n.btnReserve()}</button>
      </div>
    </div>
  </article>`;
}

export function emptyState(title, text) {
  return `<div class="empty"><strong>${title}</strong><p>${text}</p></div>`;
}
