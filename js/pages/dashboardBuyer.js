// js/pages/dashboardBuyer.js
import { shell } from "../components/navbar.js";
import { profilePanel } from "../components/profilePanel.js";
import { metric } from "../components/formFields.js";
import { fmtPrice, esc } from "../utils/format.js";
import { state } from "../services/state.js";
import { buyerRequests } from "../data/products.js";

export function dashboardBuyer() {
  const user = state.currentUser || { name: "BilaLink Guest", phone: "—", province: "Kinshasa", city: "Kinshasa", email: "—" };

  const myReservations = state.reservations || [];

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
          <div><span>Prix</span><strong>${fmtPrice(r.price)} / ${esc(r.unit)}</strong></div>
          <div><span>Date</span><strong>${esc(r.date)}</strong></div>
        </div>
      </div>`).join("");

  return shell(`
    <main class="dashboard">
      <div class="section-head">
        <h1>🛒 Tableau de bord Acheteur</h1>
        <p>Vos réservations et demandes. Retrouvez vos discussions dans 💬 Messages.</p>
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
    </main>`, { bottom: true });
}
