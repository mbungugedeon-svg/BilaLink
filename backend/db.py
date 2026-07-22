# backend/db.py
# Couche d'accès BDD. Utilise sqlite3 (stdlib, aucune dépendance externe).
#
# Pour passer sur Postgres en production :
#   1. pip install psycopg2-binary
#   2. définir DATABASE_URL=postgresql://user:pass@host:5432/bilalink
#   3. remplacer sqlite3.connect(...) ci-dessous par psycopg2.connect(DATABASE_URL)
#      et adapter le "?" des requêtes en "%s" (seule vraie différence de syntaxe ici).
# Le schema.sql est déjà écrit pour être compatible Postgres avec un minimum
# d'adaptation (voir commentaires en tête du fichier).

import os
import sqlite3
from flask import g

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.environ.get("BILALINK_DB_PATH", os.path.join(BASE_DIR, "bilalink.db"))
SCHEMA_PATH = os.path.join(BASE_DIR, "schema.sql")


def get_db():
    """Retourne la connexion SQLite liée à la requête Flask en cours."""
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


def close_db(e=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    """Crée les tables si elles n'existent pas encore."""
    db = sqlite3.connect(DB_PATH)
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        db.executescript(f.read())
    db.commit()
    db.close()


def register_app(app):
    app.teardown_appcontext(close_db)
    with app.app_context():
        init_db()
