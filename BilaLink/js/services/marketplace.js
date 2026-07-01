// js/services/marketplace.js
import { listings, bumpListingId, buyerRequests, bumpRequestId } from "../data/products.js";
import { marketPrices } from "../data/prices.js";
import { catOf } from "../utils/helpers.js";
import { state, toast } from "./state.js";
import { i18n } from "../i18n.js";
import {
  saveAccountListings, getAccountListings,
  saveAccountReservationsSent, getAccountReservationsSent,
  saveAccountReservationsReceived, getAccountReservationsReceived,
  getAccounts, saveAccountMessages, getAccountMessages
} from "./accounts.js";

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
      && (state.availability === "Toutes" || l.available.toLowerCase().includes(state.availability.toLowerCase()))
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

export function reserveListing(id) {
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

  const listing = listings.find((l) => l.id === Number(id));
  if (!listing) return false;

  const buyerEmail = state.currentUser.email;
  const exists = state.reservations.some((r) => r.listingId === listing.id);
  if (exists) {
    toast("⚠️ Vous avez déjà réservé cette offre.");
    return false;
  }

  const reservation = {
    id: Date.now(),
    listingId: listing.id,
    crop: listing.crop,
    qty: listing.qty,
    price: listing.price,
    unit: listing.unit,
    sellerName: listing.seller,
    sellerPhone: listing.phone,
    sellerEmail: listing.sellerEmail || "",
    sellerProvince: listing.province,
    sellerCity: listing.city,
    buyerName: state.currentUser.name,
    buyerPhone: state.currentUser.phone,
    buyerEmail,
    buyerProvince: state.currentUser.province,
    status: "En attente de confirmation",
    date: new Date().toLocaleDateString("fr-FR"),
  };

  // Sauvegarder côté acheteur
  state.reservations.unshift(reservation);
  saveAccountReservationsSent(buyerEmail, state.reservations);

  // Sauvegarder côté producteur (en cherchant son email dans les listings)
  const sellerEmail = listing.sellerEmail;
  if (sellerEmail) {
    const received = getAccountReservationsReceived(sellerEmail);
    received.unshift(reservation);
    saveAccountReservationsReceived(sellerEmail, received);
  }

  // Aussi sauvegarder dans reservationsReceived global (accessible si producteur connecté)
  if (!state.reservationsReceived) state.reservationsReceived = [];
  // On stocke dans une clé globale accessible à tous les producteurs
  const globalKey = `bilalink_reservation_${reservation.id}`;
  try { localStorage.setItem(globalKey, JSON.stringify(reservation)); } catch {}

  toast(`✅ Réservation envoyée à ${listing.seller} !`);
  return true;
}

export function confirmReservation(reservationId) {
  // Mettre à jour côté producteur
  const r = state.reservationsReceived?.find((x) => x.id === reservationId)
         || state.reservations?.find((x) => x.id === reservationId);
  if (r) {
    r.status = "Confirmée ✅";
    if (state.currentUser?.role === "producteur") {
      saveAccountReservationsReceived(state.currentUser.email, state.reservationsReceived || []);
    }
    // Mettre à jour aussi dans localStorage global
    try {
      const stored = JSON.parse(localStorage.getItem(`bilalink_reservation_${reservationId}`) || "{}");
      stored.status = "Confirmée ✅";
      localStorage.setItem(`bilalink_reservation_${reservationId}`, JSON.stringify(stored));
      // Synchroniser côté acheteur
      if (stored.buyerEmail) {
        const sent = getAccountReservationsSent(stored.buyerEmail);
        const idx = sent.findIndex((x) => x.id === reservationId);
        if (idx >= 0) { sent[idx].status = "Confirmée ✅"; saveAccountReservationsSent(stored.buyerEmail, sent); }
      }
    } catch {}
    toast(`✅ Réservation confirmée ! L'acheteur en sera informé.`);
  }
}

export function rejectReservation(reservationId) {
  const r = state.reservationsReceived?.find((x) => x.id === reservationId)
         || state.reservations?.find((x) => x.id === reservationId);
  if (r) {
    r.status = "Refusée ❌";
    if (state.currentUser?.role === "producteur") {
      saveAccountReservationsReceived(state.currentUser.email, state.reservationsReceived || []);
    }
    try {
      const stored = JSON.parse(localStorage.getItem(`bilalink_reservation_${reservationId}`) || "{}");
      stored.status = "Refusée ❌";
      localStorage.setItem(`bilalink_reservation_${reservationId}`, JSON.stringify(stored));
      if (stored.buyerEmail) {
        const sent = getAccountReservationsSent(stored.buyerEmail);
        const idx = sent.findIndex((x) => x.id === reservationId);
        if (idx >= 0) { sent[idx].status = "Refusée ❌"; saveAccountReservationsSent(stored.buyerEmail, sent); }
      }
    } catch {}
    toast("Réservation refusée.");
  }
}

export function publishListing(fields) {
  const listing = {
    id: bumpListingId(),
    crop: fields.crop,
    qty: fields.qty || "Stock disponible",
    price: Number(fields.price || 0),
    unit: fields.unit || "unité",
    province: fields.province,
    city: fields.city || fields.province,
    distance: Math.floor(Math.random() * 120) + 8,
    seller: state.currentUser?.name || "Nouveau producteur",
    phone: state.currentUser?.phone || "+243 990 000 000",
    sellerEmail: state.currentUser?.email || "",
    rating: 5.0,
    sales: 0,
    available: fields.availableNow ? "Disponible maintenant" : "Sur rendez-vous",
    verified: true,
    views: 0,
    whatsapp: 0,
    calls: 0,
    published: new Date().toLocaleDateString("fr-FR"),
    quality: fields.quality,
    delivery: fields.delivery,
    negotiable: fields.negotiable,
    desc: fields.desc || "Produit local disponible pour vente directe.",
    // Photo uploadée par le producteur (base64)
    customPhoto: fields.customPhoto || null,
  };
  listings.unshift(listing);

  // Persister dans le compte producteur
  if (state.currentUser?.email) {
    const myListings = getAccountListings(state.currentUser.email);
    myListings.unshift(listing);
    saveAccountListings(state.currentUser.email, myListings);
  }

  return listing;
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

// --- Messagerie ---
export function getConversationKey(otherEmail, listingId) {
  return `conv_${listingId}_${[state.currentUser?.email, otherEmail].sort().join("_")}`;
}

export function getMessages(conversationKey) {
  if (!state.currentUser) return [];
  const allConvs = getAccountMessages(state.currentUser.email);
  return allConvs[conversationKey] || [];
}

export function sendMessage(conversationKey, text, meta = {}) {
  if (!state.currentUser || !text.trim()) return;
  const msg = {
    id: Date.now(),
    senderEmail: state.currentUser.email,
    senderName: state.currentUser.name,
    text: text.trim(),
    time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
  };

  // Sauvegarder dans les messages du compte courant
  const myConvs = getAccountMessages(state.currentUser.email);
  if (!myConvs[conversationKey]) myConvs[conversationKey] = [];
  myConvs[conversationKey].unshift(msg);
  saveAccountMessages(state.currentUser.email, myConvs);

  // Sauvegarder aussi dans le compte de l'autre partie si son email est connu
  if (meta.otherEmail) {
    const otherConvs = getAccountMessages(meta.otherEmail);
    if (!otherConvs[conversationKey]) otherConvs[conversationKey] = [];
    otherConvs[conversationKey].unshift(msg);
    saveAccountMessages(meta.otherEmail, otherConvs);
  }

  // Mettre à jour state
  if (!state.conversations) state.conversations = {};
  if (!state.conversations[conversationKey]) state.conversations[conversationKey] = [];
  state.conversations[conversationKey].unshift(msg);

  return msg;
}
