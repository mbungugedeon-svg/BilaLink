// js/pages/dashboardSeller.js
import { shell } from "../components/navbar.js";
import { profilePanel } from "../components/profilePanel.js";
import { metric } from "../components/formFields.js";
import { fmtPrice, esc } from "../utils/format.js";
import { state } from "../services/state.js";
import { listings } from "../data/products.js";

export function dashboardSeller() {
  const user = state.currentUser || { name: "BilaLink Guest", phone: "—", province: "Kinshasa", city: "Kinshasa", email: "—" };

  // Publications du producteur connecté (le catalogue est chargé depuis le backend)
  const myListings = listings.filter((l) => l.sellerId === user.id);

  // Réservations reçues (chargées depuis le backend)
  const received = state.reservationsReceived || [];

  const totals = myListings.reduce((a, l) => ({
    views: a.views + (l.views || 0),
    revenue: a.revenue + (l.price || 0) * (l.sales || 0),
  }), { views: 0, revenue: 0 });

  const reservationsHtml = received.length === 0
    ? `<div class="empty-hint">Aucune réservation reçue. Publiez des offres pour en recevoir.</div>`
    : received.map((r) => `
      <div class="reservation-card ${r.status?.includes('Confirmée') ? 'confirmed' : r.status?.includes('Refusée') ? 'rejected' : 'pending'}">
        <div class="res-header">
          <strong>🛒 ${esc(r.crop)}</strong>
          <span class="res-status">${esc(r.status)}</span>
        </div>
        <div class="res-body">
          <div><span>Acheteur</span><strong>${esc(r.buyerName)}</strong></div>
          <div><span>Prix</span><strong>${fmtPrice(r.price)} / ${esc(r.unit)}</strong></div>
          <div><span>Date</span><strong>${esc(r.date)}</strong></div>
        </div>
        ${r.status === "En attente de confirmation" ? `
        <div class="res-actions">
          <button class="btn primary compact" data-confirm="${r.id}">✅ Confirmer</button>
          <button class="btn ghost compact" data-reject="${r.id}">❌ Refuser</button>
        </div>` : ""}
      </div>`).join("");

  return shell(`
    <main class="dashboard">
      <div class="section-head">
        <h1>🌾 Tableau de bord Producteur</h1>
        <p>Gérez vos offres et vos réservations. Retrouvez vos discussions dans 💬 Messages.</p>
      </div>
      ${profilePanel(user)}

      <div class="dash-grid">
        ${metric("Publications", myListings.length)}
        ${metric("Vues totales", totals.views)}
        ${metric("Réservations reçues", received.length, received.length > 0 ? "🔔" : "")}
        ${metric("Revenus estimés", fmtPrice(totals.revenue))}
      </div>

      <section class="panel reservations-panel">
        <div class="panel-head">
          <h2>📋 Réservations reçues ${received.length > 0 ? `<span class="badge-count">${received.length}</span>` : ""}</h2>
          <button class="btn soft compact" data-go="publish">+ Nouvelle offre</button>
        </div>
        <div class="reservations-list">${reservationsHtml}</div>
      </section>

      <section class="panel">
        <h2>📦 Mes publications</h2>
        ${myListings.length === 0
          ? `<p class="empty-hint">Aucune publication. <button class="link-btn" data-go="publish">Publiez votre première offre →</button></p>`
          : myListings.map((l) => `<div class="row-item">
              <strong>${esc(l.crop)} · ${esc(l.qty)}</strong>
              <span>${fmtPrice(l.price)} / ${esc(l.unit)} · ${l.views || 0} vues</span>
            </div>`).join("")}
        <button class="btn primary wide" style="margin-top:14px" data-go="publish">+ Publier une offre</button>
      </section>
    </main>`, { bottom: true });
}
