# backend/notifications.py
# Notifications RÉELLES, déclenchées par de vrais événements (réservation,
# confirmation, message reçu). Plus de simulation aléatoire côté client.

from flask import Blueprint, jsonify, session
from db import get_db
from auth import login_required, current_user_row

bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")


def notify(user_id, icon, text, type_):
    """Insère une notification pour un utilisateur. Appelée depuis les autres modules."""
    from flask import g
    db = get_db()
    db.execute(
        "INSERT INTO notifications (user_id, icon, text, type) VALUES (?, ?, ?, ?)",
        (user_id, icon, text, type_),
    )
    db.commit()


def notif_to_dict(row):
    return {
        "id": row["id"],
        "icon": row["icon"],
        "text": row["text"],
        "type": row["type"],
        "read": bool(row["is_read"]),
        "time": row["created_at"],
    }


@bp.get("")
@login_required
def list_notifications():
    user = current_user_row()
    db = get_db()
    rows = db.execute(
        "SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 30",
        (user["id"],),
    ).fetchall()
    unread = db.execute(
        "SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND is_read = 0",
        (user["id"],),
    ).fetchone()["c"]
    return jsonify({"notifications": [notif_to_dict(r) for r in rows], "unread": unread})


@bp.post("/read-all")
@login_required
def read_all():
    user = current_user_row()
    db = get_db()
    db.execute("UPDATE notifications SET is_read = 1 WHERE user_id = ?", (user["id"],))
    db.commit()
    return jsonify({"ok": True})
