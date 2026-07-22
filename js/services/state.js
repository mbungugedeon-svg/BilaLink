// js/services/state.js
export const state = {
  page: "landing",
  role: "acheteur",
  search: "",
  province: "Toutes",
  city: "Toutes",
  category: "Toutes",
  minPrice: "",
  maxPrice: "",
  availability: "Toutes",
  maxDistance: "Toutes",
  verifiedOnly: false,
  minRating: "0",
  sort: "recent",
  selectedId: 1,
  authed: false,
  currentUser: null,
  pendingPage: null,
  publishPreview: null,
  toasts: [],
  aiText: "",
  // Réservations envoyées (acheteur) et reçues (producteur) — chargées depuis le backend
  reservations: [],
  reservationsReceived: [],
  // Image sélectionnée lors de la publication (base64 ou url)
  publishPhotoData: null,
  // Conversations en mémoire : { conversationKey: [{role, text, time}] }
  conversations: {},
  activeConversationId: null,
  // Liste des conversations (résumé) chargée depuis le backend
  conversationList: [],
  // Notifications réelles chargées depuis le backend
  notifications: [],
  unreadNotifs: 0,
  // Mode du formulaire d'authentification : "register" (par défaut) ou "login"
  authMode: "register",
  // Dernier id de publication vu dans le fil (sert au badge "nouveau", basé sur le vrai catalogue)
  lastFeedVisitId: 0,
};

let onNavigate = () => {};
export function setNavigateHandler(fn) { onNavigate = fn; }

export function go(page) {
  if (page === "publish" && !state.authed) {
    state.pendingPage = "publish";
    state.page = "auth";
    onNavigate();
    toast("Connectez-vous pour publier une offre.");
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  if (page === "publish" && !canPublish()) {
    toast("Seuls les producteurs peuvent publier une offre.");
    return;
  }
  if (page === "dashboard" && !state.authed) {
    state.pendingPage = "dashboard";
    state.page = "auth";
    onNavigate();
    toast("Connectez-vous pour accéder à votre profil.");
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  state.page = page;
  onNavigate();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export const accountRole = () => state.currentUser?.role || state.role;
export const canPublish = () => state.authed && accountRole() === "producteur";

let renderToastHandler = () => {};
export function setToastRenderer(fn) { renderToastHandler = fn; }

export function toast(message) {
  state.toasts.push(message);
  renderToastHandler();
  setTimeout(() => {
    state.toasts.shift();
    renderToastHandler();
  }, 2800);
}
