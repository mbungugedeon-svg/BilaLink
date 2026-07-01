// js/components/notifPanel.js
import { notifHistory, markAllRead, unreadCount } from "../services/notifications.js";
import { esc } from "../utils/format.js";

export function notifBell() {
  const count = unreadCount();
  return `
    <button class="notif-bell" id="notifBellBtn" aria-label="Notifications">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      ${count > 0 ? `<span class="notif-badge">${count > 9 ? "9+" : count}</span>` : ""}
    </button>`;
}

export function notifDropdown() {
  const items = notifHistory.slice(0, 10);
  return `
    <div class="notif-dropdown" id="notifDropdown">
      <div class="notif-header">
        <strong>Notifications</strong>
        <button class="link-btn" id="markAllReadBtn">Tout marquer lu</button>
      </div>
      <div class="notif-list">
        ${items.length === 0
          ? `<div class="notif-empty">Aucune notification.</div>`
          : items.map((n) => `
            <div class="notif-item ${n.read ? "" : "unread"}">
              <span class="notif-icon">${n.icon}</span>
              <div class="notif-body">
                <p>${esc(n.text)}</p>
                <small>${esc(n.time)}</small>
              </div>
            </div>`).join("")
        }
      </div>
    </div>`;
}
