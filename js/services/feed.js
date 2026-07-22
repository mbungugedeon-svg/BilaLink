// js/services/feed.js
// Fil d'actualité RÉEL : reflète les vraies publications du catalogue
// (chargées depuis le backend), triées par date de publication.
// Le badge "nouveau" compte les offres publiées depuis la dernière visite
// du fil — plus de posts générés aléatoirement.

import { state } from "./state.js";
import { listings } from "../data/products.js";

export function feedPosts() {
  return listings
    .slice()
    .sort((a, b) => b.id - a.id)
    .map((l) => ({
      id: l.id,
      seller: l.seller,
      province: l.province,
      city: l.city,
      crop: l.crop,
      qty: l.qty,
      price: l.price,
      unit: l.unit,
      verified: l.verified,
      customPhoto: l.customPhoto,
      ago: relativeTime(l.published),
      isNew: state.lastFeedVisitId ? l.id > state.lastFeedVisitId : false,
    }));
}

function relativeTime(isoLike) {
  if (!isoLike) return "";
  const then = new Date(isoLike.replace(" ", "T") + "Z");
  const diffMin = Math.round((Date.now() - then.getTime()) / 60000);
  if (isNaN(diffMin)) return "";
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH} h`;
  return `Il y a ${Math.round(diffH / 24)} j`;
}

export function clearNewFeedCount() {
  state.lastFeedVisitId = listings.reduce((max, l) => Math.max(max, l.id), 0);
}

export function newFeedCount() {
  if (!state.lastFeedVisitId) return 0;
  return listings.filter((l) => l.id > state.lastFeedVisitId).length;
}
