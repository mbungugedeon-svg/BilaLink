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
