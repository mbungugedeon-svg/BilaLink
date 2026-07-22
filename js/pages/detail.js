// js/pages/detail.js
import { shell } from "../components/navbar.js";
import { productCard, emptyState, productImage } from "../components/productCard.js";
import { fact } from "../components/formFields.js";
import { fmtPrice, stars, initials, esc, telHref } from "../utils/format.js";
import { icon, catOf } from "../utils/helpers.js";
import { state } from "../services/state.js";
import { listings } from "../data/products.js";
import { i18n } from "../i18n.js";

export function detail() {
  const l = listings.find((x) => x.id === state.selectedId) || listings[0];
  const similar = listings.filter((x) => x.id !== l.id && catOf(x.crop) === catOf(l.crop)).slice(0, 3);
  const imgSrc = productImage(l.crop, l.customPhoto);

  const alreadyReserved = state.authed && state.reservations.some((r) => r.listingId === l.id);
  const isOwnListing = state.authed && state.currentUser?.id === l.sellerId;

  const reserveBtn = isOwnListing
    ? ""
    : alreadyReserved
      ? `<button class="btn reserve" disabled style="opacity:.6;cursor:default">✅ Déjà réservé</button>`
      : `<button class="btn reserve" data-reserve="${l.id}">${i18n.btnReserve()}</button>`;

  return shell(`
    <main class="detail">
      <button class="back" data-go="catalogue">${i18n.backToMarket()}</button>
      <section class="detail-grid">
        <div class="gallery">
          <img class="main-photo" src="${imgSrc}" alt="${esc(l.crop)}" onerror="this.src='https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80'">
          <div class="thumbs">
            <img src="${imgSrc}" alt="" onerror="this.src='https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80'">
            <img src="https://i.pinimg.com/736x/72/5f/11/725f1174c7bd19cce45092f2ebc70e3e.jpg" alt="">
            <img src="https://i.pinimg.com/1200x/4d/b4/35/4db435377db657fd668c333dfbed0d2d.jpg" alt="">
          </div>
        </div>
        <article class="detail-info">
          <span class="eyebrow">${esc(catOf(l.crop))}</span>
          <h1>${esc(l.crop)}</h1>
          <strong class="big-price">${fmtPrice(l.price)} <small>/ ${esc(l.unit)}</small></strong>
          <p>${esc(l.desc)}</p>
          <div class="detail-facts">
            ${fact(i18n.labelQty(),       l.qty)}
            ${fact(i18n.labelAvail(),     l.available)}
            ${fact(i18n.labelQuality(),   l.quality)}
            ${fact(i18n.labelPublished(), l.published)}
            ${fact(i18n.labelLocation(),  `${l.city}, ${l.province}`)}
            ${fact(i18n.labelDistance(),  `${l.distance} km`)}
            ${fact(i18n.labelDelivery(),  l.delivery ? i18n.deliveryYes() : i18n.deliveryNo())}
            ${fact(i18n.labelPrice(),     l.negotiable ? i18n.priceNeg() : i18n.priceFixed())}
          </div>
          <div class="seller-card">
            <span class="avatar large">${initials(l.seller)}</span>
            <div>
              <strong>${esc(l.seller)}</strong>
              <p>${l.verified
                ? `${i18n.verifiedSupplier()} · ${i18n.verifiedPhone()} · ${i18n.coopMember()}`
                : i18n.verifiedPhone()}</p>
              <span>${stars(l.rating)} ${l.rating} · ${i18n.sales(l.sales)}</span>
            </div>
          </div>
          <div class="detail-actions">
            <a class="btn primary" href="${telHref(l.phone)}">${icon("phone")} ${i18n.btnCall()}</a>
            ${!isOwnListing ? `<button class="btn soft" id="openChat" data-listing="${l.id}" data-seller-id="${l.sellerId}">💬 Discuter</button>` : ""}
            ${reserveBtn}
            <button class="btn soft" id="shareBtn">${icon("share")} ${i18n.btnShare()}</button>
          </div>
          ${!state.authed ? `<p class="auth-hint">💡 <button class="link-btn" data-go="auth">Connectez-vous</button> pour réserver et envoyer des messages.</p>` : ""}
        </article>
      </section>

      <section class="section map-section">
        <div class="section-head"><h2>${i18n.supplierLocation()}</h2><p>${i18n.mapSub()}</p></div>
        <div id="map"></div>
      </section>

      <section class="section">
        <div class="section-head"><h2>${i18n.similarProducts()}</h2></div>
        <div class="cards compact-cards">
          ${similar.length ? similar.map(productCard).join("") : emptyState(i18n.noSimilar(), i18n.noSimilarSub())}
        </div>
      </section>
    </main>`, { bottom: true });
}
