// js/services/auth.js
import { state, go, toast } from "./state.js";
import {
  registerOrLogin, saveSession, clearSession,
  getAccountListings, getAccountReservationsSent, getAccountReservationsReceived
} from "./accounts.js";
import { listings } from "../data/products.js";

export function login(fields) {
  const result = registerOrLogin(fields);

  if (result.error) {
    toast("❌ " + result.error);
    return;
  }

  const { account, isNew } = result;

  state.authed = true;
  state.role = account.role;
  state.currentUser = {
    email: account.email,
    name: account.name,
    phone: account.phone,
    province: account.province,
    city: account.city,
    role: account.role,
  };

  // Charger les données persistées du compte
  const myListings = getAccountListings(account.email);
  // Injecter les publications du compte dans le catalogue global (sans doublons)
  myListings.forEach((l) => {
    if (!listings.find((x) => x.id === l.id)) {
      listings.unshift(l);
    }
  });

  // Charger réservations
  state.reservations = getAccountReservationsSent(account.email);
  state.reservationsReceived = getAccountReservationsReceived(account.email);

  saveSession(account.email);

  const roleLabel = account.role === "producteur" ? "🌾 Producteur" : "🛒 Acheteur";
  toast(isNew
    ? `✅ Compte créé · ${roleLabel} · ${account.name}`
    : `✅ Bienvenue · ${roleLabel} · ${account.name}`
  );

  const next = state.pendingPage || (account.role === "producteur" ? "catalogue" : "catalogue");
  state.pendingPage = null;

  if (next === "publish" && account.role !== "producteur") {
    toast("La publication est réservée aux comptes producteurs.");
    go("catalogue");
    return;
  }
  go(next);
}

export function logout() {
  clearSession();
  state.authed = false;
  state.currentUser = null;
  state.role = "acheteur";
  state.pendingPage = null;
  state.reservations = [];
  state.reservationsReceived = [];
  toast("Vous êtes déconnecté.");
}
