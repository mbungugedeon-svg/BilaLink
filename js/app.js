// js/app.js
import { state, go, toast, setNavigateHandler, setToastRenderer } from "./services/state.js";
import { restoreSession, login, logout } from "./services/auth.js";
import {
  reserveListing, publishListing, publishBuyerRequest, confirmReservation, rejectReservation,
  sendMessage, refreshListings, getConversationKey, loadConversation,
  otherUserIdFromKey, listingIdFromKey, refreshConversationList,
} from "./services/marketplace.js";
import { renderListingMap } from "./components/map.js";
import { $, $$ } from "./utils/helpers.js";
import { esc } from "./utils/format.js";
import { getLang, setLang, i18n } from "./i18n.js";

import { home } from "./pages/home.js";
import { catalogue } from "./pages/catalogue.js";
import { detail } from "./pages/detail.js";
import { publish } from "./pages/publish.js";
import { dashboardBuyer } from "./pages/dashboardBuyer.js";
import { dashboardSeller } from "./pages/dashboardSeller.js";
import { requests } from "./pages/requests.js";
import { prices } from "./pages/prices.js";
import { auth } from "./pages/auth.js";
import { messages as messagesPage } from "./pages/messages.js";
import { listings } from "./data/products.js";
import { newFeedCount } from "./services/feed.js";
import { feed } from "./pages/feed.js";
import { startNotifPolling, setNotifRenderer, markAllRead, refreshNotifications } from "./services/notifications.js";
import { notifDropdown } from "./components/notifPanel.js";

setNotifRenderer((notif) => {
  if (!notif) { renderToast(); return; }
  const box = document.querySelector("#toastStack");
  if (box) {
    const el = document.createElement("div");
    el.className = "toast notif-toast";
    el.innerHTML = notif.icon + " " + notif.text;
    box.prepend(el);
    setTimeout(() => el.remove(), 4000);
  }
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
  messages: () => {
    if (!state.authed) { go("auth"); return ""; }
    return messagesPage();
  },
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

// --- Conversations : chargement paresseux (fetch puis re-render une fois reçu) ---
async function ensureConversationLoaded(key) {
  if (!key || state.conversations[key]) return;
  try {
    await loadConversation(key);
    render();
  } catch (e) {
    console.warn("Conversation indisponible :", e);
  }
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
  $$("[data-reserve]").forEach((b) => b.addEventListener("click", async (e) => {
    e.stopPropagation();
    const success = await reserveListing(b.dataset.reserve);
    if (!state.authed) render();
    else if (success) render();
  }));

  $$("[data-confirm]").forEach((b) => b.addEventListener("click", async () => {
    await confirmReservation(Number(b.dataset.confirm)); render();
  }));
  $$("[data-reject]").forEach((b) => b.addEventListener("click", async () => {
    await rejectReservation(Number(b.dataset.reject)); render();
  }));

  $$("[data-conv-key]").forEach((b) => b.addEventListener("click", () => {
    state.activeConversationId = b.dataset.convKey;
    render();
  }));

  const dashChatSend = $("#dashChatSend");
  if (dashChatSend) {
    dashChatSend.addEventListener("click", async () => {
      const input = $("#dashChatInput");
      const text = input?.value?.trim();
      if (!text) { toast("Écrivez un message."); return; }
      const convKey = dashChatSend.dataset.conv;
      const receiverId = otherUserIdFromKey(convKey);
      const listingId = listingIdFromKey(convKey);
      await sendMessage(convKey, text, { receiverId, listingId });
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

  const openChat = $("#openChat");
  if (openChat) openChat.addEventListener("click", () => {
    if (!state.authed) {
      state.pendingPage = "detail";
      toast("Connectez-vous pour discuter avec ce producteur.");
      go("auth");
      return;
    }
    const sellerId = Number(openChat.dataset.sellerId);
    const listingId = Number(openChat.dataset.listing);
    state.activeConversationId = getConversationKey(sellerId, listingId);
    go("messages");
  });

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

  const pub = $("#publishForm");
  if (pub) pub.addEventListener("submit", async (e) => {
    e.preventDefault();
    const crop = $("#crop")?.value;
    if (!crop) { toast("Sélectionnez un produit."); return; }
    if (!state.publishPhotoData) { toast("Ajoutez une photo du produit."); return; }
    try {
      const listing = await publishListing({
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
    } catch (err) {
      toast("⚠️ " + err.message);
    }
  });

  const req = $("#requestForm");
  if (req) req.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(req);
    const dateValue = fd.get("date");
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const parsed = dateValue ? new Date(dateValue) : null;

    if (!dateValue || isNaN(parsed?.getTime())) {
      toast("⚠️ Merci d'indiquer une date valide.");
      return;
    }
    if (parsed < today) {
      toast("⚠️ La date souhaitée ne peut pas être dans le passé.");
      return;
    }
    if (!fd.get("title")?.trim()) {
      toast("⚠️ Décrivez ce que vous recherchez.");
      return;
    }

    publishBuyerRequest({ title: fd.get("title"), budget: fd.get("budget"), province: fd.get("province"), date: dateValue });
    toast(i18n.toastRequestPosted());
    render();
  });

  $$("[data-reply]").forEach((b) => b.addEventListener("click", () => toast(i18n.toastReplySent())));

  $$(".feed-filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".feed-filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

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
        const badge = $(".notif-badge");
        if (badge) badge.remove();
        const markBtn = $("#markAllReadBtn");
        if (markBtn) markBtn.addEventListener("click", () => { markAllRead(); mount.innerHTML = ""; });
      }
    });
    document.addEventListener("click", () => {
      const mount = $("#notifMount");
      if (mount) mount.innerHTML = "";
    }, { once: false, capture: false });
  }

  $$("[data-view]").forEach((btn) => btn.addEventListener("click", () => {
    state.catalogueView = btn.dataset.view;
    render();
    if (btn.dataset.view === "map") {
      requestAnimationFrame(() => initCatalogueMap());
    }
  }));

  $$("[data-price-crop]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedPriceCrop = btn.dataset.priceCrop;
      render();
    });
  });

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
    if (btn) btn.addEventListener("click", async () => { await logout(); render(); });
  });

  const authForm = $("#authForm");
  if (authForm) {
    authForm.querySelectorAll(".role-card input[type=radio]").forEach((radio) => {
      radio.addEventListener("change", () => {
        authForm.querySelectorAll(".role-card").forEach((c) => c.classList.remove("selected"));
        radio.closest(".role-card")?.classList.add("selected");
      });
    });
    $$("[data-auth-mode]").forEach((btn) => btn.addEventListener("click", () => {
      state.authMode = btn.dataset.authMode;
      render();
    }));
    authForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(authForm);
      const mode = state.authMode === "login" ? "login" : "register";
      const phone = fd.get("phone")?.trim();
      const email = fd.get("email")?.trim() || phone;
      const password = fd.get("password")?.trim();
      if (!phone) { toast("Le numéro de téléphone est requis."); return; }
      if (!password) { toast("Le mot de passe est requis."); return; }
      if (mode === "register" && !fd.get("name")?.trim()) { toast("Votre nom est requis."); return; }

      await login({
        name: fd.get("name")?.trim(),
        phone,
        email,
        province: fd.get("province"),
        city: fd.get("city"),
        role: fd.get("role"),
        password,
      }, mode);
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
    container._leaflet_id = null;
    container.innerHTML = "";
  }

  const dataEl = document.getElementById("mapData");
  let mapListings = [];
  try { mapListings = JSON.parse(dataEl?.textContent || "[]"); } catch {}

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

  mapListings.forEach((l) => {
    if (!l.coords) return;
    const [lat, lng] = l.coords;
    const marker = L.marker([lat, lng], { icon: l.verified ? verifiedIcon : greenIcon });
    marker.bindPopup(`
      <div style="min-width:160px;font-family:sans-serif">
        <strong style="font-size:14px">${l.crop}</strong><br>
        <span style="color:#16a34a;font-size:16px;font-weight:700">${Number(l.price).toLocaleString("fr-FR")} FC</span>
        <span style="font-size:12px;color:#64748b"> / ${l.unit}</span><br>
        <span style="font-size:12px;color:#475569">👤 ${l.seller}</span><br>
        <span style="font-size:12px;color:#475569">📍 ${l.city}, ${l.province}</span><br>
        <button onclick="window.__goDetail(${l.id})"
          style="margin-top:8px;background:#16a34a;color:white;border:none;border-radius:6px;padding:6px 12px;font-size:12px;cursor:pointer;width:100%">
          Voir l'offre →
        </button>
      </div>`);
    marker.addTo(map);
  });

  window.__goDetail = (id) => {
    state.selectedId = id;
    go("detail");
  };
}

let lastRenderedPage = null;

function afterRender() {
  renderToast();
  if (state.page === "catalogue" && state.catalogueView === "map") {
    requestAnimationFrame(() => initCatalogueMap());
  }
  if (state.page === "detail") {
    const l = listings.find((x) => x.id === state.selectedId) || listings[0];
    renderListingMap("map", l);
  }
  if (state.page === "messages" && state.authed) {
    // On vient d'arriver sur la page (pas juste re-rendu suite à un clic sur
    // la page elle-même) : on recharge la liste depuis le serveur, sinon un
    // message reçu pendant que l'utilisateur n'avait rien envoyé/ouvert
    // lui-même resterait invisible (liste en mémoire périmée).
    if (lastRenderedPage !== "messages") {
      refreshConversationList().then(() => render());
    }
    const activeKey = state.activeConversationId || state.conversationList?.[0]?.conversationKey;
    if (activeKey) ensureConversationLoaded(activeKey);
    const chatMessages = $("#chatMessages");
    if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  lastRenderedPage = state.page;
}

async function bootstrap() {
  try {
    await refreshListings();
  } catch (e) {
    console.warn("Catalogue indisponible (backend non démarré ?) :", e);
  }
  await restoreSession();
  render();
  startNotifPolling();
}

bootstrap();
