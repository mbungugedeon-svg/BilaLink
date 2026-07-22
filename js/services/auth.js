// js/services/auth.js
import { state, go, toast } from "./state.js";
import { apiRegister, apiLogin, apiLogout, fetchCurrentUser } from "./accounts.js";
import { refreshListings } from "./marketplace.js";
import { api } from "./api.js";

function setCurrentUser(user) {
  state.authed = true;
  state.role = user.role;
  state.currentUser = user; // { id, email, phone, name, province, city, role }
}

// Charge tout ce dont l'utilisateur connecté a besoin : catalogue, réservations,
// conversations, notifications. Appelé après login ET après restauration de session.
export async function loadUserData() {
  await refreshListings();
  try {
    const [sent, received, convs, notifs] = await Promise.all([
      api.get("/api/reservations?type=sent"),
      api.get("/api/reservations?type=received"),
      api.get("/api/conversations"),
      api.get("/api/notifications"),
    ]);
    state.reservations = sent.reservations;
    state.reservationsReceived = received.reservations;
    state.conversationList = convs.conversations;
    state.notifications = notifs.notifications;
    state.unreadNotifs = notifs.unread;
  } catch (e) {
    console.warn("Chargement des données utilisateur incomplet :", e);
  }
}

export async function restoreSession() {
  const user = await fetchCurrentUser();
  if (!user) return;
  setCurrentUser(user);
  await loadUserData();
}

// mode: "register" ou "login"
export async function login(fields, mode = "register") {
  const result = mode === "login" ? await apiLogin(fields) : await apiRegister(fields);

  if (result.error) {
    toast("❌ " + result.error);
    return;
  }

  const { account, isNew } = result;
  setCurrentUser(account);
  await loadUserData();

  const roleLabel = account.role === "producteur" ? "🌾 Producteur" : "🛒 Acheteur";
  toast(isNew
    ? `✅ Compte créé · ${roleLabel} · ${account.name}`
    : `✅ Bienvenue · ${roleLabel} · ${account.name}`
  );

  const next = state.pendingPage || "catalogue";
  state.pendingPage = null;

  if (next === "publish" && account.role !== "producteur") {
    toast("La publication est réservée aux comptes producteurs.");
    go("catalogue");
    return;
  }
  go(next);
}

export async function logout() {
  await apiLogout();
  state.authed = false;
  state.currentUser = null;
  state.role = "acheteur";
  state.pendingPage = null;
  state.reservations = [];
  state.reservationsReceived = [];
  state.conversationList = [];
  state.notifications = [];
  state.unreadNotifs = 0;
  state.conversations = {};
  toast("Vous êtes déconnecté.");
}
