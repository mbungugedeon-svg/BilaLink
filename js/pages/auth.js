// js/pages/auth.js
import { shell } from "../components/navbar.js";
import { leafIcon } from "../utils/helpers.js";
import { state } from "../services/state.js";
import { PROVINCES } from "../data/provinces.js";
import { i18n } from "../i18n.js";
import { esc } from "../utils/format.js";

export function auth() {
  const isPubFlow = state.pendingPage === "publish";
  const defaultRole = isPubFlow ? "producteur" : "acheteur";
  const mode = state.authMode === "login" ? "login" : "register";

  return shell(`
    <main class="auth">
      <form id="authForm" class="auth-card">
        <div class="brand-mark big">${leafIcon()}</div>
        <h1>${mode === "login" ? "Connexion" : i18n.authWelcome()}</h1>
        <p>${isPubFlow && mode === "register"
          ? "Créez un compte <strong>Producteur</strong> pour publier vos offres."
          : mode === "login"
            ? "Connectez-vous avec votre téléphone/email et votre mot de passe."
            : "Créez votre compte pour accéder à toutes les fonctionnalités BilaLink."
        }</p>

        <div class="auth-mode-toggle" style="display:flex;gap:8px;margin-bottom:16px">
          <button type="button" class="btn ${mode === "register" ? "primary" : "soft"} compact" data-auth-mode="register" style="flex:1">Créer un compte</button>
          <button type="button" class="btn ${mode === "login" ? "primary" : "soft"} compact" data-auth-mode="login" style="flex:1">J'ai déjà un compte</button>
        </div>

        ${mode === "register" ? `
        <div class="auth-role-select">
          <label class="role-card ${defaultRole === 'acheteur' ? 'selected' : ''}">
            <input type="radio" name="role" value="acheteur" ${defaultRole === 'acheteur' ? 'checked' : ''}>
            <span class="role-icon">🛒</span>
            <strong>Acheteur</strong>
            <small>Je cherche des produits agricoles</small>
          </label>
          <label class="role-card ${defaultRole === 'producteur' ? 'selected' : ''}">
            <input type="radio" name="role" value="producteur" ${defaultRole === 'producteur' ? 'checked' : ''}>
            <span class="role-icon">🌾</span>
            <strong>Producteur</strong>
            <small>Je vends ma production agricole</small>
          </label>
        </div>
        <div class="form-grid two-col">
          <input name="name" placeholder="Votre nom complet" required>
          <input name="phone" placeholder="+243 9XX XXX XXX" required>
        </div>
        <input name="email" type="email" placeholder="Email (optionnel)">
        <div class="auth-location">
          <select name="province">${PROVINCES.map((p) => `<option ${p === "Kinshasa" ? "selected" : ""}>${p}</option>`).join("")}</select>
          <input name="city" placeholder="Ville" value="Kinshasa">
        </div>
        ` : `
        <input name="phone" placeholder="Téléphone ou email" required autocomplete="username">
        `}
        <input name="password" type="password" placeholder="Mot de passe" required autocomplete="${mode === "login" ? "current-password" : "new-password"}">
        <button class="btn primary wide" type="submit">${mode === "login" ? "🔓 Se connecter" : "✅ " + i18n.authContinue()}</button>
        <button type="button" class="btn ghost wide" data-go="catalogue">Continuer sans compte →</button>
      </form>
    </main>`);
}
