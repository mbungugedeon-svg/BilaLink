// js/pages/prices.js
import { shell } from "../components/navbar.js";
import { fmtPrice, esc } from "../utils/format.js";
import { marketPrices, getPriceHistory } from "../data/prices.js";
import { state } from "../services/state.js";

const CROP_ICONS = {
  "Manioc": "🌿", "Maïs": "🌽", "Riz": "🌾", "Tomate": "🍅",
  "Arachide": "🥜", "Huile de palme": "🫙", "Banane plantain": "🍌", "Poisson fumé": "🐟",
};

export function prices() {
  const selected = state.selectedPriceCrop || marketPrices[0].crop;
  const selectedData = marketPrices.find((p) => p.crop === selected) || marketPrices[0];
  const history = getPriceHistory(selected);

  // Calcul min/max pour l'échelle du graphique
  const vals = history.map((h) => h.price);
  const minVal = Math.min(...vals);
  const maxVal = Math.max(...vals);
  const range = maxVal - minVal || 1;

  // Points SVG pour le graphique
  const W = 580, H = 140, PAD = 20;
  const points = history.map((h, i) => {
    const x = PAD + (i / (history.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((h.price - minVal) / range) * (H - PAD * 2);
    return { x, y, price: h.price, label: h.label };
  });
  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  // Zone remplie sous la courbe
  const area = `${points[0].x},${H - PAD} ` + polyline + ` ${points[points.length - 1].x},${H - PAD}`;

  const isUp = selectedData.trend >= 0;

  return shell(`
    <main class="prices-page">
      <div class="section-head">
        <h1>📊 Observatoire des prix</h1>
        <p>Suivez l'évolution des prix du marché agricole en RDC pour acheter et vendre au bon moment.</p>
      </div>

      <!-- Grille des produits (sélecteur) -->
      <section class="price-selector">
        ${marketPrices.map((p) => `
          <button class="price-chip ${p.crop === selected ? 'active' : ''}" data-price-crop="${esc(p.crop)}">
            <span>${CROP_ICONS[p.crop] || "🌱"}</span>
            <span>${esc(p.crop)}</span>
            <span class="chip-trend ${p.trend >= 0 ? 'up' : 'down'}">${p.trend >= 0 ? "↑" : "↓"}${Math.abs(p.trend)}%</span>
          </button>`).join("")}
      </section>

      <!-- Carte du produit sélectionné + graphique -->
      <section class="price-detail-card">
        <div class="price-detail-head">
          <div>
            <span class="price-emoji">${CROP_ICONS[selected] || "🌱"}</span>
            <div>
              <h2>${esc(selected)}</h2>
              <p>Prix moyen · ${esc(selectedData.unit)}</p>
            </div>
          </div>
          <div class="price-big">
            <strong>${fmtPrice(selectedData.avg)}</strong>
            <span class="trend-badge ${isUp ? 'up' : 'down'}">
              ${isUp ? "↑" : "↓"} ${Math.abs(selectedData.trend)}% cette semaine
            </span>
          </div>
        </div>

        <!-- Graphique SVG 7 jours -->
        <div class="chart-wrap">
          <div class="chart-title">Évolution sur 7 jours</div>
          <svg viewBox="0 0 ${W + PAD} ${H + 20}" width="100%" class="price-chart">
            <!-- Zone remplie -->
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="${isUp ? '#16a34a' : '#dc2626'}" stop-opacity="0.18"/>
                <stop offset="100%" stop-color="${isUp ? '#16a34a' : '#dc2626'}" stop-opacity="0.01"/>
              </linearGradient>
            </defs>
            <polygon points="${area}" fill="url(#chartGrad)"/>
            <!-- Ligne de référence horizontale -->
            <line x1="${PAD}" y1="${H - PAD - ((selectedData.avg - minVal) / range) * (H - PAD * 2)}"
                  x2="${W - PAD + PAD}" y2="${H - PAD - ((selectedData.avg - minVal) / range) * (H - PAD * 2)}"
                  stroke="#94a3b8" stroke-width="1" stroke-dasharray="4 3"/>
            <!-- Courbe principale -->
            <polyline points="${polyline}" fill="none" stroke="${isUp ? '#16a34a' : '#dc2626'}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <!-- Points sur la courbe -->
            ${points.map((p, i) => `
              <circle cx="${p.x}" cy="${p.y}" r="${i === points.length - 1 ? 5 : 3.5}"
                fill="${isUp ? '#16a34a' : '#dc2626'}" stroke="white" stroke-width="2"
                class="chart-dot" data-price="${p.price}" data-label="${esc(p.label)}"/>
            `).join("")}
            <!-- Labels X (jours) -->
            ${points.map((p, i) => i % 2 === 0 || i === points.length - 1 ? `
              <text x="${p.x}" y="${H + 14}" text-anchor="middle" font-size="10" fill="#94a3b8">${esc(p.label)}</text>
            ` : "").join("")}
            <!-- Labels Y (prix min/max) -->
            <text x="${PAD - 4}" y="${PAD + 4}" text-anchor="end" font-size="10" fill="#94a3b8">${fmtPrice(maxVal)}</text>
            <text x="${PAD - 4}" y="${H - PAD + 4}" text-anchor="end" font-size="10" fill="#94a3b8">${fmtPrice(minVal)}</text>
          </svg>
          <div class="chart-tooltip" id="chartTooltip" style="display:none"></div>
        </div>

        <!-- Indicateurs clés -->
        <div class="price-metrics">
          <div class="price-metric">
            <span>Prix min (7j)</span>
            <strong>${fmtPrice(minVal)}</strong>
          </div>
          <div class="price-metric">
            <span>Prix max (7j)</span>
            <strong>${fmtPrice(maxVal)}</strong>
          </div>
          <div class="price-metric">
            <span>Variation</span>
            <strong class="${isUp ? 'text-up' : 'text-down'}">${isUp ? "+" : ""}${selectedData.trend}%</strong>
          </div>
          <div class="price-metric">
            <span>Tendance</span>
            <strong>${isUp ? "📈 Hausse" : "📉 Baisse"}</strong>
          </div>
        </div>
      </section>

      <!-- Tableau comparatif de tous les produits -->
      <section class="panel price-table-section">
        <h2>Comparatif tous produits</h2>
        <table class="price-table">
          <thead>
            <tr><th>Produit</th><th>Prix moyen</th><th>Unité</th><th>Tendance</th><th>Signal</th></tr>
          </thead>
          <tbody>
            ${marketPrices.map((p) => `
              <tr class="price-row ${p.crop === selected ? 'selected-row' : ''}" data-price-crop="${esc(p.crop)}">
                <td><strong>${CROP_ICONS[p.crop] || "🌱"} ${esc(p.crop)}</strong></td>
                <td><strong>${fmtPrice(p.avg)}</strong></td>
                <td>${esc(p.unit)}</td>
                <td><span class="${p.trend >= 0 ? 'text-up' : 'text-down'}">${p.trend >= 0 ? "↑" : "↓"} ${Math.abs(p.trend)}%</span></td>
                <td><span class="signal-badge ${p.trend >= 2 ? 'sell' : p.trend <= -2 ? 'buy' : 'hold'}">
                  ${p.trend >= 2 ? "💰 Bon pour vendre" : p.trend <= -2 ? "🛒 Bon pour acheter" : "⏸ Stable"}
                </span></td>
              </tr>`).join("")}
          </tbody>
        </table>
      </section>

      <!-- Alertes de marché -->
      <section class="panel">
        <h2>🔔 Alertes de marché</h2>
        <div class="row-item"><strong>📈 Poisson fumé +6%</strong><span>Hausse due à la saison de pêche réduite à Kisangani.</span></div>
        <div class="row-item"><strong>📉 Tomate -5%</strong><span>Surplus de production dans la province de Kinshasa.</span></div>
        <div class="row-item"><strong>🌾 Riz stable</strong><span>Importations en cours via Lubumbashi, stock disponible.</span></div>
        <div class="row-item"><strong>🥜 Arachide +2%</strong><span>Demande croissante des transformateurs de Kikwit.</span></div>
      </section>
    </main>`, { bottom: true });
}
