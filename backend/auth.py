# backend/auth.py
# Authentification réelle : mots de passe hashés (Werkzeug/PBKDF2), session
# côté serveur (cookie signé httponly géré par Flask), séparation claire
# inscription / connexion, validation du téléphone, limite de tentatives.

import re
import time
from functools import wraps
from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_db

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# --- Validation du numéro de téléphone (format RDC) ---
# Accepte : +243XXXXXXXXX / 243XXXXXXXXX (9 chiffres après l'indicatif)
# ou format local 0XXXXXXXXX (10 chiffres, commence par 0).
PHONE_RE = re.compile(r"^(\+?243\d{9}|0\d{9})$")


def normalize_phone(raw):
    return re.sub(r"[\s\-\.]", "", raw or "")


def valid_phone(raw):
    return bool(PHONE_RE.match(normalize_phone(raw)))


# --- Limite de tentatives de connexion (anti brute-force) ---
# ⚠️ Stockage en mémoire du process : suffisant pour un pilote (1 worker),
# mais NE PARTAGE PAS l'état entre plusieurs workers gunicorn (-w 2 ou plus).
# Avant une montée en charge réelle, remplacer par un stockage partagé
# (Redis, ou une table dédiée en base) pour que la limite soit fiable
# quel que soit le worker qui reçoit la requête.
MAX_ATTEMPTS = 5
LOCKOUT_SECONDS = 15 * 60
_login_attempts = {}  # email -> {"count": int, "locked_until": timestamp|None}


def _attempt_state(email):
    return _login_attempts.setdefault(email, {"count": 0, "locked_until": None})


def is_locked(email):
    st = _attempt_state(email)
    if st["locked_until"] and time.time() < st["locked_until"]:
        return int(st["locked_until"] - time.time())
    if st["locked_until"] and time.time() >= st["locked_until"]:
        _login_attempts[email] = {"count": 0, "locked_until": None}
    return 0


def register_failed_attempt(email):
    st = _attempt_state(email)
    st["count"] += 1
    if st["count"] >= MAX_ATTEMPTS:
        st["locked_until"] = time.time() + LOCKOUT_SECONDS


def reset_attempts(email):
    _login_attempts.pop(email, None)


def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not session.get("user_id"):
            return jsonify({"error": "Connexion requise."}), 401
        return fn(*args, **kwargs)
    return wrapper


def current_user_row():
    if not session.get("user_id"):
        return None
    db = get_db()
    return db.execute("SELECT * FROM users WHERE id = ?", (session["user_id"],)).fetchone()


def user_to_dict(row):
    if row is None:
        return None
    return {
        "id": row["id"],
        "email": row["email"],
        "phone": row["phone"],
        "name": row["name"],
        "province": row["province"],
        "city": row["city"],
        "role": row["role"],
    }


@bp.post("/register")
def register():
    data = request.get_json(force=True) or {}
    phone = normalize_phone(data.get("phone"))
    email = (data.get("email") or "").strip().lower() or phone
    password = (data.get("password") or "").strip()
    name = (data.get("name") or "").strip()
    role = data.get("role") if data.get("role") in ("acheteur", "producteur") else "acheteur"

    if not email or not password or not name or not phone:
        return jsonify({"error": "Nom, téléphone et mot de passe sont requis."}), 400

    if not valid_phone(phone):
        return jsonify({
            "error": "Numéro de téléphone invalide. Utilisez un format RDC valide, "
                     "par ex. +243 991 234 567 ou 0991234567."
        }), 400

    if len(password) < 8:
        return jsonify({"error": "Le mot de passe doit contenir au moins 8 caractères."}), 400

    db = get_db()
    existing = db.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
    if existing:
        return jsonify({"error": "Un compte existe déjà avec cet identifiant. Connectez-vous."}), 409

    password_hash = generate_password_hash(password)
    cur = db.execute(
        """INSERT INTO users (email, phone, password_hash, name, province, city, role)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (email, phone, password_hash, name, data.get("province") or "Kinshasa",
         data.get("city") or "Kinshasa", role),
    )
    db.commit()
    user = db.execute("SELECT * FROM users WHERE id = ?", (cur.lastrowid,)).fetchone()

    session.clear()
    session["user_id"] = user["id"]
    return jsonify({"user": user_to_dict(user), "isNew": True}), 201


@bp.post("/login")
def login():
    data = request.get_json(force=True) or {}
    email = (data.get("email") or normalize_phone(data.get("phone")) or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not email or not password:
        return jsonify({"error": "Identifiant et mot de passe requis."}), 400

    remaining = is_locked(email)
    if remaining > 0:
        minutes = max(1, remaining // 60)
        return jsonify({
            "error": f"Trop de tentatives échouées. Réessayez dans {minutes} min."
        }), 429

    db = get_db()
    user = db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    if not user or not check_password_hash(user["password_hash"], password):
        register_failed_attempt(email)
        left = MAX_ATTEMPTS - _attempt_state(email)["count"]
        if left > 0:
            return jsonify({
                "error": f"Identifiant ou mot de passe incorrect. {left} tentative(s) restante(s) avant blocage temporaire."
            }), 401
        return jsonify({"error": f"Trop de tentatives échouées. Réessayez dans {LOCKOUT_SECONDS // 60} min."}), 429

    reset_attempts(email)
    session.clear()
    session["user_id"] = user["id"]
    return jsonify({"user": user_to_dict(user), "isNew": False})


@bp.post("/logout")
def logout():
    session.clear()
    return jsonify({"ok": True})


@bp.get("/me")
def me():
    user = current_user_row()
    if not user:
        return jsonify({"user": None})
    return jsonify({"user": user_to_dict(user)})
