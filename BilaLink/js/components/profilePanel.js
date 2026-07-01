// js/components/profilePanel.js
import { initials, esc } from "../utils/format.js";
import { icon } from "../utils/helpers.js";
import { state, accountRole, canPublish } from "../services/state.js";
import { t } from "../i18n.js";

export function profilePanel(user) {
  return `<section class="profile-card">
    <div class="profile-main">
      <span class="avatar profile-avatar">${initials(user.name)}</span>
      <div>
        <h2>${esc(user.name)}</h2>
        <p>${state.authed ? t("Connected account","Compte connecté") : t("Guest account","Compte invité")} · ${accountRole() === "producteur" ? t("Supplier","Producteur") : t("Buyer","Acheteur")}</p>
        <div class="profile-badges">
          <span>${icon("shield")} ${t("Verified Phone","Téléphone vérifié")}</span>
          <span>${icon("star")} ${t("Identity pending","Identité à compléter")}</span>
        </div>
      </div>
    </div>
    <div class="profile-info">
      <div><span>${t("Phone","Téléphone")}</span><strong>${esc(user.phone)}</strong></div>
      <div><span>${t("Email","E-mail")}</span><strong>${esc(user.email)}</strong></div>
      <div><span>${t("Province","Province")}</span><strong>${esc(user.province)}</strong></div>
      <div><span>${t("City","Ville")}</span><strong>${esc(user.city)}</strong></div>
    </div>
    <div class="profile-actions">
      ${state.authed
        ? `<button class="btn ghost" id="logoutBtnProfile">${t("Log out","Se déconnecter")}</button>`
        : `<button class="btn primary" data-go="auth">${t("Sign in","Se connecter")}</button>`}
      ${canPublish()
        ? `<button class="btn soft" data-go="publish">${icon("plus")} ${t("List Product","Publier")}</button>`
        : `<button class="btn soft" data-go="requests">${t("Post a Request","Publier une demande")}</button>`}
    </div>
  </section>`;
}

export function inboxPanel(conversations) {
  return `<section class="panel inbox">
    <div class="panel-head"><h2>${t("In-App Messaging","Discussion dans l'application")}</h2><button class="btn soft" id="newMessageBtn">${t("New Message","Nouveau message")}</button></div>
    <div class="inbox-grid">
      <div class="conversation-list">
        ${conversations.map((c) => `<button class="conversation" data-chat="${c.id}">
          <span class="avatar">${initials(c.with)}</span>
          <span><strong>${esc(c.with)}</strong><small>${esc(c.role)} · ${esc(c.product)}</small></span>
          ${c.unread ? `<b>${c.unread}</b>` : ""}
        </button>`).join("")}
      </div>
      <div class="chat-box">
        <div class="bubble other">${t("Hello, I'm interested in your listing. How much stock is available?","Bonjour, je suis intéressé par votre offre. Quelle quantité reste disponible ?")}</div>
        <div class="bubble me">${t("Hello, the stock is available. We can discuss the price here before WhatsApp.","Bonjour, le stock est disponible. Nous pouvons discuter du prix ici avant WhatsApp.")}</div>
        <div class="chat-input"><input id="messageInput" placeholder="${t("Write a message...","Écrire un message...")}"><button class="btn primary" id="sendMessageBtn">${t("Send","Envoyer")}</button></div>
      </div>
    </div>
  </section>`;
}
