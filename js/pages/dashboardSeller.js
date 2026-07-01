// js/pages/dashboardSeller.js
import { shell } from "../components/navbar.js";
import { profilePanel } from "../components/profilePanel.js";
import { metric } from "../components/formFields.js";
import { fmtPrice, esc, initials } from "../utils/format.js";
import { state } from "../services/state.js";
import { listings } from "../data/products.js";
import { t } from "../i18n.js";
import { getAccountListings, getAccountReservationsReceived, getAccountMessages } from "../services/accounts.js";

export function dashboardSeller() {
  const user = state.currentUser || { name: "BilaLink Guest", phone: "—", province: "Kinshasa", city: "Kinshasa", email: "—" };

  // Publications du producteur connecté
  const myListings = getAccountListings(user.email);
  const displayListings = myListings.length > 0 ? myListings : listings.slice(0, 4);

  // Réservations reçues (depuis localStorage)
  const received = getAccountReservationsReceived(user.email);
  // Fusionner avec les réservations globales (envoyées vers ce producteur)
  const globalKeys = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("bilalink_reservation_")) {
        const r = JSON.parse(localStorage.getItem(k) || "{}");
        if (r.sellerEmail === user.email || r.sellerName === user.name) {
          globalKeys.push(r);
        }
      }
    }
  } catch {}
  // Fusionner sans doublons
  const allReceived = [...received];
  globalKeys.forEach((r) => { if (!allReceived.find((x) => x.id === r.id)) allReceived.push(r); });
  // Mettre à jour state
  state.reservationsReceived = allReceived;

  // Messages reçus
  const myMessages = getAccountMessages(user.email);
  const convKeys = Object.keys(myMessages);
  const activeKey = state.activeConversationId || convKeys[0] || null;
  const activeMessages = activeKey ? (myMessages[activeKey] || []) : [];

  const totals = displayListings.reduce((a, l) => ({
    views: a.views + (l.views || 0),
    revenue: a.revenue + (l.price || 0) * (l.sales || 0),
  }), { views: 0, revenue: 0 });

  const reservationsHtml = allReceived.length === 0
    ? `<div class="empty-hint">Aucune réservation reçue. Publiez des offres pour en recevoir.</div>`
    : allReceived.map((r) => `
      <div class="reservation-card ${r.status?.includes('Confirmée') ? 'confirmed' : r.status?.includes('Refusée') ? 'rejected' : 'pending'}">
        <div class="res-header">
          <strong>🛒 ${esc(r.crop)}</strong>
          <span class="res-status">${esc(r.status)}</span>
        </div>
        <div class="res-body">
          <div><span>Acheteur</span><strong>${esc(r.buyerName)}</strong></div>
          <div><span>Téléphone</span><strong>${esc(r.buyerPhone || "—")}</strong></div>
          <div><span>Quantité</span><strong>${esc(r.qty)}</strong></div>
          <div><span>Prix</span><strong>${fmtPrice(r.price)} / ${esc(r.unit)}</strong></div>
          <div><span>Province</span><strong>${esc(r.buyerProvince || "—")}</strong></div>
          <div><span>Date</span><strong>${esc(r.date)}</strong></div>
        </div>
        ${r.status === "En attente de confirmation" ? `
        <div class="res-actions">
          <button class="btn primary compact" data-confirm="${r.id}">✅ Confirmer</button>
          <button class="btn ghost compact" data-reject="${r.id}">❌ Refuser</button>
          <a class="btn whatsapp compact" href="https://wa.me/${(r.buyerPhone || '').replace(/[\s+]/g, '')}" target="_blank">📱 WhatsApp</a>
        </div>` : ""}
      </div>`).join("");

  // Messagerie
  const messagesHtml = activeMessages.length === 0
    ? `<div class="chat-empty">Aucun message dans cette conversation.</div>`
    : activeMessages.slice().reverse().map((m) => `
        <div class="bubble ${m.senderEmail === user.email ? 'me' : 'other'}">
          <span class="bubble-name">${esc(m.senderName)}</span>
          <p>${esc(m.text)}</p>
          <small>${esc(m.time)}</small>
        </div>`).join("");

  const convListHtml = convKeys.length === 0
    ? `<p class="empty-hint" style="padding:16px">Aucune conversation.</p>`
    : convKeys.map((k) => {
        const msgs = myMessages[k] || [];
        const last = msgs[0];
        return `<button class="conversation ${k === activeKey ? 'active' : ''}" data-conv-key="${esc(k)}">
          <span class="avatar">${last ? initials(last.senderName) : "?"}</span>
          <span><strong>${esc(last?.senderName || k)}</strong><small>${esc(last?.text?.slice(0, 40) || "—")}</small></span>
        </button>`;
      }).join("");

  return shell(`
    <main class="dashboard">
      <div class="section-head">
        <h1>🌾 Tableau de bord Producteur</h1>
        <p>Gérez vos offres, réservations et discussions avec vos acheteurs.</p>
      </div>
      ${profilePanel(user)}

      <div class="dash-grid">
        ${metric("Publications", myListings.length || displayListings.length)}
        ${metric("Vues totales", totals.views)}
        ${metric("Réservations reçues", allReceived.length, allReceived.length > 0 ? "🔔" : "")}
        ${metric("Revenus estimés", fmtPrice(totals.revenue))}
      </div>

      <section class="panel reservations-panel">
        <div class="panel-head">
          <h2>📋 Réservations reçues ${allReceived.length > 0 ? `<span class="badge-count">${allReceived.length}</span>` : ""}</h2>
          <button class="btn soft compact" data-go="publish">+ Nouvelle offre</button>
        </div>
        <div class="reservations-list">${reservationsHtml}</div>
      </section>

      <section class="panel inbox">
        <div class="panel-head"><h2>💬 Messagerie</h2></div>
        <div class="inbox-grid">
          <div class="conversation-list">${convListHtml}</div>
          <div class="chat-box">
            <div class="chat-messages" id="chatMessages" style="max-height:280px;overflow-y:auto">${messagesHtml}</div>
            ${activeKey ? `
            <div class="chat-input-row" style="margin-top:10px">
              <input id="dashChatInput" placeholder="Votre réponse..." maxlength="500">
              <button class="btn primary" id="dashChatSend" data-conv="${activeKey}">Envoyer</button>
            </div>` : ""}
          </div>
        </div>
      </section>

      <section class="panel">
        <h2>📦 Mes publications</h2>
        ${displayListings.length === 0
          ? `<p class="empty-hint">Aucune publication. <button class="link-btn" data-go="publish">Publiez votre première offre →</button></p>`
          : displayListings.map((l) => `<div class="row-item">
              <strong>${esc(l.crop)} · ${esc(l.qty)}</strong>
              <span>${fmtPrice(l.price)} / ${esc(l.unit)} · ${l.views || 0} vues</span>
            </div>`).join("")}
        <button class="btn primary wide" style="margin-top:14px" data-go="publish">+ Publier une offre</button>
      </section>
    </main>`, { bottom: true });
}
