// js/services/api.js
// Client HTTP centralisé vers le backend Flask. Toutes les requêtes envoient
// le cookie de session (credentials: "include") pour l'authentification.

async function request(path, options = {}) {
  const res = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  let data = null;
  try { data = await res.json(); } catch { /* réponse vide */ }
  if (!res.ok) {
    const message = (data && data.error) || `Erreur réseau (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) => request(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
};
