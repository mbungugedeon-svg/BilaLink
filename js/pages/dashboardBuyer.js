// js/pages/dashboardBuyer.js
import { shell } from "../components/navbar.js";
import { profilePanel } from "../components/profilePanel.js";
import { metric } from "../components/formFields.js";
import { fmtPrice, esc, initials } from "../utils/format.js";
import { state } from "../services/state.js";
import { buyerRequests } from "../data/products.js";
import { t } from "../i18n.js";
import { getAccountReservationsSent, getAccountMessages } from "../services/accounts.js";

export function dashboardBuyer() {
  const user = state.currentUser || { name: "BilaLink Guest", phone: "—", province: "Kinshasa", city: "Kinshasa", email: "—" };

  // Charger réservations persistées
  const myReservations = getAccountReservationsSent(user.email);
  // Synchroniser statuts depuis localStorage global
  myReservations.forEach((r) => {
    try {
      const stored = JSON.parse(localStorage.getItem(`bilalink_reservation_${r.id}`) || "{}");
      if (stored.status) r.status = stored.status;
    } catch {}
  });

  // Messages
  const myMessages = getAccountMessages(user.email);
  const convKeys = Object.keys(myMessages);
  const activeKey = state.activeConversationId || convKeys[0] || null;
  const activeMessages = activeKey ? (myMessages[activeKey] || []) : [];

  const reservationsHtml = myReservations.length === 0
    ? `<div class="empty-hint">
        <p>Aucune réservation. Explorez le catalogue et réservez des offres !</p>
        <button class="btn primary" data-go="catalogue">🔍 Explorer le catalogue</button>
       </div>`
    : myReservations.map((r) => `
      <div class="reservation-card ${r.status?.includes('Confirmée') ? 'confirmed' : r.status?.includes('Refusée') ? 'rejected' : 'pending'}">
        <div class="res-header">
          <strong>🌾 ${esc(r.crop)}</strong>
          <span class="res-status">${esc(r.status)}</span>
        </div>
        <div class="res-body">
          <div><span>Producteur</span><strong>${esc(r.sellerName)}</strong></div>
          <div><span>Téléphone</span><strong>${esc(r.sellerPhone)}</strong></div>
          <div><span>Quantité</span><strong>${esc(r.qty)}</strong></div>
          <div><span>Prix</span><strong>${fmtPrice(r.price)} / ${esc(r.unit)}</strong></div>
          <div><span>Localisation</span><strong>${esc(r.sellerCity)}, ${esc(r.sellerProvince)}</strong></div>
          <div><span>Date</span><strong>${esc(r.date)}</strong></div>
        </div>
        <div class="res-actions">
          <a class="btn whatsapp compact" href="https://wa.me/${(r.sellerPhone || '').replace(/[\s+]/g, '')}" target="_blank">📱 WhatsApp producteur</a>
        </div>
      </div>`).join("");

  const messagesHtml = activeMessages.length === 0
    ? `<div class="chat-empty">Aucun message. Envoyez votre premier message depuis une fiche produit.</div>`
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
          <span><strong>${esc(last?.senderName || "Producteur")}</strong><small>${esc(last?.text?.slice(0, 40) || "—")}</small></span>
        </button>`;
      }).join("");

  return shell(`
    <main class="dashboard">
      <div class="section-head">
        <h1>🛒 Tableau de bord Acheteur</h1>
        <p>Vos réservations, demandes et discussions avec les producteurs.</p>
      </div>
      ${profilePanel(user)}

      <div class="dash-grid">
        ${metric("Réservations", myReservations.length, myReservations.length > 0 ? "📋" : "")}
        ${metric("Confirmées", myReservations.filter(r => r.status?.includes("Confirmée")).length, "✅")}
        ${metric("En attente", myReservations.filter(r => r.status === "En attente de confirmation").length, "⏳")}
        ${metric("Demandes publiées", buyerRequests.filter(r => r.buyerEmail === user.email).length || buyerRequests.length)}
      </div>

      <section class="panel reservations-panel">
        <div class="panel-head">
          <h2>📋 Mes réservations ${myReservations.length > 0 ? `<span class="badge-count">${myReservations.length}</span>` : ""}</h2>
          <button class="btn soft compact" data-go="catalogue">+ Nouvelle recherche</button>
        </div>
        <div class="reservations-list">${reservationsHtml}</div>
      </section>

      <section class="panel inbox">
        <div class="panel-head"><h2>💬 Mes messages</h2></div>
        <div class="inbox-grid">
          <div class="conversation-list">${convListHtml}</div>
          <div class="chat-box">
            <div class="chat-messages" id="chatMessages" style="max-height:280px;overflow-y:auto">${messagesHtml}</div>
            ${activeKey ? `
            <div class="chat-input-row" style="margin-top:10px">
              <input id="dashChatInput" placeholder="Continuer la conversation..." maxlength="500">
              <button class="btn primary" id="dashChatSend" data-conv="${activeKey}">Envoyer</button>
            </div>` : `<p class="empty-hint" style="padding:12px;font-size:13px">Ouvrez une fiche produit pour démarrer une conversation avec un producteur.</p>`}
          </div>
        </div>
      </section>
    </main>`, { bottom: true });
}
