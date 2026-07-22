// js/services/accounts.js
// Couche d'accès aux comptes utilisateurs — appelle désormais le vrai
// backend Flask (base de données) au lieu de localStorage.
// Les fonctions ci-dessous gardent des noms proches de l'ancienne version
// pour limiter les changements ailleurs dans l'app, mais sont maintenant
// asynchrones et parlent réellement au serveur.

import { api } from "./api.js";

export async function apiRegister(fields) {
  try {
    const data = await api.post("/api/auth/register", fields);
    return { account: data.user, isNew: true };
  } catch (e) {
    return { error: e.message };
  }
}

export async function apiLogin(fields) {
  try {
    const data = await api.post("/api/auth/login", fields);
    return { account: data.user, isNew: false };
  } catch (e) {
    return { error: e.message };
  }
}

export async function apiLogout() {
  try { await api.post("/api/auth/logout"); } catch { /* ignore */ }
}

export async function fetchCurrentUser() {
  try {
    const data = await api.get("/api/auth/me");
    return data.user || null;
  } catch {
    return null;
  }
}
