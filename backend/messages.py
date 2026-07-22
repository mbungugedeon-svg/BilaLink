# backend/messages.py
from flask import Blueprint, request, jsonify
from db import get_db
from auth import login_required, current_user_row
from notifications import notify

bp = Blueprint("messages", __name__, url_prefix="/api")


def msg_to_dict(row):
    return {
        "id": row["id"],
        "conversationKey": row["conversation_key"],
        "senderId": row["sender_id"],
        "receiverId": row["receiver_id"],
        "senderName": row["sender_name"],
        "text": row["text"],
        "read": bool(row["is_read"]),
        "time": row["created_at"],
    }


@bp.get("/messages/<conversation_key>")
@login_required
def get_messages(conversation_key):
    user = current_user_row()
    db = get_db()
    rows = db.execute(
        """SELECT m.*, u.name AS sender_name FROM messages m
           JOIN users u ON u.id = m.sender_id
           WHERE m.conversation_key = ? ORDER BY m.id DESC""",
        (conversation_key,),
    ).fetchall()

    # Ouvrir la conversation marque les messages reçus comme lus (vrai suivi,
    # pas une estimation côté client).
    db.execute(
        "UPDATE messages SET is_read = 1 WHERE conversation_key = ? AND receiver_id = ? AND is_read = 0",
        (conversation_key, user["id"]),
    )
    db.commit()

    return jsonify({"messages": [msg_to_dict(r) for r in rows]})


@bp.post("/messages")
@login_required
def send_message():
    user = current_user_row()
    data = request.get_json(force=True) or {}
    text = (data.get("text") or "").strip()
    receiver_id = data.get("receiverId")
    listing_id = data.get("listingId")
    conversation_key = data.get("conversationKey")

    if not text or not receiver_id or not conversation_key:
        return jsonify({"error": "Message, destinataire et conversation requis."}), 400

    db = get_db()
    cur = db.execute(
        """INSERT INTO messages (conversation_key, listing_id, sender_id, receiver_id, text)
           VALUES (?, ?, ?, ?, ?)""",
        (conversation_key, listing_id, user["id"], receiver_id, text),
    )
    db.commit()

    notify(receiver_id, "💬", f"{user['name']} vous a envoyé un message.", "message")

    row = db.execute(
        """SELECT m.*, u.name AS sender_name FROM messages m
           JOIN users u ON u.id = m.sender_id WHERE m.id = ?""",
        (cur.lastrowid,),
    ).fetchone()
    return jsonify({"message": msg_to_dict(row)}), 201


@bp.get("/conversations")
@login_required
def list_conversations():
    """Liste les conversations où l'utilisateur courant est impliqué, avec le dernier message."""
    user = current_user_row()
    db = get_db()
    rows = db.execute(
        """SELECT conversation_key, MAX(id) AS last_id
           FROM messages WHERE sender_id = ? OR receiver_id = ?
           GROUP BY conversation_key ORDER BY last_id DESC""",
        (user["id"], user["id"]),
    ).fetchall()
    out = []
    for r in rows:
        last = db.execute(
            """SELECT m.*, u.name AS sender_name FROM messages m
               JOIN users u ON u.id = m.sender_id WHERE m.id = ?""",
            (r["last_id"],),
        ).fetchone()
        out.append({"conversationKey": r["conversation_key"], "lastMessage": msg_to_dict(last)})
    return jsonify({"conversations": out})
