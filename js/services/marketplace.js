// js/services/marketplace.js
import { listings, buyerRequests, bumpRequestId } from "../data/products.js";
import { marketPrices } from "../data/prices.js";
import { catOf } from "../utils/helpers.js";
import { state, toast } from "./state.js";
import { i18n } from "../i18n.js";
import { api } from "./api.js";

// --- Catalogue : recharge depuis le backend et remplace le tableau en mémoire ---
export async function refreshListings() {
  const data = await api.get("/api/listings");
  listings.length = 0;
  data.listings.forEach((l) => listings.push(l));
}

export function filteredListings() {
  const q = state.search.trim().toLowerCase();
  const out = listings.filter((l) => {
    const hay = `${l.crop} ${l.city} ${l.province} ${l.seller}`.toLowerCase();
    const smart = !q || hay.includes(q) || l.crop.toLowerCase().startsWith(q);
    return smart
      && (state.province === "Toutes" || l.province === state.province)
      && (state.city === "Toutes" || l.city === state.city)
      && (state.category === "Toutes" || catOf(l.crop) === state.category)
      && (!state.minPrice || l.price >= Number(state.minPrice))
      && (!state.maxPrice || l.price <= Number(state.maxPrice))
      && (state.availability === "Toutes" || (l.available || "").toLowerCase().includes(state.availability.toLowerCase()))
      && (state.maxDistance === "Toutes" || l.distance <= Number(state.maxDistance))
      && (!state.verifiedOnly || l.verified)
      && (Number(l.rating) >= Number(state.minRating));
  });

  return out.sort((a, b) => {
    if (state.sort === "priceAsc") return a.price - b.price;
    if (state.sort === "priceDesc") return b.price - a.price;
    if (state.sort === "near") return a.distance - b.distance;
    if (state.sort === "rated") return b.rating - a.rating;
    return b.id - a.id;
  });
}

export function hasAdvancedFilters() {
  return state.province !== "Toutes" || state.city !== "Toutes" || state.category !== "Toutes"
    || state.minPrice || state.maxPrice || state.verifiedOnly || state.sort !== "recent";
}

export function marketTone(listing) {
  const m = marketPrices.find((x) => x.crop === listing.crop);
  if (!m) return { cls: "fair", text: i18n.toneComp() };
  if (listing.price < m.avg * 0.94) return { cls: "low",  text: i18n.toneLow() };
  if (listing.price > m.avg * 1.08) return { cls: "high", text: i18n.toneHigh() };
  return { cls: "fair", text: i18n.toneFair() };
}

// --- Réservations (backend réel) ---
export async function reserveListing(id) {
  if (!state.authed) {
    state.pendingPage = "detail";
    state.page = "auth";
    toast("Connectez-vous pour réserver une offre.");
    return false;
  }
  if (state.currentUser?.role === "producteur") {
    toast("Les producteurs ne peuvent pas réserver. Basculez vers un compte acheteur.");
    return false;
  }

  try {
    const data = await api.post("/api/reservations", { listingId: Number(id) });
    state.reservations.unshift(data.reservation);
    toast(`✅ Réservation envoyée à ${data.reservation.sellerName} !`);
    return true;
  } catch (e) {
    toast("⚠️ " + e.message);
    return false;
  }
}

export async function confirmReservation(reservationId) {
  try {
    const data = await api.post(`/api/reservations/${reservationId}/confirm`);
    applyReservationUpdate(data.reservation);
    toast("✅ Réservation confirmée ! L'acheteur en sera informé.");
  } catch (e) {
    toast("⚠️ " + e.message);
  }
}

export async function rejectReservation(reservationId) {
  try {
    const data = await api.post(`/api/reservations/${reservationId}/reject`);
    applyReservationUpdate(data.reservation);
    toast("Réservation refusée.");
  } catch (e) {
    toast("⚠️ " + e.message);
  }
}

function applyReservationUpdate(updated) {
  [state.reservations, state.reservationsReceived].forEach((list) => {
    const idx = (list || []).findIndex((r) => r.id === updated.id);
    if (idx >= 0) list[idx] = updated;
  });
}

// --- Publication (backend réel) ---
export async function publishListing(fields) {
  const data = await api.post("/api/listings", {
    crop: fields.crop,
    qty: fields.qty,
    price: fields.price,
    unit: fields.unit,
    province: fields.province,
    city: fields.city,
    availableNow: !!fields.availableNow,
    delivery: fields.delivery,
    negotiable: !!fields.negotiable,
    quality: fields.quality,
    desc: fields.desc,
    customPhoto: fields.customPhoto,
  });
  listings.unshift(data.listing);
  return data.listing;
}

export function publishBuyerRequest(fields) {
  const request = {
    id: bumpRequestId(),
    title: fields.title,
    budget: fields.budget,
    province: fields.province,
    date: fields.date,
    buyer: state.currentUser?.name || "Acheteur connecté",
    buyerEmail: state.currentUser?.email || "",
    replies: 0,
  };
  buyerRequests.unshift(request);
  return request;
}

// --- Messagerie (backend réel, entre deux vrais comptes) ---
export function getConversationKey(otherUserId, listingId) {
  const myId = state.currentUser?.id;
  const ids = [myId, otherUserId].sort((a, b) => a - b);
  return `conv_${listingId}_${ids[0]}_${ids[1]}`;
}

export function otherUserIdFromKey(conversationKey) {
  const parts = conversationKey.split("_"); // conv_{listingId}_{idA}_{idB}
  const ids = [Number(parts[2]), Number(parts[3])];
  return ids.find((id) => id !== state.currentUser?.id);
}

export function listingIdFromKey(conversationKey) {
  return Number(conversationKey.split("_")[1]);
}

export async function loadConversation(conversationKey) {
  const data = await api.get(`/api/messages/${encodeURIComponent(conversationKey)}`);
  state.conversations[conversationKey] = data.messages;
  // La lecture côté serveur vient de marquer ces messages comme lus :
  // on rafraîchit la liste pour que le badge "Messages" se mette à jour.
  try {
    const convs = await api.get("/api/conversations");
    state.conversationList = convs.conversations;
  } catch { /* non bloquant */ }
  return data.messages;
}

// Nombre de conversations ayant un dernier message non lu envoyé par l'autre
// partie (utilisé pour le badge de l'icône Messages dans la navbar).
export function unreadConversationCount() {
  if (!state.authed) return 0;
  return (state.conversationList || []).filter(
    (c) => c.lastMessage && c.lastMessage.receiverId === state.currentUser?.id && !c.lastMessage.read
  ).length;
}

// Recharge la liste des conversations depuis le serveur. À appeler à chaque
// arrivée sur la page Messages : sinon un utilisateur qui n'a fait qu'ouvrir
// l'app (sans envoyer/lire de message lui-même) verrait une liste périmée
// et ne verrait pas les messages reçus entre-temps d'un autre compte.
export async function refreshConversationList() {
  if (!state.authed) return;
  try {
    const convs = await api.get("/api/conversations");
    state.conversationList = convs.conversations;
  } catch (e) {
    console.warn("Liste des conversations indisponible :", e);
  }
}

export async function sendMessage(conversationKey, text, { receiverId, listingId } = {}) {
  if (!state.currentUser || !text.trim()) return;
  try {
    const data = await api.post("/api/messages", {
      conversationKey, text: text.trim(), receiverId, listingId,
    });
    if (!state.conversations[conversationKey]) state.conversations[conversationKey] = [];
    state.conversations[conversationKey].unshift(data.message);
    // Rafraîchir la liste des conversations (pour les tableaux de bord)
    try {
      const convs = await api.get("/api/conversations");
      state.conversationList = convs.conversations;
    } catch { /* non bloquant */ }
    return data.message;
  } catch (e) {
    toast("⚠️ " + e.message);
  }
}
