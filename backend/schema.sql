-- schema.sql
-- Schéma BilaLink. Compatible SQLite tel quel.
-- Pour Postgres : remplacer AUTOINCREMENT -> SERIAL / GENERATED ALWAYS AS IDENTITY,
-- et INTEGER (bool) -> BOOLEAN. Le reste (types, contraintes) passe sans changement.

CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT UNIQUE NOT NULL,
    phone         TEXT,
    password_hash TEXT NOT NULL,
    name          TEXT NOT NULL,
    province      TEXT DEFAULT 'Kinshasa',
    city          TEXT DEFAULT 'Kinshasa',
    role          TEXT NOT NULL CHECK (role IN ('acheteur', 'producteur')),
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS listings (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop         TEXT NOT NULL,
    qty          TEXT,
    price        REAL NOT NULL,
    unit         TEXT DEFAULT 'unité',
    province     TEXT NOT NULL,
    city         TEXT,
    distance     INTEGER DEFAULT 0,
    rating       REAL DEFAULT 5.0,
    sales        INTEGER DEFAULT 0,
    available    TEXT DEFAULT 'Sur rendez-vous',
    verified     INTEGER DEFAULT 0,
    views        INTEGER DEFAULT 0,
    quality      TEXT,
    delivery     TEXT,
    negotiable   INTEGER DEFAULT 0,
    description  TEXT,
    photo        TEXT,
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reservations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id  INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    buyer_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status      TEXT NOT NULL DEFAULT 'En attente de confirmation',
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(listing_id, buyer_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_key  TEXT NOT NULL,
    listing_id        INTEGER REFERENCES listings(id) ON DELETE SET NULL,
    sender_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text              TEXT NOT NULL,
    is_read           INTEGER DEFAULT 0,
    created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    icon        TEXT,
    text        TEXT NOT NULL,
    type        TEXT,
    is_read     INTEGER DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_listings_province ON listings(province);
CREATE INDEX IF NOT EXISTS idx_reservations_seller ON reservations(seller_id);
CREATE INDEX IF NOT EXISTS idx_reservations_buyer ON reservations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_key);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
