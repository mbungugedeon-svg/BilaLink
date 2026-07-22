# backend/reservations.py
from flask import Blueprint, request, jsonify
from db import get_db
from auth import login_required, current_user_row
from notifications import notify

bp = Blueprint("reservations", __name__, url_prefix="/api/reservations")


def reservation_to_dict(row):
    return {
        "id": row["id"],
        "listingId": row["listing_id"],
        "crop": row["crop"],
        "price": row["price"],
        "unit": row["unit"],
        "status": row["status"],
        "date": row["created_at"],
        "buyerName": row["buyer_name"],
        "buyerEmail": row["buyer_email"],
        "sellerName": row["seller_name"],
        "sellerEmail": row["seller_email"],
    }


JOIN = """
    SELECT r.*, l.crop AS crop, l.price AS price, l.unit AS unit,
           bu.name AS buyer_name, bu.email AS buyer_email,
           se.name AS seller_name, se.email AS seller_email
    FROM reservations r
    JOIN listings l ON l.id = r.listing_id
    JOIN users bu ON bu.id = r.buyer_id
    JOIN users se ON se.id = r.seller_id
"""


@bp.post("")
@login_required
def create_reservation():
    user = current_user_row()
    if user["role"] != "acheteur":
        return jsonify({"error": "Les producteurs ne peuvent pas réserver."}), 403

    data = request.get_json(force=True) or {}
    listing_id = data.get("listingId")
    db = get_db()
    listing = db.execute("SELECT * FROM listings WHERE id = ?", (listing_id,)).fetchone()
    if not listing:
        return jsonify({"error": "Annonce introuvable."}), 404
    if listing["seller_id"] == user["id"]:
        return jsonify({"error": "Vous ne pouvez pas réserver votre propre offre."}), 400

    existing = db.execute(
        "SELECT id FROM reservations WHERE listing_id = ? AND buyer_id = ?",
        (listing_id, user["id"]),
    ).fetchone()
    if existing:
        return jsonify({"error": "Vous avez déjà réservé cette offre."}), 409

    cur = db.execute(
        "INSERT INTO reservations (listing_id, buyer_id, seller_id) VALUES (?, ?, ?)",
        (listing_id, user["id"], listing["seller_id"]),
    )
    db.commit()

    notify(listing["seller_id"], "🛒", f"{user['name']} a réservé votre offre de {listing['crop']}.", "reservation")

    row = db.execute(JOIN + " WHERE r.id = ?", (cur.lastrowid,)).fetchone()
    return jsonify({"reservation": reservation_to_dict(row)}), 201


@bp.get("")
@login_required
def list_reservations():
    user = current_user_row()
    kind = request.args.get("type", "sent")
    db = get_db()
    if kind == "received":
        rows = db.execute(JOIN + " WHERE r.seller_id = ? ORDER BY r.id DESC", (user["id"],)).fetchall()
    else:
        rows = db.execute(JOIN + " WHERE r.buyer_id = ? ORDER BY r.id DESC", (user["id"],)).fetchall()
    return jsonify({"reservations": [reservation_to_dict(r) for r in rows]})


def _update_status(reservation_id, new_status, notify_text_icon):
    user = current_user_row()
    db = get_db()
    row = db.execute(JOIN + " WHERE r.id = ?", (reservation_id,)).fetchone()
    if not row:
        return jsonify({"error": "Réservation introuvable."}), 404
    if row["seller_id"] != user["id"]:
        return jsonify({"error": "Action réservée au producteur concerné."}), 403

    db.execute("UPDATE reservations SET status = ? WHERE id = ?", (new_status, reservation_id))
    db.commit()

    icon, text = notify_text_icon
    notify(row["buyer_id"], icon, text.format(crop=row["crop"], seller=user["name"]), "confirm")

    row = db.execute(JOIN + " WHERE r.id = ?", (reservation_id,)).fetchone()
    return jsonify({"reservation": reservation_to_dict(row)})


@bp.post("/<int:reservation_id>/confirm")
@login_required
def confirm(reservation_id):
    return _update_status(reservation_id, "Confirmée ✅", ("✅", "{seller} a confirmé votre réservation de {crop}."))


@bp.post("/<int:reservation_id>/reject")
@login_required
def reject(reservation_id):
    return _update_status(reservation_id, "Refusée ❌", ("❌", "{seller} a refusé votre réservation de {crop}."))
