// js/services/notifications.js
// Notifications RÉELLES : chargées depuis le backend (déclenchées par de
// vrais événements — réservation, confirmation, message). Interrogées
// périodiquement (polling) pour simuler le temps réel sans complexité
// de WebSocket, ce qui reste honnête : ce sont de vraies données.

import { state } from "./state.js";
import { api } from "./api.js";

export const notifHistory = []; // toujours peuplé depuis state.notifications, exposé pour notifPanel.js

let pollId = null;
let renderFn = null;

export function setNotifRenderer(fn) { renderFn = fn; }

export async function refreshNotifications() {
  if (!state.authed) return;
  try {
    const data = await api.get("/api/notifications");
    const previousLatestId = notifHistory[0]?.id;
    notifHistory.length = 0;
    data.notifications.forEach((n) => notifHistory.push(n));
    state.notifications = notifHistory;
    state.unreadNotifs = data.unread;

    const newest = notifHistory[0];
    if (newest && newest.id !== previousLatestId && renderFn) {
      renderFn(newest);
    }
  } catch (e) {
    console.warn("Notifications indisponibles :", e);
  }
}

export function startNotifPolling() {
  if (pollId) return;
  pollId = setInterval(refreshNotifications, 15000);
}

export function stopNotifPolling() {
  if (pollId) { clearInterval(pollId); pollId = null; }
}

export async function markAllRead() {
  if (!state.authed) return;
  try {
    await api.post("/api/notifications/read-all");
    notifHistory.forEach((n) => { n.read = true; });
    state.unreadNotifs = 0;
  } catch (e) {
    console.warn("Impossible de marquer les notifications comme lues :", e);
  }
}

export function unreadCount() { return state.unreadNotifs || 0; }
