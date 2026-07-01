// js/i18n.js
// Système de traduction EN/FR pour BilaLink.
// Langue par défaut : anglais (EN). Toggle disponible dans la navbar.

export const LANGS = { EN: "EN", FR: "FR" };

let currentLang = "EN";

export function getLang() { return currentLang; }
export function setLang(l) { currentLang = l; }
export function t(en, fr) { return currentLang === "FR" ? fr : en; }

// ─── Navbar ──────────────────────────────────────────────────────────────────
export const i18n = {
  // Brand
  brandName: () => "BilaLink",

  // Role switch
  buyer:    () => t("Buyer",    "Acheteur"),
  supplier: () => t("Supplier", "Producteur"),

  // Desktop nav
  navMarket:    () => t("Marketplace", "Marché"),
  navRequests:  () => t("Requests",    "Demandes"),
  navPrices:    () => t("Prices",      "Prix"),
  navDashboard: () => t("Dashboard",   "Dashboard"),

  // Bottom nav
  navMarketShort:   () => t("Marketplace", "Marché"),
  navRequestsShort: () => t("Requests",    "Demandes"),
  navPublish:       () => t("List Product","Publier"),
  navSellerHub:     () => t("Seller Hub",  "Compte pro"),
  navProfile:       () => t("Profile",     "Profil"),

  // ─── Landing / Home ─────────────────────────────────────────────────────
  badge:      () => t("DRC's Agri-Commerce Infrastructure Platform", "DRC's Agri-Commerce Infrastructure Platform"),
  heroTitle:  () => t("Sell Your Harvest to Trusted Buyers Across the DRC", "Vendez vos récoltes directement aux meilleurs acheteurs en RDC."),
  heroSub:    () => t("BilaLink connects farmers, cooperatives, wholesalers and professional buyers through a smarter agricultural supply network.", "BilaLink connecte les agriculteurs, coopératives et acheteurs sans intermédiaires."),
  btnExplore: () => t("Explore Marketplace", "Explorer le marché"),
  btnList:    () => t("List a Product",      "Publier une récolte"),
  cardContact:() => t("Direct Contact",      "Contact direct"),
  cardContactSub: () => t("WhatsApp • Call • Location", "WhatsApp, appel, localisation"),

  // Stats
  statSuppliers: () => t("Suppliers",       "Producteurs"),
  statBuyers:    () => t("Buyers",          "Acheteurs"),
  statListings:  () => t("Active Listings", "Offres actives"),
  statProvinces: () => t("Provinces",       "Provinces"),

  // MVP section
  mvpTitle:   () => t("Level 1 – Marketplace MVP", "Niveau 1 - Marketplace MVP"),
  mvpSub:     () => t("The minimum useful features to get started fast: list, find, contact, and reserve.", "Le minimum utile pour démarrer vite : publier, trouver, contacter et réserver."),
  mvpSupTag:  () => t("Supplier",  "Fournisseur"),
  mvpSupTitle:() => t("List an Agricultural Product", "Publier une offre agricole"),
  mvpSup1:    () => t("Product, quantity and price",  "Produit, quantité et prix"),
  mvpSup2:    () => t("Location and availability",    "Localisation et disponibilité"),
  mvpSup3:    () => t("Photos and direct contact",    "Photos et contact direct"),
  mvpBuyTag:  () => t("Buyer",    "Acheteur"),
  mvpBuyTitle:() => t("Find and Reserve", "Trouver et réserver"),
  mvpBuy1:    () => t("Search and filter",            "Rechercher et filtrer"),
  mvpBuy2:    () => t("Contact the supplier",         "Contacter le fournisseur"),
  mvpBuy3:    () => t("Reserve a quantity",           "Réserver une quantité"),

  // Why BilaLink
  whyTitle:   () => t("Why BilaLink?",                    "Pourquoi BilaLink ?"),
  whySub:     () => t("The essential tools, without unnecessary complexity.", "Les outils essentiels, sans complexité inutile."),
  feat1Title: () => t("Direct Sales",       "Vente directe"),
  feat1Text:  () => t("Suppliers keep the relationship and negotiate their own price.", "Le producteur garde la relation et négocie son prix."),
  feat2Title: () => t("Geolocation",        "Géolocalisation"),
  feat2Text:  () => t("Buyers spot nearby listings on the map.", "L'acheteur repère les offres proches de lui."),
  feat3Title: () => t("WhatsApp Contact",   "Contact WhatsApp"),
  feat3Text:  () => t("One conversation is enough to close a deal.", "Une conversation suffit pour conclure."),
  feat4Title: () => t("Best Price",         "Meilleur prix"),
  feat4Text:  () => t("Compare with average market prices.", "Comparer les prix moyens du marché."),
  feat5Title: () => t("Verified Buyers",    "Acheteurs vérifiés"),
  feat5Text:  () => t("Visible badges to build trust.", "Badges visibles pour renforcer la confiance."),
  feat6Title: () => t("Rated Suppliers",    "Producteurs notés"),
  feat6Text:  () => t("Reviews and history after each transaction.", "Avis et historique après transaction."),

  // How it works
  howTitle:   () => t("How it works?",                          "Comment ça marche ?"),
  howSub:     () => t("Four simple steps, from field to buyer.", "Quatre gestes simples, du champ à l'acheteur."),
  step1: () => t("List your harvest",                "Publiez votre récolte"),
  step2: () => t("Buyers find your listing",         "Les acheteurs trouvent votre offre"),
  step3: () => t("They contact you directly",        "Ils vous contactent directement"),
  step4: () => t("You close the deal",               "Vous concluez la vente"),

  // Footer
  footerText: () => t("BilaLink — DRC's Agri-Commerce Infrastructure Platform. Demo prototype.", "BilaLink — Marketplace agricole directe. Prototype de démonstration."),

  // ─── Catalogue ──────────────────────────────────────────────────────────
  searchPlaceholder: () => t("Search cassava, rice, tomatoes...", "Chercher manioc, riz, tomate..."),
  btnNearMe:         () => t("Near Me",          "Autour de moi"),
  advancedFilters:   () => t("Advanced Filters", "Filtres avancés"),
  filterProvince:    () => t("Province",   "Province"),
  filterCity:        () => t("City",       "Ville"),
  filterCategory:    () => t("Category",   "Catégorie"),
  filterMinPrice:    () => t("Min Price",  "Prix min"),
  filterMaxPrice:    () => t("Max Price",  "Prix max"),
  filterAvail:       () => t("Availability", "Disponibilité"),
  filterDist:        () => t("Distance",   "Distance"),
  filterRating:      () => t("Min Rating", "Note min"),
  filterSort:        () => t("Sort",       "Tri"),
  filterVerified:    () => t("Verified Supplier", "Producteur vérifié"),
  availableListings: () => t("Available Products", "Offres disponibles"),
  results: (n) => t(`${n} Result${n !== 1 ? "s" : ""}`, `${n} résultat${n > 1 ? "s" : ""}`),

  // Sort options
  sortRecent:   () => t("Most Recent",     "Plus récents"),
  sortPriceAsc: () => t("Price: Low–High", "Prix croissant"),
  sortPriceDsc: () => t("Price: High–Low", "Prix décroissant"),
  sortNear:     () => t("Nearest",         "Plus proche"),
  sortRated:    () => t("Top Rated",       "Mieux notés"),

  // Availability filter options
  availAll:   () => t("All",       "Toutes"),
  availNow:   () => t("Available", "Disponible"),
  availStock: () => t("In Stock",  "Stock"),
  availOrder: () => t("Pre-order", "Commande"),

  // Product card
  btnViewDetails: () => t("View Details", "Voir les détails"),
  btnContact:     () => t("Contact",      "Contacter"),
  btnReserve:     () => t("Reserve",      "Réserver"),
  verified:       () => t("Verified",     "Vérifié"),

  // Price tone
  toneLow:  () => t("Below market average",  "Moins cher que la moyenne"),
  toneHigh: () => t("Above market average",  "Plus cher que la moyenne"),
  toneFair: () => t("Fair Price",            "Prix équilibré"),
  toneComp: () => t("Price to compare",      "Prix à comparer"),

  // Empty state
  emptyTitle: () => t("No listings found",                           "Aucune offre trouvée"),
  emptySub:   () => t("Try a different product, province or price.", "Essayez un produit, une province ou un prix différent."),

  // ─── Categories (data) ──────────────────────────────────────────────────
  catTubers:    () => t("Tubers",    "Tubercules"),
  catCereals:   () => t("Cereals",   "Céréales"),
  catFruits:    () => t("Fruits",    "Fruits"),
  catVeggies:   () => t("Vegetables","Légumes"),
  catProteins:  () => t("Protein",   "Protéines"),
  catOther:     () => t("Other",     "Autres"),

  // Crops
  cropCassava:      () => t("Cassava",        "Manioc"),
  cropSweetPotato:  () => t("Sweet Potato",   "Patate douce"),
  cropYam:          () => t("Yam",            "Igname"),
  cropMaize:        () => t("Maize",          "Maïs"),
  cropRice:         () => t("Rice",           "Riz"),
  cropMillet:       () => t("Millet",         "Mil"),
  cropPlantain:     () => t("Plantain",       "Banane plantain"),
  cropPineapple:    () => t("Pineapple",      "Ananas"),
  cropAvocado:      () => t("Avocado",        "Avocat"),
  cropMango:        () => t("Mango",          "Mangue"),
  cropTomato:       () => t("Tomato",         "Tomate"),
  cropLeafVeg:      () => t("Leafy Vegetables","Légumes feuilles"),
  cropOnion:        () => t("Onion",          "Oignon"),
  cropSmokedFish:   () => t("Smoked Fish",    "Poisson fumé"),
  cropBeans:        () => t("Beans",          "Haricot"),
  cropPeanut:       () => t("Peanut",         "Arachide"),
  cropPalmOil:      () => t("Palm Oil",       "Huile de palme"),

  // ─── Detail page ────────────────────────────────────────────────────────
  backToMarket:    () => t("Back to Marketplace", "Retour au marché"),
  labelQty:        () => t("Quantity",     "Quantité"),
  labelAvail:      () => t("Availability", "Disponibilité"),
  labelQuality:    () => t("Quality",      "Qualité"),
  labelPublished:  () => t("Listed On",    "Publication"),
  labelLocation:   () => t("Location",     "Lieu"),
  labelDistance:   () => t("Distance",     "Distance"),
  labelDelivery:   () => t("Delivery",     "Livraison"),
  labelPrice:      () => t("Price",        "Prix"),
  deliveryYes:     () => t("Available",    "Possible"),
  deliveryNo:      () => t("To arrange",   "À organiser"),
  priceNeg:        () => t("Negotiable",   "Négociable"),
  priceFixed:      () => t("Fixed",        "Fixe"),
  verifiedSupplier:() => t("Verified Supplier", "Producteur vérifié"),
  verifiedPhone:   () => t("Verified Phone",    "Téléphone vérifié"),
  coopMember:      () => t("Cooperative Member","Badge coopérative"),
  sales:    (n)   => t(`${n} Sales`,  `${n} ventes`),
  btnCall:         () => t("Call",    "Appeler"),
  btnShare:        () => t("Share",   "Partager"),
  supplierLocation:() => t("Supplier Location", "Position du producteur"),
  mapSub:          () => t("OpenStreetMap and estimated distance.", "Carte OpenStreetMap et distance estimée."),
  similarProducts: () => t("Similar Products",  "Produits similaires"),
  noSimilar:       () => t("No similar products",  "Aucun produit similaire"),
  noSimilarSub:    () => t("New listings will arrive soon.", "De nouvelles offres arriveront bientôt."),

  // Availability values (used in listings data)
  availToday:      () => t("Available Today",      "Disponible aujourd'hui"),
  availTomorrow:   () => t("Available Tomorrow",   "Disponible demain"),
  availNow2:       () => t("Available Now",        "Disponible maintenant"),
  availWeek:       () => t("Available This Week",  "Disponible cette semaine"),
  availStable:     () => t("Stable Stock",         "Stock stable"),
  availLimited:    () => t("Limited Stock",        "Stock limité"),
  availOnOrder:    () => t("On Order",             "Sur commande"),
  availAppt:       () => t("By Appointment",       "Sur rendez-vous"),

  // Quality values
  qualGood:      () => t("Premium Quality", "Bonne qualité"),
  qualPremium:   () => t("Premium Selection","Sélection premium"),
  qualFresh:     () => t("Very Fresh",       "Très frais"),
  qualDry:       () => t("Dry",              "Sèche"),
  qualPure:      () => t("Pure",             "Pure"),
  qualGrain:     () => t("Long Grain",       "Grain long"),
  qualRipe:      () => t("Perfectly Ripe",   "Mûre à point"),
  qualPremium2:  () => t("Premium",          "Premium"),
  qualStandard:  () => t("Standard",         "Standard"),

  // ─── Publish page ───────────────────────────────────────────────────────
  publishTitle:   () => t("List a Product",       "Publier une récolte"),
  publishSub:     () => t("Add only the essentials. Advanced options stay hidden.", "Ajoutez seulement l'essentiel. Les options avancées restent discrètes."),
  addPhotos:      () => t("Add Photos",           "Ajouter des photos"),
  addPhotosSub:   () => t("JPG or PNG, multiple photos allowed", "JPG ou PNG, plusieurs photos possibles"),
  fieldProduct:   () => t("Product",              "Produit"),
  fieldStock:     () => t("Available Stock",      "Stock restant"),
  fieldPrice:     () => t("Price per unit",       "Prix par unité"),
  fieldUnit:      () => t("Unit",                 "Unité"),
  fieldDesc:      () => t("Description",          "Description"),
  descPlaceholder:() => t("e.g. Fresh cassava harvested this week...", "Ex: Manioc frais récolté cette semaine..."),
  fieldQuality:   () => t("Quality",              "Qualité"),
  fieldHarvest:   () => t("Harvest Date",         "Date de récolte"),
  advOptions:     () => t("Advanced Options",     "Options avancées"),
  optAvailNow:    () => t("Immediately available", "Disponible immédiatement"),
  optDelivery:    () => t("Delivery available",    "Livraison possible"),
  optNeg:         () => t("Negotiable price",      "Prix négociable"),
  optFeatured:    () => t("Feature this listing",  "Mettre en avant l'annonce"),
  aiBtn:          () => t("Generate with AI",      "Générer avec l'IA"),
  aiDefault:      () => t("AI can suggest a description, recommended price and keywords.", "L'IA peut proposer une description, un prix conseillé et des mots-clés."),
  reviewBox:      () => t("Review before publishing", "Validation avant publication"),
  reviewSub:      () => t("Check the product, price and WhatsApp number before publishing.", "Vérifiez le produit, le prix et le numéro WhatsApp avant de publier."),
  btnPublish:     () => t("Publish Listing",       "Publier l'offre"),

  // ─── Requests page ──────────────────────────────────────────────────────
  reqPageTitle: () => t("Purchase Requests", "Demandes d'achat"),
  reqPageSub:   () => t("Buyers post a need, farmers respond.", "Les acheteurs publient un besoin, les agriculteurs répondent."),
  reqPlaceholder: () => t("e.g. Looking for 500 kg of cassava", "Ex: Recherche 500 kg de manioc"),
  reqBudget:    () => t("Budget e.g. 260 000 FC",   "Budget ex: 260 000 FC"),
  reqDate:      () => t("Delivery date",             "Date souhaitée"),
  btnPostReq:   () => t("Post Request",              "Publier la demande"),
  reqReplies: (n) => t(`${n} response${n !== 1 ? "s" : ""}`, `${n} réponse${n > 1 ? "s" : ""}`),
  btnReply:     () => t("Reply",     "Répondre"),
  reqWants:     () => t("wants by",  "souhaite le"),

  // ─── Auth page ──────────────────────────────────────────────────────────
  authWelcome:  () => t("Welcome to BilaLink", "Bienvenue sur BilaLink"),
  authSubPub:   () => t("To list a product, create or use a supplier account.", "Pour publier une récolte, créez ou utilisez un compte producteur."),
  authSubDefault:()=> t("Quick login by phone, email or demo account.", "Connexion rapide par téléphone, e-mail ou compte de démonstration."),
  authName:     () => t("Full Name",      "Nom complet"),
  authPhone:    () => t("+243 990 000 000","+243 990 000 000"),
  authEmail:    () => t("email@example.com","email@example.com"),
  authRoleBuyer:() => t("Buyer",     "Acheteur"),
  authRoleSupp: () => t("Supplier",  "Producteur"),
  authCity:     () => t("City or locality", "Ville ou localité"),
  authPwd:      () => t("Password",  "Mot de passe"),
  authContinue: () => t("Continue",  "Continuer"),
  authGuest:    () => t("Continue without account", "Continuer sans compte"),

  // ─── Toasts ─────────────────────────────────────────────────────────────
  toastNearMe:        () => t("Showing listings near you", "Recherche autour de vous activée"),
  toastReserved:      () => t("Reservation sent to supplier.", "Réservation envoyée au fournisseur."),
  toastAlreadyRes:    () => t("This listing is already in your reservations.", "Cette offre est déjà dans vos réservations."),
  toastPublished:     () => t("Listing published successfully", "Offre publiée avec succès"),
  toastRequestPosted: () => t("Request posted", "Demande publiée"),
  toastReplySent:     () => t("Reply sent to buyer", "Réponse envoyée à l'acheteur"),
  toastChatOpen:      () => t("Conversation opened", "Conversation ouverte"),
  toastMsgSent:       () => t("Message sent.", "Message envoyé dans l'application."),
  toastMsgEmpty:      () => t("Write a message before sending.", "Écrivez un message avant d'envoyer."),
  toastNewMsg:        () => t("Choose a listing or request to start a conversation.", "Choisissez une offre ou une demande pour démarrer une discussion."),
  toastLoginRequired: () => t("Sign in or create a supplier account to publish.", "Connectez-vous ou créez un compte producteur pour publier."),
  toastSupplierOnly:  () => t("Only suppliers can list a product.", "Seuls les producteurs peuvent publier une récolte."),
  toastShare:         () => t("Listing link ready to share", "Lien de l'offre prêt à partager"),
};
