# backend/listings.py
from flask import Blueprint, request, jsonify
from db import get_db
from auth import login_required, current_user_row

bp = Blueprint("listings", __name__, url_prefix="/api/listings")

CATEGORY_KEYWORDS = {
    "Céréales": ["maïs", "riz", "mil", "sorgho"],
    "Tubercules": ["manioc", "igname", "patate"],
    "Légumes": ["tomate", "aubergine", "chou", "oignon"],
    "Fruits": ["banane", "ananas", "mangue", "papaye"],
    "Légumineuses": ["arachide", "haricot", "soja"],
}


def category_of(crop):
    crop_l = (crop or "").lower()
    for cat, keywords in CATEGORY_KEYWORDS.items():
        if any(k in crop_l for k in keywords):
            return cat
    return "Autres"


def listing_to_dict(row):
    return {
        "id": row["id"],
        "sellerId": row["seller_id"],
        "seller": row["seller_name"],
        "sellerEmail": row["seller_email"],
        "phone": row["seller_phone"],
        "crop": row["crop"],
        "qty": row["qty"],
        "price": row["price"],
        "unit": row["unit"],
        "province": row["province"],
        "city": row["city"],
        "distance": row["distance"],
        "rating": row["rating"],
        "sales": row["sales"],
        "available": row["available"],
        "verified": bool(row["verified"]),
        "views": row["views"],
        "quality": row["quality"],
        "delivery": row["delivery"],
        "negotiable": bool(row["negotiable"]),
        "desc": row["description"],
        "customPhoto": row["photo"],
        "published": row["created_at"],
        "category": category_of(row["crop"]),
    }


LISTING_JOIN = """
    SELECT l.*, u.name AS seller_name, u.email AS seller_email, u.phone AS seller_phone
    FROM listings l JOIN users u ON u.id = l.seller_id
"""


@bp.get("")
def list_listings():
    db = get_db()
    rows = db.execute(LISTING_JOIN + " ORDER BY l.id DESC").fetchall()
    items = [listing_to_dict(r) for r in rows]

    q = (request.args.get("search") or "").strip().lower()
    province = request.args.get("province")
    city = request.args.get("city")
    category = request.args.get("category")
    min_price = request.args.get("minPrice")
    max_price = request.args.get("maxPrice")
    verified_only = request.args.get("verifiedOnly") == "true"
    sort = request.args.get("sort", "recent")

    def matches(l):
        hay = f"{l['crop']} {l['city']} {l['province']} {l['seller']}".lower()
        if q and not (q in hay or l["crop"].lower().startswith(q)):
            return False
        if province and province != "Toutes" and l["province"] != province:
            return False
        if city and city != "Toutes" and l["city"] != city:
            return False
        if category and category != "Toutes" and l["category"] != category:
            return False
        if min_price and l["price"] < float(min_price):
            return False
        if max_price and l["price"] > float(max_price):
            return False
        if verified_only and not l["verified"]:
            return False
        return True

    items = [l for l in items if matches(l)]

    if sort == "priceAsc":
        items.sort(key=lambda l: l["price"])
    elif sort == "priceDesc":
        items.sort(key=lambda l: -l["price"])
    elif sort == "rated":
        items.sort(key=lambda l: -l["rating"])
    else:
        items.sort(key=lambda l: -l["id"])

    return jsonify({"listings": items})


@bp.get("/<int:listing_id>")
def get_listing(listing_id):
    db = get_db()
    row = db.execute(LISTING_JOIN + " WHERE l.id = ?", (listing_id,)).fetchone()
    if not row:
        return jsonify({"error": "Annonce introuvable."}), 404
    db.execute("UPDATE listings SET views = views + 1 WHERE id = ?", (listing_id,))
    db.commit()
    return jsonify({"listing": listing_to_dict(row)})


@bp.post("")
@login_required
def create_listing():
    user = current_user_row()
    if user["role"] != "producteur":
        return jsonify({"error": "Seuls les producteurs peuvent publier une offre."}), 403

    data = request.get_json(force=True) or {}
    crop = (data.get("crop") or "").strip()
    price = data.get("price")
    if not crop or price in (None, ""):
        return jsonify({"error": "La culture et le prix sont requis."}), 400

    db = get_db()
    cur = db.execute(
        """INSERT INTO listings
           (seller_id, crop, qty, price, unit, province, city, distance, available,
            verified, quality, delivery, negotiable, description, photo)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            user["id"], crop, data.get("qty") or "Stock disponible", float(price),
            data.get("unit") or "unité", data.get("province") or user["province"],
            data.get("city") or user["city"], int(data.get("distance") or 0),
            "Disponible maintenant" if data.get("availableNow") else "Sur rendez-vous",
            1, data.get("quality"), data.get("delivery"), int(bool(data.get("negotiable"))),
            data.get("desc") or "Produit local disponible pour vente directe.",
            data.get("customPhoto"),
        ),
    )
    db.commit()
    row = db.execute(LISTING_JOIN + " WHERE l.id = ?", (cur.lastrowid,)).fetchone()
    return jsonify({"listing": listing_to_dict(row)}), 201
