// js/services/accounts.js
// Gestion multi-comptes persistants via localStorage
// Chaque compte = { email, password, name, phone, province, city, role }
// + ses publications et réservations sont liées à l'email

const STORAGE_KEY = "bilalink_accounts";
const SESSION_KEY = "bilalink_session";

export function getAccounts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch { return {}; }
}

function saveAccounts(accounts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

export function registerOrLogin(fields) {
  const accounts = getAccounts();
  const email = (fields.email || fields.phone).toLowerCase().trim();

  if (!email) return { error: "Email ou téléphone requis." };

  if (accounts[email]) {
    // Compte existant : vérifier le mot de passe
    if (accounts[email].password !== fields.password) {
      return { error: "Mot de passe incorrect." };
    }
    // Connexion réussie — on conserve le profil stocké, pas les champs du formulaire
    return { account: accounts[email], isNew: false };
  } else {
    // Nouveau compte
    const account = {
      email,
      password: fields.password,
      name: fields.name || "Utilisateur BilaLink",
      phone: fields.phone || email,
      province: fields.province || "Kinshasa",
      city: fields.city || "Kinshasa",
      role: fields.role || "acheteur",
      createdAt: Date.now(),
    };
    accounts[email] = account;
    saveAccounts(accounts);
    return { account, isNew: true };
  }
}

export function saveSession(email) {
  localStorage.setItem(SESSION_KEY, email);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSavedSession() {
  return localStorage.getItem(SESSION_KEY);
}

// Données liées au compte : publications et réservations
const DATA_KEY = (email, type) => `bilalink_${type}_${email}`;

export function getAccountListings(email) {
  try { return JSON.parse(localStorage.getItem(DATA_KEY(email, "listings")) || "[]"); } catch { return []; }
}
export function saveAccountListings(email, listings) {
  localStorage.setItem(DATA_KEY(email, "listings"), JSON.stringify(listings));
}

export function getAccountReservationsSent(email) {
  try { return JSON.parse(localStorage.getItem(DATA_KEY(email, "reservations_sent")) || "[]"); } catch { return []; }
}
export function saveAccountReservationsSent(email, list) {
  localStorage.setItem(DATA_KEY(email, "reservations_sent"), JSON.stringify(list));
}

export function getAccountReservationsReceived(email) {
  try { return JSON.parse(localStorage.getItem(DATA_KEY(email, "reservations_received")) || "[]"); } catch { return []; }
}
export function saveAccountReservationsReceived(email, list) {
  localStorage.setItem(DATA_KEY(email, "reservations_received"), JSON.stringify(list));
}

export function getAccountMessages(email) {
  try { return JSON.parse(localStorage.getItem(DATA_KEY(email, "messages")) || "{}"); } catch { return {}; }
}
export function saveAccountMessages(email, messages) {
  localStorage.setItem(DATA_KEY(email, "messages"), JSON.stringify(messages));
}
