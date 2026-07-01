// js/pages/feed.js
// Page fil d'actualité — style réseau social agricole
import { shell } from "../components/navbar.js";
import { fmtPrice, initials, esc } from "../utils/format.js";
import { feedPosts, clearNewFeedCount } from "../services/feed.js";
import { state, go } from "../services/state.js";
import { productImage } from "../components/productCard.js";
import { listings } from "../data/products.js";
import { IMAGES, FALLBACK_IMAGE } from "../data/products.js";

const CROP_ICONS = {
  "Manioc": "🌿", "Maïs": "🌽", "Riz": "🌾", "Tomate": "🍅",
  "Arachide": "🥜", "Huile de palme": "🫙", "Banane plantain": "🍌",
  "Poisson fumé": "🐟", "Igname": "🍠", "Haricot": "🫘",
};

function postCard(p) {
  const img = IMAGES[p.crop] || FALLBACK_IMAGE;
  const isVerified = p.verified;
  return `
  <article class="feed-card ${p.isNew ? 'feed-card--new' : ''}" data-post="${p.id}">
    <div class="feed-header">
      <div class="feed-avatar">${initials(p.seller)}</div>
      <div class="feed-meta">
        <strong>${esc(p.seller)} ${isVerified ? '<span class="feed-verified">✅</span>' : ''}</strong>
        <span>📍 ${esc(p.city)}, ${esc(p.province)} · ${esc(p.ago)}</span>
      </div>
      ${p.isNew ? '<span class="feed-new-badge">Nouveau</span>' : ''}
    </div>

    <div class="feed-body">
      <div class="feed-crop-line">
        <span class="feed-crop-icon">${CROP_ICONS[p.crop] || "🌱"}</span>
        <div>
          <strong class="feed-crop-name">${esc(p.crop)}</strong>
          <span class="feed-qty">${esc(p.qty)} disponibles</span>
        </div>
        <div class="feed-price-block">
          <strong>${fmtPrice(p.price)}</strong>
          <span>/ ${esc(p.unit)}</span>
        </div>
      </div>
      <img class="feed-img" src="${img}" alt="${esc(p.crop)}"
           onerror="this.src='${FALLBACK_IMAGE}'" loading="lazy">
    </div>

    <div class="feed-actions">
      <button class="feed-action-btn" data-like="${p.id}">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        <span class="like-count">${p.likes}</span> J'aime
      </button>
      <button class="feed-action-btn" data-comment="${p.id}">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        ${p.comments} Commentaires
      </button>
      <button class="feed-action-btn feed-action-contact" data-feed-contact="${p.id}">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 14a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 3.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"/></svg>
        Contacter
      </button>
    </div>
  </article>`;
}

export function feed() {
  clearNewFeedCount();

  const posts = feedPosts.length > 0 ? feedPosts : [];

  return shell(`
    <main class="feed-page">
      <div class="feed-topbar">
        <h1>🌾 Fil d'actualité</h1>
        <p>Les dernières publications de producteurs près de chez vous</p>
        <div class="feed-filters">
          <button class="feed-filter-btn active">Tous</button>
          <button class="feed-filter-btn">Kinshasa</button>
          <button class="feed-filter-btn">Kongo Central</button>
          <button class="feed-filter-btn">Haut-Katanga</button>
        </div>
      </div>

      <div class="feed-layout">
        <div class="feed-main" id="feedList">
          ${posts.length > 0
            ? posts.map(postCard).join("")
            : `<div class="feed-empty">
                <p>Aucune publication pour le moment.</p>
                <button class="btn primary" data-go="publish">Publiez la première offre →</button>
               </div>`
          }
        </div>

        <aside class="feed-sidebar">
          <div class="panel feed-widget">
            <h3>📊 En ce moment</h3>
            <div class="feed-stat-row"><span>Producteurs actifs</span><strong>47</strong></div>
            <div class="feed-stat-row"><span>Offres aujourd'hui</span><strong>${feedPosts.length + 12}</strong></div>
            <div class="feed-stat-row"><span>Réservations en cours</span><strong>23</strong></div>
            <div class="feed-stat-row"><span>Provinces couvertes</span><strong>14</strong></div>
          </div>
          <div class="panel feed-widget">
            <h3>🔥 Produits tendance</h3>
            <div class="feed-trend"><span>🍅 Tomate</span><span class="trend-up">↑ demande forte</span></div>
            <div class="feed-trend"><span>🌽 Maïs</span><span class="trend-down">↓ prix en baisse</span></div>
            <div class="feed-trend"><span>🐟 Poisson fumé</span><span class="trend-up">↑ hausse +6%</span></div>
            <div class="feed-trend"><span>🌿 Manioc</span><span>→ stable</span></div>
          </div>
          <div class="panel feed-widget">
            <h3>👤 Producteurs actifs</h3>
            ${["Mama Thérèse", "Coopérative Bidiku", "Ferme Kalenga", "Coopérative Lifumba"]
              .map((n) => `<div class="feed-producer">
                <span class="avatar" style="width:28px;height:28px;font-size:11px">${initials(n)}</span>
                <span>${esc(n)}</span>
                <span class="online-dot"></span>
              </div>`).join("")}
          </div>
        </aside>
      </div>
    </main>`, { bottom: true });
}
