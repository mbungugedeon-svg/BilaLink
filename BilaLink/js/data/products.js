// js/data/products.js
// Catalogue de produits agricoles : catégories, offres (listings), demandes d'achat,
// conversations de démonstration. C'est la "base de données" simulée du prototype.

export const CATEGORIES = {
  "Tubercules": ["Manioc", "Patate douce", "Igname"],
  "Céréales": ["Maïs", "Riz", "Mil"],
  "Fruits": ["Banane plantain", "Ananas", "Avocat", "Mangue"],
  "Légumes": ["Tomate", "Légumes feuilles", "Oignon"],
  "Protéines": ["Poisson fumé", "Haricot", "Arachide"],
  "Autres": ["Huile de palme"],
};

export const IMAGES = {
  "Manioc": "https://i.pinimg.com/736x/72/5f/11/725f1174c7bd19cce45092f2ebc70e3e.jpg",
  "Maïs": "https://i.pinimg.com/1200x/a6/e4/ab/a6e4abb073e76d44056b2ac57ca428f0.jpg",
  "Banane plantain": "https://i.pinimg.com/736x/08/9e/77/089e77b20c4c7151c359dd0b34198ff1.jpg",
  "Tomate": "https://i.pinimg.com/736x/87/9c/91/879c91a671614b11fbad72e5958e659b.jpg",
  "Riz": "https://i.pinimg.com/1200x/8b/78/46/8b7846ad3824dcc9664b4e29d16ee23d.jpg",
  "Arachide": "https://i.pinimg.com/1200x/23/0a/19/230a1946ac92e516db049ae09dac10a8.jpg",
  "Poisson fumé": "https://i.pinimg.com/736x/55/4d/99/554d99aeb635e1668c135b91e51ddd0a.jpg",
  "Huile de palme": "https://i.pinimg.com/736x/37/b4/3d/37b43da2e36188ca10778df8f015803f.jpg",
  "Ananas": "https://i.pinimg.com/1200x/ae/2c/ac/ae2cac985a2d2a73d821258e7032b375.jpg",
  "Légumes feuilles": "https://i.pinimg.com/736x/5c/1a/6d/5c1a6d8b8b4c8e8f4d4d4d4d4d4d4d4d.jpg",
};

export const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80";

// État initial des offres. Le tableau exporté est mutable : products marketplace.js
// l'importe et le modifie directement (unshift) lors d'une publication.
export const listings = [
  { id: 1, crop: "Manioc", qty: "800 kg", price: 450, unit: "sac de 50kg", province: "Kinshasa", city: "Maluku", distance: 18, seller: "Mama Thérèse", phone: "+243 991 234 567", rating: 4.8, sales: 23, available: "Disponible aujourd'hui", verified: true, views: 342, whatsapp: 54, calls: 19, published: "25 juin 2026", quality: "Bonne qualité", delivery: true, negotiable: true, desc: "Manioc frais récolté cette semaine, propre et prêt pour transformation ou revente." },
  { id: 2, crop: "Maïs", qty: "1.2 tonne", price: 380, unit: "sac de 50kg", province: "Kongo Central", city: "Mbanza-Ngungu", distance: 54, seller: "Coopérative Bidiku", phone: "+243 998 765 432", rating: 4.9, sales: 41, available: "Stock stable", verified: true, views: 510, whatsapp: 77, calls: 31, published: "23 juin 2026", quality: "Sélection premium", delivery: true, negotiable: false, desc: "Maïs sec trié par la coopérative, idéal pour grossistes et transformateurs." },
  { id: 3, crop: "Banane plantain", qty: "300 régimes", price: 25, unit: "régime", province: "Kongo Central", city: "Matadi", distance: 87, seller: "Papa Ilunga", phone: "+243 970 112 233", rating: 4.6, sales: 15, available: "Disponible demain", verified: false, views: 194, whatsapp: 28, calls: 12, published: "22 juin 2026", quality: "Mûre à point", delivery: false, negotiable: true, desc: "Plantains de Matadi, régimes moyens et grands, vente directe au camion." },
  { id: 4, crop: "Tomate", qty: "150 caisses", price: 18000, unit: "caisse", province: "Kinshasa", city: "Nsele", distance: 12, seller: "Coopérative Lifumba", phone: "+243 812 345 678", rating: 4.7, sales: 30, available: "Disponible maintenant", verified: true, views: 621, whatsapp: 91, calls: 44, published: "24 juin 2026", quality: "Très frais", delivery: true, negotiable: true, desc: "Tomates rouges et fermes, récoltées le matin, conditionnées en caisses." },
  { id: 5, crop: "Arachide", qty: "500 kg", price: 1200, unit: "sac de 25kg", province: "Kwilu", city: "Kikwit", distance: 162, seller: "Jean-Marc K.", phone: "+243 899 555 111", rating: 4.5, sales: 9, available: "Stock limité", verified: false, views: 118, whatsapp: 15, calls: 7, published: "21 juin 2026", quality: "Sèche", delivery: false, negotiable: true, desc: "Arachides sèches de Kikwit, bon rendement pour transformation." },
  { id: 6, crop: "Poisson fumé", qty: "60 paniers", price: 35000, unit: "panier", province: "Tshopo", city: "Kisangani", distance: 490, seller: "Mama Béatrice", phone: "+243 977 888 222", rating: 5.0, sales: 52, available: "Sur commande", verified: true, views: 432, whatsapp: 63, calls: 26, published: "20 juin 2026", quality: "Premium", delivery: true, negotiable: false, desc: "Poisson fumé artisanal, bien emballé pour transport longue distance." },
  { id: 7, crop: "Riz", qty: "2 tonnes", price: 620, unit: "sac de 50kg", province: "Haut-Katanga", city: "Lubumbashi", distance: 710, seller: "Ferme Kalenga", phone: "+243 955 444 999", rating: 4.4, sales: 18, available: "Disponible cette semaine", verified: true, views: 280, whatsapp: 33, calls: 16, published: "19 juin 2026", quality: "Grain long", delivery: true, negotiable: true, desc: "Riz local propre, calibré régulier, vente par sac ou lot complet." },
  { id: 8, crop: "Huile de palme", qty: "400 L", price: 2500, unit: "bidon 5L", province: "Kongo Central", city: "Boma", distance: 123, seller: "Coopérative Mvuama", phone: "+243 933 222 111", rating: 4.8, sales: 27, available: "Disponible aujourd'hui", verified: true, views: 365, whatsapp: 46, calls: 21, published: "18 juin 2026", quality: "Pure", delivery: true, negotiable: false, desc: "Huile de palme rouge pure, conditionnée en bidons scellés." },
];

export let nextListingId = 9;
export function bumpListingId() {
  return nextListingId++;
}

export const buyerRequests = [
  { id: 1, title: "Recherche 500 kg de manioc", budget: "260 000 FC", province: "Kinshasa", date: "30 juin 2026", buyer: "Restaurant Ndule", replies: 6 },
  { id: 2, title: "Besoin de 80 caisses de tomate", budget: "1 500 000 FC", province: "Kongo Central", date: "2 juillet 2026", buyer: "Grossiste Matadi", replies: 3 },
];

export let nextRequestId = 3;
export function bumpRequestId() {
  return nextRequestId++;
}

export const conversations = [
  { id: 1, with: "Coopérative Lifumba", role: "Producteur", product: "Tomate", last: "Bonjour, les 80 caisses sont disponibles aujourd'hui.", time: "09:42", unread: 2 },
  { id: 2, with: "Restaurant Ndule", role: "Acheteur", product: "Manioc", last: "Pouvez-vous livrer à Gombe demain matin ?", time: "Hier", unread: 0 },
  { id: 3, with: "Ferme Kalenga", role: "Producteur", product: "Riz", last: "Le prix est négociable pour deux tonnes.", time: "Lun.", unread: 1 },
];
