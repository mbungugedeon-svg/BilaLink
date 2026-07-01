// js/services/notifications.js
// Notifications pertinentes pour l'utilisateur : nouvelles offres dans sa
// province, nouvelles demandes d'achat si producteur, messages, réservations.

import { state } from "./state.js";
import { accountRole } from "./state.js";

// Banques de messages selon le rôle de l'utilisateur connecté
const NOTIF_BUYER = [
  { icon: "🌾", text: (p) => `Nouvelle offre de Manioc publiée à ${p}.`, type: "listing" },
  { icon: "🌾", text: (p) => `Une nouvelle production agricole vient d'être ajoutée près de ${p}.`, type: "listing" },
  { icon: "📈", text: () => "Le prix du Maïs a baissé de 4% cette semaine.", type: "price" },
  { icon: "💬", text: () => "Un vendeur a répondu à votre message.", type: "message" },
  { icon: "✅", text: () => "Votre réservation a été confirmée par le vendeur.", type: "confirm" },
];

const NOTIF_SELLER = [
  { icon: "🛒", text: (p) => `Nouvelle demande d'achat publiée à ${p}.`, type: "request" },
  { icon: "💬", text: () => "Un acheteur vous a envoyé un message.", type: "message" },
  { icon: "✅", text: () => "Un acheteur a réservé une partie de votre stock.", type: "reservation" },
  { icon: "📈", text: () => "Les prix du marché ont été mis à jour pour vos produits.", type: "price" },
];

// Historique des notifications (persisté en mémoire)
export const notifHistory = [];
let notifIdCounter = 1;
let intervalId = null;
let renderFn = null;

export function setNotifRenderer(fn) { renderFn = fn; }

function userProvince() {
  return state.currentUser?.province || "votre région";
}

function pickNotif() {
  const isSeller = accountRole() === "producteur";
  const bank = isSeller ? NOTIF_SELLER : NOTIF_BUYER;
  const item = bank[Math.floor(Math.random() * bank.length)];
  return { icon: item.icon, text: item.text(userProvince()), type: item.type };
}

function pushNotif(notif) {
  const entry = {
    id: notifIdCounter++,
    icon: notif.icon,
    text: notif.text,
    type: notif.type,
    time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    read: false,
  };
  notifHistory.unshift(entry);
  if (notifHistory.length > 30) notifHistory.pop();
  state.unreadNotifs = (state.unreadNotifs || 0) + 1;
  if (renderFn) renderFn(entry);
}

// Ajouter les notifications initiales (déjà "reçues"), adaptées au rôle
export function seedInitialNotifs() {
  const isSeller = accountRole() === "producteur";
  const p = userProvince();
  const seeds = isSeller
    ? [
        { icon: "🛒", text: `Nouvelle demande d'achat publiée à ${p}.`, type: "request", ago: "09:14" },
        { icon: "✅", text: "Un acheteur a confirmé une réservation.", type: "reservation", ago: "08:52" },
        { icon: "💬", text: "Un acheteur vous a envoyé un message.", type: "message", ago: "08:30" },
      ]
    : [
        { icon: "🌾", text: `Nouvelle offre publiée à ${p}.`, type: "listing", ago: "09:14" },
        { icon: "📈", text: "Prix du Maïs en baisse de 3% cette semaine.", type: "price", ago: "08:30" },
        { icon: "💬", text: "Un vendeur a répondu à votre message.", type: "message", ago: "07:00" },
      ];
  seeds.forEach((s, i) => {
    notifHistory.push({ id: notifIdCounter++, ...s, time: s.ago, read: i > 0 });
  });
  state.unreadNotifs = 1;
}

export function markAllRead() {
  notifHistory.forEach((n) => { n.read = true; });
  state.unreadNotifs = 0;
  if (renderFn) renderFn(null);
}

export function startNotifSimulation() {
  if (intervalId) return; // déjà lancé
  seedInitialNotifs();

  // Première notification après 20s (pour la démo)
  setTimeout(() => {
    pushNotif(pickNotif());

    // Puis toutes les 30-45s
    intervalId = setInterval(() => {
      pushNotif(pickNotif());
    }, 30000 + Math.random() * 15000);
  }, 20000);
}

export function stopNotifSimulation() {
  if (intervalId) { clearInterval(intervalId); intervalId = null; }
}

export function unreadCount() { return state.unreadNotifs || 0; }
