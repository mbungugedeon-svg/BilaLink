// js/components/navbar.js
import { state, canPublish, accountRole } from "../services/state.js";
import { icon, leafIcon } from "../utils/helpers.js";
import { i18n, getLang } from "../i18n.js";
import { initials, esc } from "../utils/format.js";
import { notifBell } from "./notifPanel.js";
import { newFeedCount } from "../services/feed.js";
import { unreadConversationCount } from "../services/marketplace.js";

export function shell(content, opts = {}) {
  const lang = getLang();
  const user = state.currentUser;
  const role = accountRole();
  const feedBadge = newFeedCount();
  const msgBadge = unreadConversationCount();

  const sessionBadge = state.authed
    ? `<div class="session-badge ${role === 'producteur' ? 'producer' : 'buyer'}">
        <span class="avatar-xs">${initials(user.name)}</span>
        <span>${esc(user.name.split(" ")[0])}</span>
        <span class="role-tag">${role === "producteur" ? "🌾 Producteur" : "🛒 Acheteur"}</span>
        <button class="btn-logout" id="logoutBtn">✕</button>
       </div>`
    : `<button class="btn soft compact" data-go="auth">${icon("user")} Se connecter</button>`;

  return `
    <div class="app-shell ${opts.bottom ? "with-bottom" : ""}">
      <header class="topbar" id="mainTopbar">
        <button class="brand" data-go="landing" aria-label="Home">
          <span class="brand-mark">${leafIcon()}</span>
          <span><strong>BilaLink</strong></span>
        </button>
        <nav class="desktop-nav">
          <button data-go="feed" class="nav-feed-btn ${state.page === 'feed' ? 'nav-active' : ''}">
            <span style="position:relative;display:inline-flex;align-items:center;gap:5px">
              ${icon("home")}
              ${feedBadge > 0 ? `<span class="feed-nav-badge">${feedBadge > 9 ? "9+" : feedBadge}</span>` : ""}
              Accueil
            </span>
          </button>
          <button data-go="catalogue" class="${state.page === 'catalogue' ? 'nav-active' : ''}">${i18n.navMarket()}</button>
          <button data-go="publish" class="${state.page === 'publish' ? 'nav-active' : ''}">${canPublish() ? i18n.navPublish() : "Publier"}</button>
          <button data-go="prices" class="${state.page === 'prices' ? 'nav-active' : ''}">${i18n.navPrices()}</button>
          <button data-go="dashboard" class="${state.page === 'dashboard' ? 'nav-active' : ''}">${i18n.navProfile ? i18n.navProfile() : "Profil"}</button>
        </nav>
        <div class="topbar-right">
          <button class="lang-toggle" data-lang="${lang === 'EN' ? 'FR' : 'EN'}">${lang === 'EN' ? '🇫🇷 FR' : '🇬🇧 EN'}</button>
          <button class="icon-btn messages-btn ${state.page === 'messages' ? 'nav-active' : ''}" data-go="messages" aria-label="Messages">
            ${icon("chat")}
            ${msgBadge > 0 ? `<span class="notif-badge">${msgBadge > 9 ? "9+" : msgBadge}</span>` : ""}
          </button>
          ${notifBell()}
          ${sessionBadge}
        </div>
      </header>
      <div id="notifMount"></div>
      ${content}
      ${opts.bottom ? bottomNav(feedBadge, msgBadge) : ""}
      <div id="toastStack" class="toast-stack"></div>
    </div>`;
}

export function bottomNav(feedBadge = 0, msgBadge = 0) {
  const count = feedBadge || newFeedCount();
  const messages = msgBadge || unreadConversationCount();
  return `<nav class="bottom-nav" id="bottomNav">
    <button class="${state.page === 'feed' || state.page === 'landing' ? 'active' : ''}" data-go="feed">
      <span style="position:relative;display:inline-flex;align-items:center;justify-content:center">
        ${icon("home")}
        ${count > 0 ? `<span class="feed-bottom-badge">${count > 9 ? "9+" : count}</span>` : ""}
      </span>
      <span>Accueil</span>
    </button>
    <button class="${state.page === 'catalogue' ? 'active' : ''}" data-go="catalogue">${icon("search")}<span>${i18n.navMarketShort()}</span></button>
    <button class="publish" data-go="publish">${icon("plus")}<span>${canPublish() ? i18n.navPublish() : "Publier"}</span></button>
    <button class="${state.page === 'messages' ? 'active' : ''}" data-go="messages">
      <span style="position:relative;display:inline-flex;align-items:center;justify-content:center">
        ${icon("chat")}
        ${messages > 0 ? `<span class="feed-bottom-badge">${messages > 9 ? "9+" : messages}</span>` : ""}
      </span>
      <span>Messages</span>
    </button>
    <button class="${state.page === 'dashboard' ? 'active' : ''}" data-go="dashboard">${icon("chart")}<span>${i18n.navProfile()}</span></button>
  </nav>`;
}
