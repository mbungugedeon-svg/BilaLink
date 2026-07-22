# backend/seed.py
# Peuple le catalogue avec des annonces de démonstration, rattachées à de VRAIS
# comptes producteurs (mot de passe hashé, comme n'importe quel compte).
# Ne s'exécute que si la base est vide — un compte fraîchement créé par un
# vrai utilisateur reste, lui, totalement vide.

from werkzeug.security import generate_password_hash
from db import get_db

DEMO_SELLERS = [
    dict(email="therese@demo.bilalink.cd", phone="+243991234567", name="Mama Thérèse", province="Kinshasa", city="Maluku"),
    dict(email="bidiku@demo.bilalink.cd", phone="+243998765432", name="Coopérative Bidiku", province="Kongo Central", city="Mbanza-Ngungu"),
    dict(email="ilunga@demo.bilalink.cd", phone="+243970112233", name="Papa Ilunga", province="Kongo Central", city="Matadi"),
    dict(email="lifumba@demo.bilalink.cd", phone="+243812345678", name="Coopérative Lifumba", province="Kinshasa", city="Nsele"),
    dict(email="kalenga@demo.bilalink.cd", phone="+243955444999", name="Ferme Kalenga", province="Haut-Katanga", city="Lubumbashi"),
]

DEMO_LISTINGS = [
    dict(seller=0, crop="Manioc", qty="800 kg", price=450, unit="sac de 50kg", distance=18,
         available="Disponible aujourd'hui", verified=1, quality="Bonne qualité", delivery="Livraison possible",
         negotiable=1, desc="Manioc frais récolté cette semaine, propre et prêt pour transformation ou revente."),
    dict(seller=1, crop="Maïs", qty="1.2 tonne", price=380, unit="sac de 50kg", distance=54,
         available="Stock stable", verified=1, quality="Sélection premium", delivery="Livraison possible",
         negotiable=0, desc="Maïs sec trié par la coopérative, idéal pour grossistes et transformateurs."),
    dict(seller=2, crop="Banane plantain", qty="300 régimes", price=25, unit="régime", distance=87,
         available="Disponible demain", verified=0, quality="Mûre à point", delivery=None,
         negotiable=1, desc="Plantains de Matadi, régimes moyens et grands, vente directe au camion."),
    dict(seller=3, crop="Tomate", qty="150 caisses", price=18000, unit="caisse", distance=12,
         available="Disponible maintenant", verified=1, quality="Très frais", delivery="Livraison possible",
         negotiable=1, desc="Tomates rouges et fermes, récoltées le matin, conditionnées en caisses."),
    dict(seller=4, crop="Riz", qty="2 tonnes", price=620, unit="sac de 50kg", distance=710,
         available="Disponible cette semaine", verified=1, quality="Grain long", delivery="Livraison possible",
         negotiable=1, desc="Riz local propre, calibré régulier, vente par sac ou lot complet."),
]


def seed_if_empty():
    db = get_db()
    count = db.execute("SELECT COUNT(*) AS c FROM listings").fetchone()["c"]
    if count > 0:
        return

    seller_ids = []
    for s in DEMO_SELLERS:
        existing = db.execute("SELECT id FROM users WHERE email = ?", (s["email"],)).fetchone()
        if existing:
            seller_ids.append(existing["id"])
            continue
        password_hash = generate_password_hash("demo-password-not-for-real-use")
        cur = db.execute(
            """INSERT INTO users (email, phone, password_hash, name, province, city, role)
               VALUES (?, ?, ?, ?, ?, ?, 'producteur')""",
            (s["email"], s["phone"], password_hash, s["name"], s["province"], s["city"]),
        )
        seller_ids.append(cur.lastrowid)

    for l in DEMO_LISTINGS:
        seller = DEMO_SELLERS[l["seller"]]
        db.execute(
            """INSERT INTO listings
               (seller_id, crop, qty, price, unit, province, city, distance, available,
                verified, quality, delivery, negotiable, description)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                seller_ids[l["seller"]], l["crop"], l["qty"], l["price"], l["unit"],
                seller["province"], seller["city"], l["distance"], l["available"],
                l["verified"], l["quality"], l["delivery"], l["negotiable"], l["desc"],
            ),
        )
    db.commit()
