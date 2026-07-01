// js/services/notifications.js
// Système de notifications simulées — donne l'impression d'un réseau actif.
// Les notifications apparaissent automatiquement toutes les 25-45 secondes.

import { state } from "./state.js";

const NOTIF_MESSAGES = [
  { icon: "🛒", text: "Restaurant Ndule vient de réserver 500 kg de Manioc.", type: "reservation" },
  { icon: "👁️", text: "Votre offre Tomate a été vue 12 fois ce matin.", type: "view" },
  { icon: "💬", text: "Grossiste Matadi vous a envoyé un message.", type: "message" },
  { icon: "✅", text: "Mama Thérèse a confirmé votre réservation de Manioc.", type: "confirm" },
  { icon: "🆕", text: "Nouvelle demande : 80 caisses de tomate à Kinshasa.", type: "request" },
  { icon: "📈", text: "Prix du Maïs en hausse de 3% cette semaine.", type: "price" },
  { icon: "🌾", text: "Coopérative Bidiku vient de publier une nouvelle offre.", type: "listing" },
  { icon: "🛒", text: "Jean-Marc K. a réservé votre stock d'Arachide.", type: "reservation" },
  { icon: "⭐", text: "Ferme Kalenga a reçu une note de 5 étoiles.", type: "rating" },
  { icon: "💬", text: "Restaurant Ndule : 'Pouvez-vous livrer demain matin ?'", type: "message" },
  { icon: "👁️", text: "Votre offre Riz a été consultée 28 fois aujourd'hui.", type: "view" },
  { icon: "✅", text: "Votre demande d'achat a reçu 3 nouvelles réponses.", type: "confirm" },
  { icon: "🆕", text: "Nouvel acheteur inscrit à Lubumbashi.", type: "request" },
  { icon: "📈", text: "Huile de palme : prix stable, forte demande à Boma.", type: "price" },
  { icon: "🛒", text: "Mama Béatrice a réservé 5 paniers de Poisson fumé.", type: "reservation" },
];

// Historique des notifications (persisté en mémoire)
export const notifHistory = [];
let notifIdCounter = 1;
let intervalId = null;
let renderFn = null;

export function setNotifRenderer(fn) { renderFn = fn; }

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

// Ajouter les notifications initiales (déjà "reçues")
export function seedInitialNotifs() {
  const seeds = [
    { icon: "🛒", text: "Restaurant Ndule a réservé 500 kg de Manioc.", type: "reservation", ago: "09:14" },
    { icon: "✅", text: "Mama Thérèse a confirmé une réservation.", type: "confirm", ago: "08:52" },
    { icon: "💬", text: "Grossiste Matadi vous a envoyé un message.", type: "message", ago: "08:30" },
    { icon: "📈", text: "Prix du Maïs en hausse de 3% cette semaine.", type: "price", ago: "07:00" },
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

let msgIdx = 0;
export function startNotifSimulation() {
  if (intervalId) return; // déjà lancé
  seedInitialNotifs();

  // Première notification après 20s (pour la démo)
  setTimeout(() => {
    const notif = NOTIF_MESSAGES[msgIdx % NOTIF_MESSAGES.length];
    msgIdx++;
    pushNotif(notif);

    // Puis toutes les 30-45s
    intervalId = setInterval(() => {
      const notif = NOTIF_MESSAGES[msgIdx % NOTIF_MESSAGES.length];
      msgIdx++;
      pushNotif(notif);
    }, 30000 + Math.random() * 15000);
  }, 20000);
}

export function stopNotifSimulation() {
  if (intervalId) { clearInterval(intervalId); intervalId = null; }
}

export function unreadCount() { return state.unreadNotifs || 0; }
