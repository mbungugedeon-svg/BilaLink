# BilaLinkCongo — MVP avec backend réel (Flask + SQLite/Postgres)

## Ce qui a changé depuis la version précédente
L'application était 100% côté client (HTML/CSS/JS + `localStorage`) : comptes,
mots de passe, annonces, réservations et messages ne vivaient que dans le
navigateur — rien n'était partagé entre deux appareils différents, et les
mots de passe étaient stockés en clair.

Un vrai backend Flask a été ajouté (`/backend`) :
- **Comptes réels** : mots de passe hashés (`werkzeug.security`, scrypt),
  session serveur signée (cookie httponly), séparation claire
  Connexion / Inscription.
- **Base de données réelle** (SQLite par défaut, migration Postgres triviale) :
  utilisateurs, annonces, réservations, messages, notifications.
- **Messagerie et réservations qui fonctionnent entre deux comptes réels**,
  sur deux appareils différents — plus une astuce localStorage à double écriture.
- **Notifications réelles**, déclenchées par de vrais événements (réservation,
  confirmation, message reçu) — fini la simulation aléatoire toutes les 30s.
- Un nouveau compte démarre bien **vide** (aucune donnée pré-remplie).

## Lancer le projet en local

**Windows (PowerShell) :**
```powershell
cd backend
pip install -r requirements.txt
.\run.ps1
```
*(si Windows bloque le script : `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, une seule fois)*

**Mac / Linux :**
```bash
cd backend
pip install -r requirements.txt
chmod +x run.sh    # une seule fois
./run.sh
```

Ces scripts génèrent automatiquement une clé secrète locale (`.secret_key`,
jamais envoyée sur Git) la première fois, puis la réutilisent à chaque
lancement — plus besoin de taper `SECRET_KEY=...` à la main.

Puis ouvrez http://127.0.0.1:5000 — le frontend (index.html, css/, js/) est
servi directement par Flask, l'API est sous `/api/*`.

Au premier lancement, la base `backend/bilalink.db` est créée automatiquement
et peuplée avec 5 annonces de démonstration (rattachées à de vrais comptes
producteurs "démo", pas des données fictives flottantes). Créez votre propre
compte via "Créer un compte" pour tester de bout en bout : inscription,
publication, réservation, messagerie, notifications.

<details>
<summary>Lancer manuellement sans les scripts (si besoin)</summary>

PowerShell :
```powershell
$env:SECRET_KEY = "une-longue-chaine-aleatoire"
$env:FORCE_HTTPS = "0"
python app.py
```
⚠️ Ne vaut que pour la fenêtre PowerShell ouverte — à retaper à chaque nouvelle fenêtre.
</details>

## Tester le backend seul (sans navigateur)

```bash
cd backend
python test_flow.py
```

Ce script simule deux comptes (un producteur, un acheteur) sur deux sessions
distinctes et vérifie tout le parcours : inscription, connexion, publication,
réservation, confirmation, messagerie, notifications, hash du mot de passe.

## Mettre l'app en ligne (déploiement public)

Trois choses sont **obligatoires** avant d'exposer ce projet publiquement —
l'app refuse maintenant de démarrer si la première n'est pas faite :

1. **Définir une vraie clé secrète** (sinon l'app refuse de démarrer, sauf en
   local avec `FLASK_DEBUG=1`) :
   ```bash
   export SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
   ```
2. **Ne jamais définir `FLASK_DEBUG=1` sur un serveur public** — ce mode
   expose un débogueur qui permet d'exécuter du code arbitraire sur le
   serveur si quelqu'un le découvre. Par défaut (`FLASK_DEBUG` non défini),
   il est déjà désactivé.
3. **Lancer avec gunicorn**, pas avec `python3 app.py` (le serveur intégré à
   Flask n'est pas fait pour tenir une charge réelle) :
   ```bash
   pip install -r requirements.txt
   gunicorn -w 2 -b 0.0.0.0:$PORT wsgi:app
   ```
   Le fichier `Procfile` fait déjà cette commande automatiquement sur la
   plupart des hébergeurs (Render, Railway, etc.) — il suffit de connecter le
   dépôt et de définir la variable `SECRET_KEY` dans les paramètres d'environnement
   de l'hébergeur.

Une fois déployé à une vraie adresse publique (ex. `https://bilalink.onrender.com`),
deux personnes sur deux appareils et deux réseaux différents peuvent
réellement s'inscrire, publier, réserver et s'échanger des messages — parce
que tout passe par ce serveur et cette base de données partagée, pas par le
navigateur de chacun.

## Migration vers PostgreSQL (production)

1. `pip install psycopg2-binary`
2. Définir `DATABASE_URL=postgresql://user:pass@host:5432/bilalink`
3. Dans `backend/db.py`, remplacer `sqlite3.connect(...)` par
   `psycopg2.connect(DATABASE_URL)` et adapter les `?` des requêtes en `%s`
   (seule vraie différence de syntaxe ici — le schéma dans `schema.sql` est
   déjà écrit pour être compatible Postgres avec un minimum d'adaptation,
   voir les commentaires en tête de fichier).

## Ce qui reste volontairement simplifié (à documenter pour un jury)

- Le **fil d'actualité** (`js/services/feed.js`, page "Feed") reste une
  simulation cosmétique de publications aléatoires — non branché sur le
  backend. À traiter comme un élément décoratif, pas une fonctionnalité réelle.
- Pas de vérification par SMS/OTP à l'inscription (juste mot de passe).
- Pas de HTTPS/reverse proxy configuré (à faire en déploiement : activer
  `SESSION_COOKIE_SECURE = True` dans `backend/app.py`).
