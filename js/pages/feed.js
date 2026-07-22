// js/pages/feed.js
// Fil d'actualité — vraies publications du catalogue, pas un réseau social :
// pas de likes, pas de commentaires. On vient ici pour voir l'offre et agir
// (appeler, réserver, discuter), pas pour "aimer" une publication.
import { shell } from "../components/navbar.js";
import { fmtPrice, initials, esc } from "../utils/format.js";
import { feedPosts, clearNewFeedCount } from "../services/feed.js";
import { state } from "../services/state.js";
import { IMAGES, FALLBACK_IMAGE } from "../data/products.js";

const CROP_ICONS = {
  "Manioc": "🌿", "Maïs": "🌽", "Riz": "🌾", "Tomate": "🍅",
  "Arachide": "🥜", "Huile de palme": "🫙", "Banane plantain": "🍌",
  "Poisson fumé": "🐟", "Igname": "🍠", "Haricot": "🫘",
};

function postCard(p) {
  const img = p.customPhoto || IMAGES[p.crop] || FALLBACK_IMAGE;
  return `
  <article class="feed-card ${p.isNew ? 'feed-card--new' : ''}" data-detail="${p.id}">
    <div class="feed-header">
      <div class="feed-avatar">${initials(p.seller)}</div>
      <div class="feed-meta">
        <strong>${esc(p.seller)} ${p.verified ? '<span class="feed-verified">✅</span>' : ''}</strong>
        <span>📍 ${esc(p.city || "")}, ${esc(p.province)} · ${esc(p.ago)}</span>
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
      <button class="btn soft compact" data-contact="${p.id}">Voir l'offre →</button>
      <button class="btn primary compact" data-reserve="${p.id}">Réserver</button>
    </div>
  </article>`;
}

export function feed() {
  const posts = feedPosts();
  clearNewFeedCount();

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
            <div class="feed-stat-row"><span>Offres publiées</span><strong>${posts.length}</strong></div>
            <div class="feed-stat-row"><span>Producteurs vérifiés</span><strong>${posts.filter(p => p.verified).length}</strong></div>
          </div>
        </aside>
      </div>
    </main>`, { bottom: true });
}
