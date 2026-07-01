// js/services/feed.js
// Fil d'actualité simulé — nouvelles publications toutes les 30s
// Badge sur l'icône accueil comme Facebook

import { state } from "./state.js";
import { listings } from "../data/products.js";

const FEED_SELLERS = [
  { name: "Mama Thérèse", province: "Kinshasa", phone: "+243 991 234 567" },
  { name: "Coopérative Bidiku", province: "Kongo Central", phone: "+243 998 765 432" },
  { name: "Ferme Kalenga", province: "Haut-Katanga", phone: "+243 955 444 999" },
  { name: "Jean-Marc K.", province: "Kwilu", phone: "+243 899 555 111" },
  { name: "Mama Béatrice", province: "Tshopo", phone: "+243 977 888 222" },
  { name: "Papa Ilunga", province: "Kongo Central", phone: "+243 970 112 233" },
  { name: "Coopérative Mvuama", province: "Kongo Central", phone: "+243 933 222 111" },
  { name: "Coopérative Lifumba", province: "Kinshasa", phone: "+243 812 345 678" },
];

const FEED_CROPS  = ["Manioc", "Maïs", "Tomate", "Riz", "Arachide", "Banane plantain", "Poisson fumé", "Huile de palme", "Igname", "Haricot"];
const FEED_QTYS   = ["500 kg", "1 tonne", "200 caisses", "800 kg", "300 régimes", "50 paniers", "400 L", "2 tonnes"];
const FEED_CITIES = ["Maluku", "Nsele", "Mbanza-Ngungu", "Lubumbashi", "Kikwit", "Kisangani", "Boma", "Matadi"];

// Posts du fil (les premiers sont simulés comme "existants")
export const feedPosts = [];
let feedIdCounter = 100;
let feedIntervalId = null;
let onNewPost = null;

export function setFeedPostHandler(fn) { onNewPost = fn; }

function generatePost() {
  const seller  = FEED_SELLERS[feedIdCounter % FEED_SELLERS.length];
  const crop    = FEED_CROPS[(feedIdCounter * 3) % FEED_CROPS.length];
  const qty     = FEED_QTYS[(feedIdCounter * 7) % FEED_QTYS.length];
  const city    = FEED_CITIES[(feedIdCounter * 11) % FEED_CITIES.length];
  const price   = [450, 380, 18000, 620, 1200, 25, 35000, 2500][(feedIdCounter * 5) % 8];
  const unit    = ["sac 50kg", "caisse", "régime", "panier", "bidon 5L", "sac 25kg"][(feedIdCounter * 2) % 6];
  const ago     = "À l'instant";

  return {
    id: feedIdCounter++,
    seller: seller.name,
    province: seller.province,
    city,
    crop,
    qty,
    price,
    unit,
    verified: feedIdCounter % 3 !== 0,
    ago,
    time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    isNew: true,
  };
}

// Seeder — posts initiaux présentés comme "récents"
const SEED_AGO = ["Il y a 2 min", "Il y a 5 min", "Il y a 12 min", "Il y a 18 min", "Il y a 25 min", "Il y a 31 min"];
export function seedFeed() {
  if (feedPosts.length > 0) return;
  for (let i = 0; i < 6; i++) {
    const post = generatePost();
    post.ago = SEED_AGO[i];
    post.isNew = false;
    feedPosts.push(post);
  }
}

export function startFeedSimulation() {
  if (feedIntervalId) return;
  seedFeed();

  // Nouvelle publication toutes les 30s
  feedIntervalId = setInterval(() => {
    const post = generatePost();
    feedPosts.unshift(post);
    state.newFeedCount = (state.newFeedCount || 0) + 1;
    if (onNewPost) onNewPost(post);
  }, 30000);
}

export function stopFeedSimulation() {
  if (feedIntervalId) { clearInterval(feedIntervalId); feedIntervalId = null; }
}

export function clearNewFeedCount() {
  state.newFeedCount = 0;
}

export function newFeedCount() {
  return state.newFeedCount || 0;
}
