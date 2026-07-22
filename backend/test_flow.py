import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Base de test isolée
os.environ["BILALINK_DB_PATH"] = "/tmp/bilalink_test.db"
os.environ.setdefault("SECRET_KEY", "test-secret-not-for-production")
os.environ.setdefault("FORCE_HTTPS", "0")  # test_client tourne en HTTP simulé
if os.path.exists("/tmp/bilalink_test.db"):
    os.remove("/tmp/bilalink_test.db")

from app import create_app

app = create_app()
seller = app.test_client()
buyer = app.test_client()


def show(label, resp):
    print(f"\n--- {label} [{resp.status_code}] ---")
    print(json.dumps(resp.get_json(), ensure_ascii=False, indent=2)[:600])


# 1. Inscription producteur
r = seller.post("/api/auth/register", json={
    "name": "Mama Thérèse", "phone": "+243990000001", "email": "therese@bilalink.cd",
    "password": "motdepasse123", "province": "Kinshasa", "city": "Kinshasa", "role": "producteur",
})
show("Register seller", r)
assert r.status_code == 201

# 2. Mot de passe faux -> refus
r = seller.post("/api/auth/login", json={"email": "therese@bilalink.cd", "password": "faux"})
show("Login wrong password", r)
assert r.status_code == 401

# 3. Inscription acheteur
r = buyer.post("/api/auth/register", json={
    "name": "Restaurant Ndule", "phone": "+243990000002", "email": "ndule@bilalink.cd",
    "password": "azerty123", "province": "Kinshasa", "city": "Kinshasa", "role": "acheteur",
})
show("Register buyer", r)
assert r.status_code == 201

# 4. Producteur publie une offre
r = seller.post("/api/listings", json={
    "crop": "Manioc", "price": 1200, "unit": "sac", "province": "Kinshasa", "city": "Kinshasa",
    "qty": "500 kg", "availableNow": True, "quality": "Bio", "delivery": "Livraison possible",
})
show("Publish listing", r)
assert r.status_code == 201
listing_id = r.get_json()["listing"]["id"]

# 5. Acheteur voit le catalogue (5 annonces de démo + celle qu'on vient de publier)
r = buyer.get("/api/listings")
show("Buyer sees catalogue", r)
all_listings = r.get_json()["listings"]
assert any(l["id"] == listing_id and l["crop"] == "Manioc" for l in all_listings)
assert len(all_listings) >= 1

# 6. Acheteur réserve
r = buyer.post("/api/reservations", json={"listingId": listing_id})
show("Reserve", r)
assert r.status_code == 201
reservation_id = r.get_json()["reservation"]["id"]

# 7. Réservation en double -> refus
r = buyer.post("/api/reservations", json={"listingId": listing_id})
show("Duplicate reservation rejected", r)
assert r.status_code == 409

# 8. Le producteur voit la notification de réservation (vraie notif, pas simulée)
r = seller.get("/api/notifications")
show("Seller notifications", r)
assert r.get_json()["unread"] == 1
assert "réservé" in r.get_json()["notifications"][0]["text"]

# 9. Le producteur confirme
r = seller.post(f"/api/reservations/{reservation_id}/confirm")
show("Seller confirms", r)
assert r.get_json()["reservation"]["status"] == "Confirmée ✅"

# 10. L'acheteur voit la notification de confirmation
r = buyer.get("/api/notifications")
show("Buyer notifications", r)
assert any("confirmé" in n["text"] for n in r.get_json()["notifications"])

# 11. Messagerie entre deux comptes différents (deux sessions = deux "appareils")
seller_id = seller.get("/api/auth/me").get_json()["user"]["id"]
buyer_id = buyer.get("/api/auth/me").get_json()["user"]["id"]
conv_key = f"conv_{listing_id}_{min(seller_id, buyer_id)}_{max(seller_id, buyer_id)}"

r = buyer.post("/api/messages", json={
    "conversationKey": conv_key, "listingId": listing_id,
    "receiverId": seller_id, "text": "Bonjour, le manioc est-il encore disponible ?",
})
show("Buyer sends message", r)
assert r.status_code == 201

r = seller.get(f"/api/messages/{conv_key}")
show("Seller reads the SAME conversation (proof it's a real shared backend)", r)
assert len(r.get_json()["messages"]) == 1
assert "disponible" in r.get_json()["messages"][0]["text"]

# 12. Mot de passe jamais stocké en clair
import sqlite3
db = sqlite3.connect("/tmp/bilalink_test.db")
row = db.execute("SELECT password_hash FROM users WHERE email='therese@bilalink.cd'").fetchone()
assert row[0] != "motdepasse123" and row[0].startswith("pbkdf2:") or "scrypt" in row[0] or ":" in row[0]
print("\n--- Password hash sample ---")
print(row[0][:60], "...")

print("\n\n✅ TOUS LES TESTS SONT PASSÉS — le backend fonctionne de bout en bout.")
