# backend/app.py
import os
import secrets
from flask import Flask, send_from_directory, request
from werkzeug.middleware.proxy_fix import ProxyFix

from db import register_app
from seed import seed_if_empty
import auth
import listings
import reservations
import messages
import notifications

FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
SECRET_KEY_FILE = os.path.join(BACKEND_DIR, ".secret_key")

DEBUG = os.environ.get("FLASK_DEBUG", "0") == "1"


def get_or_create_secret_key():
    """Clé secrète de session. Priorité à la variable d'environnement
    SECRET_KEY (recommandé en vraie production : Render/Railway/etc., pour
    qu'elle reste la même après un redémarrage). Sinon, une clé aléatoire est
    générée puis sauvegardée dans backend/.secret_key (jamais sur Git), pour
    que l'app démarre toujours — peu importe comment elle est lancée
    (terminal, bouton "Run" d'un éditeur, double-clic...)."""
    env_key = os.environ.get("SECRET_KEY")
    if env_key:
        return env_key
    if os.path.exists(SECRET_KEY_FILE):
        with open(SECRET_KEY_FILE, "r") as f:
            return f.read().strip()
    key = secrets.token_hex(32)
    with open(SECRET_KEY_FILE, "w") as f:
        f.write(key)
    print("🔑 Clé secrète générée automatiquement (backend/.secret_key, jamais sur Git).")
    return key


def create_app():
    app = Flask(__name__, static_folder=None)
    # La plupart des hébergeurs (Render, Railway, etc.) placent l'app derrière
    # un proxy qui termine le HTTPS puis transmet en HTTP en interne. Sans ça,
    # Flask croit que la connexion est en HTTP et refuse de poser le cookie de
    # session marqué "Secure" → symptôme typique : "personne ne reste connecté"
    # une fois déployé, alors que ça marchait en local.
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)

    app.config["SECRET_KEY"] = get_or_create_secret_key()

    # Cookie de session
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
    # Derrière HTTPS (quasi toujours le cas en prod), on force le cookie à ne
    # circuler qu'en HTTPS. Mets FORCE_HTTPS=0 si tu déploies temporairement en HTTP pur.
    app.config["SESSION_COOKIE_SECURE"] = os.environ.get("FORCE_HTTPS", "1") == "1" and not DEBUG

    register_app(app)
    with app.app_context():
        seed_if_empty()  # noms de démo pour un catalogue non vide au 1er lancement

    app.register_blueprint(auth.bp)
    app.register_blueprint(listings.bp)
    app.register_blueprint(reservations.bp)
    app.register_blueprint(messages.bp)
    app.register_blueprint(notifications.bp)

    # --- CORS / préflight ---
    # L'erreur "405" à la connexion vient presque toujours de là : si le
    # frontend est ouvert depuis une origine différente du backend (un autre
    # port, un serveur statique séparé, un fichier ouvert directement dans le
    # navigateur), le navigateur envoie d'abord une requête OPTIONS de
    # préflight. Comme nos routes ne déclarent que POST/GET, Flask répondait
    # 405 Method Not Allowed à cette requête OPTIONS, et le vrai POST n'était
    # jamais envoyé. On gère donc explicitement OPTIONS et on renvoie les
    # en-têtes CORS nécessaires.
    #
    # ⚠️ La vraie correction reste d'accéder à l'app UNIQUEMENT via l'URL
    # servie par Flask (http://localhost:5000) — voir README. Ce filet de
    # sécurité CORS est là pour les cas où un autre serveur sert le frontend.
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            resp = app.make_default_options_response()
            return _apply_cors(resp)

    @app.after_request
    def add_cors_headers(resp):
        return _apply_cors(resp)

    def _apply_cors(resp):
        origin = request.headers.get("Origin")
        if origin:
            resp.headers["Access-Control-Allow-Origin"] = origin
            resp.headers["Access-Control-Allow-Credentials"] = "true"
            resp.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
            resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
        return resp

    # --- Sert le frontend existant (index.html, css/, js/) tel quel ---
    @app.get("/")
    def index():
        return send_from_directory(FRONTEND_DIR, "index.html")

    @app.get("/css/<path:path>")
    def css(path):
        return send_from_directory(os.path.join(FRONTEND_DIR, "css"), path)

    @app.get("/js/<path:path>")
    def js(path):
        return send_from_directory(os.path.join(FRONTEND_DIR, "js"), path)

    return app


if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    # host="0.0.0.0" est nécessaire pour être joignable depuis l'extérieur du
    # conteneur/serveur (obligatoire sur la plupart des hébergeurs).
    app.run(debug=DEBUG, host="0.0.0.0", port=port)
