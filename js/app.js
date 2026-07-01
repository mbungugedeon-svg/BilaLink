// js/app.js
import { state, go, toast, setNavigateHandler, setToastRenderer } from "./services/state.js";
import { login, logout } from "./services/auth.js";
import { reserveListing, publishListing, publishBuyerRequest, confirmReservation, rejectReservation, sendMessage } from "./services/marketplace.js";
import { renderListingMap } from "./components/map.js";
import { $, $$ } from "./utils/helpers.js";
import { esc } from "./utils/format.js";
import { getLang, setLang, i18n } from "./i18n.js";
import { getSavedSession, registerOrLogin, getAccountListings, getAccountReservationsSent, getAccountReservationsReceived } from "./services/accounts.js";

import { home } from "./pages/home.js";
import { catalogue } from "./pages/catalogue.js";
import { detail } from "./pages/detail.js";
import { publish } from "./pages/publish.js";
import { dashboardBuyer } from "./pages/dashboardBuyer.js";
import { dashboardSeller } from "./pages/dashboardSeller.js";
import { requests } from "./pages/requests.js";
import { prices } from "./pages/prices.js";
import { auth } from "./pages/auth.js";
import { listings } from "./data/products.js";
import { startFeedSimulation, setFeedPostHandler, newFeedCount, seedFeed } from "./services/feed.js";
import { feed } from "./pages/feed.js";
import { startNotifSimulation, setNotifRenderer, markAllRead, notifHistory } from "./services/notifications.js";
import { notifDropdown } from "./components/notifPanel.js";

// --- Restaurer la session au chargement ---
function restoreSession() {
  const email = getSavedSession();
  if (!email) return;
  // Retrouver le compte
  const { registerOrLogin: _, ...accounts } = {};
  // On réutilise la fonction sans vérifier le mdp (session déjà établie)
  try {
    const stored = JSON.parse(localStorage.getItem("bilalink_accounts") || "{}");
    const account = stored[email];
    if (!account) return;

    state.authed = true;
    state.role = account.role;
    state.currentUser = {
      email: account.email,
      name: account.name,
      phone: account.phone,
      province: account.province,
      city: account.city,
      role: account.role,
    };

    // Réinjecter les listings du compte dans le catalogue
    const myListings = getAccountListings(email);
    myListings.forEach((l) => {
      if (!listings.find((x) => x.id === l.id)) listings.unshift(l);
    });

    // Charger les réservations
    state.reservations = getAccountReservationsSent(email);
    state.reservationsReceived = getAccountReservationsReceived(email);
  } catch (e) { console.warn("Session restore failed", e); }
}

restoreSession();
startNotifSimulation();
startFeedSimulation();
setFeedPostHandler((post) => {
  // Mettre à jour le badge sur l'icône accueil sans re-render complet
  const count = newFeedCount();
  [".feed-nav-badge", ".feed-bottom-badge"].forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => { el.textContent = count > 9 ? "9+" : count; });
  });
  // Si aucun badge n'existe encore, en créer un
  const homeBtn = document.querySelector("[data-go='feed']");
  if (homeBtn && !homeBtn.querySelector(".feed-bottom-badge")) {
    const span = document.querySelector(".bottom-nav [data-go='feed'] span:first-child");
    if (span) {
      const badge = document.createElement("span");
      badge.className = "feed-bottom-badge";
      badge.textContent = count > 9 ? "9+" : count;
      span.appendChild(badge);
    }
  }
  // Toast discret
  const box = document.querySelector("#toastStack");
  if (box) {
    const el = document.createElement("div");
    el.className = "toast notif-toast";
    el.textContent = "🌾 " + post.seller + " vient de publier une offre de " + post.crop;
    box.prepend(el);
    setTimeout(() => el.remove(), 4500);
  }
});
setNotifRenderer((notif) => {
  if (!notif) { renderToast(); return; }
  // Afficher le toast de notification
  const box = document.querySelector("#toastStack");
  if (box) {
    const el = document.createElement("div");
    el.className = "toast notif-toast";
    el.innerHTML = notif.icon + " " + notif.text;
    box.prepend(el);
    setTimeout(() => el.remove(), 4000);
  }
  // Mettre à jour le badge de la cloche sans re-render complet
  const existingBadge = document.querySelector(".notif-badge");
  const bell = document.querySelector(".notif-bell");
  if (bell) {
    if (existingBadge) {
      existingBadge.textContent = (state.unreadNotifs || 1);
    } else {
      const badge = document.createElement("span");
      badge.className = "notif-badge";
      badge.textContent = state.unreadNotifs || 1;
      bell.appendChild(badge);
    }
  }
});

const routes = {
  landing: home,
  catalogue,
  detail,
  publish,
  dashboard: () => {
    if (!state.authed) { go("auth"); return ""; }
    return state.currentUser?.role === "producteur" ? dashboardSeller() : dashboardBuyer();
  },
  feed,
  requests,
  prices,
  auth,
};

function render() {
  const route = routes[state.page] || home;
  $("#app").innerHTML = route();
  bind();
  afterRender();
}

setNavigateHandler(render);
setToastRenderer(renderToast);

function renderToast() {
  const box = $("#toastStack");
  if (box) box.innerHTML = state.toasts.map((t) => `<div class="toast">${esc(t)}</div>`).join("");
}

function bind() {
  $$("[data-go]").forEach((b) => b.addEventListener("click", () => go(b.dataset.go)));
  $$("[data-lang]").forEach((b) => b.addEventListener("click", () => { setLang(b.dataset.lang); render(); }));

  $$("[data-detail]").forEach((el) => el.addEventListener("click", (e) => {
    if (e.target.closest("[data-contact], [data-reserve]")) return;
    state.selectedId = Number(el.dataset.detail);
    go("detail");
  }));
  $$("[data-contact]").forEach((b) => b.addEventListener("click", (e) => {
    e.stopPropagation();
    state.selectedId = Number(b.dataset.contact);
    go("detail");
  }));
  $$("[data-reserve]").forEach((b) => b.addEventListener("click", (e) => {
    e.stopPropagation();
    const success = reserveListing(b.dataset.reserve);
    if (!state.authed) render();
    else if (success) render();
  }));

  $$("[data-confirm]").forEach((b) => b.addEventListener("click", () => { confirmReservation(Number(b.dataset.confirm)); render(); }));
  $$("[data-reject]").forEach((b) => b.addEventListener("click", () => { rejectReservation(Number(b.dataset.reject)); render(); }));

  // Navigation conversation
  $$("[data-conv-key]").forEach((b) => b.addEventListener("click", () => {
    state.activeConversationId = b.dataset.convKey;
    render();
  }));

  // Chat dans detail
  const chatSend = $("#chatSend");
  if (chatSend) {
    chatSend.addEventListener("click", () => {
      const input = $("#chatInput");
      const text = input?.value?.trim();
      if (!text) { toast("Écrivez un message avant d'envoyer."); return; }
      const convKey = chatSend.dataset.conv;
      const sellerEmail = chatSend.dataset.sellerEmail;
      sendMessage(convKey, text, { otherEmail: sellerEmail });
      input.value = "";
      toast("✅ Message envoyé !");
      render();
    });
    // Envoi avec Entrée
    const chatInput = $("#chatInput");
    if (chatInput) chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); chatSend.click(); }
    });
  }

  // Chat dans dashboards
  const dashChatSend = $("#dashChatSend");
  if (dashChatSend) {
    dashChatSend.addEventListener("click", () => {
      const input = $("#dashChatInput");
      const text = input?.value?.trim();
      if (!text) { toast("Écrivez un message."); return; }
      const convKey = dashChatSend.dataset.conv;
      sendMessage(convKey, text, {});
      input.value = "";
      toast("✅ Message envoyé !");
      render();
    });
    const dashInput = $("#dashChatInput");
    if (dashInput) dashInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); dashChatSend.click(); }
    });
  }

  const search = $("#searchInput");
  if (search) {
    search.addEventListener("input", (e) => {
      state.search = e.target.value;
      render();
      setTimeout(() => $("#searchInput")?.focus(), 0);
    });
  }
  $$("[data-suggest]").forEach((b) => b.addEventListener("click", () => { state.search = b.dataset.suggest; render(); }));

  ["province", "city", "category", "availability", "maxDistance", "minRating", "sort"].forEach((id) => {
    const el = $("#" + id);
    if (el) el.addEventListener("change", (e) => {
      state[id] = e.target.value;
      if (id === "province") state.city = "Toutes";
      render();
    });
  });
  ["minPrice", "maxPrice"].forEach((id) => {
    const el = $("#" + id);
    if (el) el.addEventListener("change", (e) => { state[id] = e.target.value; render(); });
  });

  const verified = $("#verifiedOnly");
  if (verified) verified.addEventListener("change", (e) => { state.verifiedOnly = e.target.checked; render(); });

  const near = $("#nearMe");
  if (near) near.addEventListener("click", () => {
    state.maxDistance = "60"; state.sort = "near";
    toast(i18n.toastNearMe()); render();
  });

  const share = $("#shareBtn");
  if (share) share.addEventListener("click", async () => {
    try { await navigator.share?.({ title: "BilaLink", text: "Offre agricole sur BilaLink" }); } catch {}
    toast(i18n.toastShare());
  });

  // IA
  const ai = $("#aiHelp");
  if (ai) ai.addEventListener("click", () => {
    const crop = $("#crop")?.value || "Manioc";
    const text = `${crop} — frais, bien trié, disponible rapidement. Mots-clés : ${crop}, producteur vérifié, livraison possible.`;
    state.aiText = text;
    const desc = $("#desc");
    if (desc) desc.value = `${crop} frais, bien trié et disponible rapidement. Contact direct via WhatsApp.`;
    const aiText = $("#aiText");
    if (aiText) aiText.textContent = text;
  });

  // --- Upload photo publication ---
  const triggerPhoto = $("#triggerPhoto");
  const photoInput = $("#photoInput");
  const uploadZone = $("#uploadZone");

  if (triggerPhoto && photoInput) {
    triggerPhoto.addEventListener("click", () => photoInput.click());
  }
  if (uploadZone && photoInput) {
    uploadZone.addEventListener("click", () => photoInput.click());
    uploadZone.addEventListener("dragover", (e) => { e.preventDefault(); uploadZone.classList.add("drag-over"); });
    uploadZone.addEventListener("dragleave", () => uploadZone.classList.remove("drag-over"));
    uploadZone.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadZone.classList.remove("drag-over");
      const file = e.dataTransfer?.files?.[0];
      if (file) handlePhotoFile(file);
    });
  }
  if (photoInput) {
    photoInput.addEventListener("change", () => {
      const file = photoInput.files?.[0];
      if (file) handlePhotoFile(file);
    });
  }
  const removePhoto = $("#removePhoto");
  if (removePhoto) removePhoto.addEventListener("click", () => { state.publishPhotoData = null; render(); });

  // --- Formulaire publication ---
  const pub = $("#publishForm");
  if (pub) pub.addEventListener("submit", (e) => {
    e.preventDefault();
    const crop = $("#crop")?.value;
    if (!crop) { toast("Sélectionnez un produit."); return; }
    const listing = publishListing({
      crop,
      qty: $("#qty")?.value,
      price: $("#price")?.value,
      unit: $("#unit")?.value,
      province: $("#provincePub")?.value,
      city: $("#cityPub")?.value,
      availableNow: $("#availableNow")?.checked,
      delivery: $("#delivery")?.checked,
      negotiable: $("#negotiable")?.checked,
      quality: $("#quality")?.value,
      desc: $("#desc")?.value,
      customPhoto: state.publishPhotoData,
    });
    state.publishPhotoData = null;
    state.selectedId = listing.id;
    toast("🎉 " + i18n.toastPublished());
    go("detail");
  });

  // --- Formulaire demande acheteur ---
  const req = $("#requestForm");
  if (req) req.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(req);
    publishBuyerRequest({ title: fd.get("title"), budget: fd.get("budget"), province: fd.get("province"), date: fd.get("date") });
    toast(i18n.toastRequestPosted());
    render();
  });

  $$("[data-reply]").forEach((b) => b.addEventListener("click", () => toast(i18n.toastReplySent())));

  // Logout (topbar + profil)
  // --- Fil d'actualité : likes, commentaires, contact ---
  $$("[data-like]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const span = btn.querySelector(".like-count");
      if (span) {
        const n = parseInt(span.textContent) || 0;
        span.textContent = n + 1;
        btn.classList.toggle("liked");
      }
    });
  });
  $$("[data-comment]").forEach((btn) => {
    btn.addEventListener("click", (e) => { e.stopPropagation(); toast("💬 Commentaires bientôt disponibles."); });
  });
  $$("[data-feed-contact]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toast("📱 Ouverture de WhatsApp...");
    });
  });
  // Filtres du fil
  $$(".feed-filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".feed-filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // --- Notifications ---
  const bellBtn = $("#notifBellBtn");
  if (bellBtn) {
    bellBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const mount = $("#notifMount");
      if (!mount) return;
      if (mount.innerHTML) {
        mount.innerHTML = "";
      } else {
        mount.innerHTML = notifDropdown();
        state.unreadNotifs = 0;
        markAllRead();
        // Mettre à jour le badge
        const badge = $(".notif-badge");
        if (badge) badge.remove();
        // Bind mark all read
        const markBtn = $("#markAllReadBtn");
        if (markBtn) markBtn.addEventListener("click", () => { markAllRead(); mount.innerHTML = ""; });
      }
    });
    // Fermer le dropdown si on clique ailleurs
    document.addEventListener("click", () => {
      const mount = $("#notifMount");
      if (mount) mount.innerHTML = "";
    }, { once: false, capture: false });
  }

  // --- Catalogue : toggle vue liste/carte ---
  $$("[data-view]").forEach((btn) => btn.addEventListener("click", () => {
    state.catalogueView = btn.dataset.view;
    render();
    if (btn.dataset.view === "map") {
      requestAnimationFrame(() => initCatalogueMap());
    }
  }));

  // --- Prix : sélecteur de produit ---
  $$("[data-price-crop]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedPriceCrop = btn.dataset.priceCrop;
      render();
    });
  });

  // Tooltip graphique prix
  $$(".chart-dot").forEach((dot) => {
    dot.addEventListener("mouseenter", (e) => {
      const tip = $("#chartTooltip");
      if (!tip) return;
      tip.textContent = dot.dataset.label + " · " + Number(dot.dataset.price).toLocaleString("fr-FR") + " FC";
      tip.style.display = "block";
      const rect = dot.getBoundingClientRect();
      const parentRect = dot.closest(".chart-wrap")?.getBoundingClientRect();
      if (parentRect) {
        tip.style.left = (rect.left - parentRect.left) + "px";
        tip.style.top = (rect.top - parentRect.top - 36) + "px";
      }
    });
    dot.addEventListener("mouseleave", () => {
      const tip = $("#chartTooltip");
      if (tip) tip.style.display = "none";
    });
  });

  ["#logoutBtn", "#logoutBtnProfile"].forEach((sel) => {
    const btn = $(sel);
    if (btn) btn.addEventListener("click", () => { logout(); render(); });
  });

  // Auth form
  const authForm = $("#authForm");
  if (authForm) {
    authForm.querySelectorAll(".role-card input[type=radio]").forEach((radio) => {
      radio.addEventListener("change", () => {
        authForm.querySelectorAll(".role-card").forEach((c) => c.classList.remove("selected"));
        radio.closest(".role-card")?.classList.add("selected");
      });
    });
    authForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(authForm);
      const phone = fd.get("phone")?.trim();
      const email = fd.get("email")?.trim() || phone;
      const password = fd.get("password")?.trim();
      if (!phone) { toast("Le numéro de téléphone est requis."); return; }
      if (!password) { toast("Le mot de passe est requis."); return; }
      login({
        name: fd.get("name")?.trim() || "Utilisateur BilaLink",
        phone,
        email,
        province: fd.get("province"),
        city: fd.get("city"),
        role: fd.get("role"),
        password,
      });
      render();
    });
  }
}

function handlePhotoFile(file) {
  if (!file.type.startsWith("image/")) { toast("Sélectionnez une image (JPG, PNG, WEBP)."); return; }
  if (file.size > 5 * 1024 * 1024) { toast("L'image dépasse 5 Mo. Choisissez une image plus légère."); return; }
  const reader = new FileReader();
  reader.onload = (ev) => {
    state.publishPhotoData = ev.target.result;
    render();
    toast("✅ Photo sélectionnée !");
  };
  reader.readAsDataURL(file);
}

function initCatalogueMap() {
  const container = document.getElementById("catalogueMap");
  if (!container || !window.L) return;
  if (container._leaflet_id) {
    // Déjà initialisé — détruire et recréer
    container._leaflet_id = null;
    container.innerHTML = "";
  }

  const dataEl = document.getElementById("mapData");
  let listings = [];
  try { listings = JSON.parse(dataEl?.textContent || "[]"); } catch {}

  const map = L.map("catalogueMap", { zoomControl: true }).setView([-4.0, 22.0], 5);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
    maxZoom: 18,
  }).addTo(map);

  const greenIcon = L.divIcon({
    className: "",
    html: `<div style="background:#16a34a;color:white;font-size:11px;font-weight:700;padding:3px 7px;border-radius:20px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.25);border:2px solid white">🌿</div>`,
    iconAnchor: [16, 12],
  });
  const verifiedIcon = L.divIcon({
    className: "",
    html: `<div style="background:#0f766e;color:white;font-size:11px;font-weight:700;padding:3px 7px;border-radius:20px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.3);border:2px solid white">✅</div>`,
    iconAnchor: [16, 12],
  });

  listings.forEach((l) => {
    const [lat, lng] = l.coords;
    const marker = L.marker([lat, lng], { icon: l.verified ? verifiedIcon : greenIcon });
    marker.bindPopup(`
      <div style="min-width:160px;font-family:sans-serif">
        <strong style="font-size:14px">\${l.crop}</strong><br>
        <span style="color:#16a34a;font-size:16px;font-weight:700">\${Number(l.price).toLocaleString("fr-FR")} FC</span>
        <span style="font-size:12px;color:#64748b"> / \${l.unit}</span><br>
        <span style="font-size:12px;color:#475569">👤 \${l.seller}</span><br>
        <span style="font-size:12px;color:#475569">📍 \${l.city}, \${l.province}</span><br>
        <button onclick="window.__goDetail(\${l.id})"
          style="margin-top:8px;background:#16a34a;color:white;border:none;border-radius:6px;padding:6px 12px;font-size:12px;cursor:pointer;width:100%">
          Voir l'offre →
        </button>
      </div>`);
    marker.addTo(map);
  });

  // Exposer une fonction globale pour le bouton dans le popup
  window.__goDetail = (id) => {
    state.selectedId = id;
    go("detail");
  };
}

let _scrollY = 0;
let _scrollDir = "up";
let _scrollRaf = null;

function initScrollBehavior() {
  const topbar = document.getElementById("mainTopbar");
  const bottomNav = document.getElementById("bottomNav");
  const marketPanel = document.querySelector(".market-panel");

  // Reset à chaque navigation
  _scrollY = 0;
  if (topbar)    { topbar.classList.remove("topbar--hidden"); topbar.style.transform = ""; }
  if (bottomNav) { bottomNav.classList.remove("bottomnav--hidden"); }

  const onScroll = () => {
    if (_scrollRaf) return;
    _scrollRaf = requestAnimationFrame(() => {
      _scrollRaf = null;
      const y = window.scrollY;
      const delta = y - _scrollY;
      _scrollY = y;

      // On ignore les micro-scroll
      if (Math.abs(delta) < 4) return;

      const goingDown = delta > 0 && y > 80;
      const goingUp   = delta < 0;

      if (topbar) {
        if (goingDown) {
          topbar.style.transform = "translateY(-100%)";
          topbar.style.transition = "transform .28s cubic-bezier(.4,0,.2,1)";
        } else if (goingUp) {
          topbar.style.transform = "translateY(0)";
          topbar.style.transition = "transform .22s cubic-bezier(.4,0,.2,1)";
        }
      }
      if (bottomNav) {
        if (goingDown) {
          bottomNav.style.transform = "translateY(120%)";
          bottomNav.style.transition = "transform .28s cubic-bezier(.4,0,.2,1)";
        } else if (goingUp) {
          bottomNav.style.transform = "translateY(0)";
          bottomNav.style.transition = "transform .22s cubic-bezier(.4,0,.2,1)";
        }
      }
      // La barre de filtres du catalogue se colle sous la topbar visible
      if (marketPanel) {
        if (goingDown && topbar) {
          marketPanel.style.top = "0";
        } else if (goingUp) {
          marketPanel.style.top = (topbar?.offsetHeight || 60) + "px";
        }
      }
    });
  };

  window.removeEventListener("scroll", window._lastScroll || (() => {}));
  window._lastScroll = onScroll;
  window.addEventListener("scroll", onScroll, { passive: true });
}

function afterRender() {
  renderToast();
  initScrollBehavior();
  if (state.page === "catalogue" && state.catalogueView === "map") {
    requestAnimationFrame(() => initCatalogueMap());
  }
  if (state.page === "detail") {
    const l = listings.find((x) => x.id === state.selectedId) || listings[0];
    renderListingMap("map", l);
    // Scroll auto du chat vers le bas
    const chatMessages = $("#chatMessages");
    if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  if (state.page === "dashboard") {
    const chatMessages = $("#chatMessages");
    if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

render();
