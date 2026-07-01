// js/data/prices.js
export const marketPrices = [
  { crop: "Manioc",       avg: 500,   trend: 4,  unit: "sac 50kg" },
  { crop: "Maïs",         avg: 410,   trend: -2, unit: "sac 50kg" },
  { crop: "Riz",          avg: 650,   trend: 3,  unit: "sac 50kg" },
  { crop: "Tomate",       avg: 19000, trend: -5, unit: "caisse"   },
  { crop: "Arachide",     avg: 1300,  trend: 2,  unit: "sac 25kg" },
  { crop: "Huile de palme", avg: 2600, trend: 1, unit: "bidon 5L" },
  { crop: "Banane plantain", avg: 28, trend: -1, unit: "régime"   },
  { crop: "Poisson fumé", avg: 36000, trend: 6,  unit: "panier"   },
];

// Générer 7 jours d'historique simulé par produit
// Les prix varient légèrement autour de la moyenne (±8%)
export function getPriceHistory(crop) {
  const base = marketPrices.find((p) => p.crop === crop);
  if (!base) return [];

  const today = new Date();
  const days = [];
  let price = base.avg * (1 - base.trend / 100); // prix il y a 7 jours

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
    // variation journalière pseudo-aléatoire déterministe
    const seed = (crop.charCodeAt(0) * (7 - i) * 13) % 100;
    const delta = (seed / 100 - 0.45) * base.avg * 0.06;
    price = Math.max(price + delta, base.avg * 0.85);
    days.push({ label, price: Math.round(price) });
  }
  // Forcer le dernier point à être avg (cohérence avec le badge tendance)
  days[days.length - 1].price = base.avg;
  return days;
}
