# BilaLink — Marketplace agricole pour la RDC

BilaLink est une application web qui connecte les producteurs agricoles et les acheteurs (particuliers, restaurants, grossistes, marchés) à travers les provinces de la République Démocratique du Congo. L'objectif : permettre à un producteur de publier ce qu'il a à vendre, et à un acheteur de le trouver, le réserver et le contacter directement — sans intermédiaire.

Ce dépôt est le **prototype front-end** de BilaLink : un site 100% statique (aucun serveur, aucune base de données), pensé comme démo cliquable et fonctionnelle pour valider le concept avant de bâtir un vrai backend.

## Valeur ajoutée

**Pour les producteurs**
- Visibilité sur un catalogue consultable dans toute la RDC, pas seulement par les acheteurs de passage au marché local.
- Publication d'une offre en quelques champs (culture, quantité, prix, qualité, localisation, photo).
- Tableau de bord dédié pour suivre les réservations reçues, discuter avec les acheteurs et gérer ses annonces.

**Pour les acheteurs**
- Catalogue filtrable par culture, province, ville, prix et disponibilité, avec une vue carte géographique (Leaflet/OpenStreetMap) pour repérer les vendeurs les plus proches.
- Page de prix du marché par produit, pour évaluer si une offre est compétitive avant de négocier.
- Réservation directe et messagerie intégrée avec le vendeur, plus un raccourci WhatsApp pour aller plus vite.
- Possibilité de publier une demande d'achat ("je cherche X") si l'offre voulue n'existe pas encore.

**Pour l'écosystème**
- Un fil d'actualité façon réseau social (nouvelles publications, notifications simulées en temps réel) qui donne l'impression d'un marché actif et incite à revenir.
- Application bilingue anglais/français (anglais par défaut), pensée pour s'ouvrir à des acheteurs internationaux ou des ONG.
- Aucune dépendance serveur : tout fonctionne en local dans le navigateur, ce qui en fait une démo facile à déployer et à présenter (pitch, concours, jury) sans infrastructure.

## Fonctionnalités principales

- **Accueil** : présentation de la plateforme, statistiques clés, provinces couvertes.
- **Catalogue** : recherche, filtres avancés, vue liste et vue carte.
- **Fiche produit (détail)** : informations sur l'offre et le vendeur, produits similaires, chat intégré, réservation, contact WhatsApp.
- **Publication d'offre** : formulaire producteur (culture, quantité, prix, qualité, photo, localisation).
- **Demandes d'achat** : formulaire acheteur pour un produit précis non encore disponible.
- **Prix du marché** : suivi des prix par culture, avec graphique d'évolution.
- **Fil d'actualité** : flux simulé de nouvelles publications, façon réseau social.
- **Authentification** : inscription/connexion par numéro de téléphone, deux rôles (producteur / acheteur), session persistée.
- **Tableaux de bord** : un par rôle — annonces et réservations reçues pour les producteurs ; réservations envoyées et demandes pour les acheteurs.
- **Notifications** : alertes simulées (nouvelle réservation, message, vue d'annonce).
- **Multilingue** : bascule anglais / français sur toute l'interface, via la navbar.

## Provinces et cultures couvertes (données de démo)

- **Provinces** : Kinshasa, Kongo Central, Kwilu, Kwango, Tshopo, Haut-Katanga, Kasaï, Nord-Kivu (avec leurs villes et coordonnées GPS pour la carte).
- **Catégories de produits** : Tubercules (manioc, patate douce, igname), Céréales (maïs, riz, mil), Fruits (banane plantain, ananas, avocat, mangue), Légumes (tomate, légumes-feuilles, oignon), Protéines (poisson fumé, haricot, arachide), Autres (huile de palme).

## Architecture technique

Site statique en JavaScript pur (vanilla JS, sans framework), organisé en modules ES (~2000 lignes de JS hors librairies) :

```
BilaLink/
├── index.html              Point d'entrée
├── css/                     style.css, animation.css, responsive.css
└── js/
    ├── app.js               Routeur principal, restauration de session, liaison des événements
    ├── i18n.js               Système de traduction EN/FR
    ├── components/           Éléments d'UI réutilisables : navbar, hero, footer, carte,
    │                         carte produit, panneau de profil, panneau de notifications, champs de formulaire
    ├── pages/                Une fonction de rendu par page : home, catalogue, detail, publish,
    │                         requests, prices, feed, auth, dashboardBuyer, dashboardSeller
    ├── services/             Logique métier : accounts, auth, marketplace, feed,
    │                         notifications, state (état global + navigation)
    ├── data/                 Données de référence : products (catalogue), provinces (géo), prices
    └── utils/                helpers (DOM) et format (formatage, échappement HTML)
```

**Points techniques notables :**
- Aucune base de données : comptes, annonces et réservations sont persistés dans le `localStorage` du navigateur (`bilalink_accounts`, session, etc.).
- La carte interactive utilise **Leaflet** avec les tuiles OpenStreetMap, chargé via CDN dans `index.html`.
- Le routage entre pages se fait entièrement côté client (`state.js` + `app.js`), sans rechargement de page.
- Le fil d'actualité et les notifications sont **simulés** : générés côté client à intervalles réguliers pour donner l'impression d'une plateforme vivante — il n'y a pas de vrai backend ni d'autres utilisateurs réels derrière.
- Les images produits proviennent d'URLs externes statiques (pas d'upload réel côté prototype).

## Lancer le projet en local

Le site utilise des modules ES (`<script type="module">`), qui ne fonctionnent pas en ouvrant simplement `index.html` (protocole `file://`). Il faut le servir via un serveur HTTP local :

```bash
cd BilaLink
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

Ou avec l'extension **Live Server** de VS Code : clic droit sur `index.html` → "Open with Live Server".

## Limites actuelles (prototype)

- Pas de backend réel : les données ne sont pas partagées entre utilisateurs, chacun a son propre `localStorage`.
- Notifications et fil d'actualité simulés, non connectés à de vraies actions d'autres utilisateurs.
- Pas de paiement en ligne intégré — la mise en relation se fait via réservation, chat interne ou WhatsApp.
- Pas d'upload d'image réel (les photos produits viennent d'URLs prédéfinies).

Ces limites sont normales pour un prototype/démo. L'étape naturelle suivante est de connecter l'application à un vrai backend (base de données, authentification serveur, API, upload de fichiers) pour la rendre multi-utilisateurs en production.
