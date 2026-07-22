// js/pages/messages.js
import { shell } from "../components/navbar.js";
import { state } from "../services/state.js";
import { esc, initials } from "../utils/format.js";

export function messages() {
  if (!state.authed) {
    return shell(`
      <main class="dashboard">
        <div class="empty-hint" style="margin-top:60px">
          <p>Connectez-vous pour voir vos messages.</p>
          <button class="btn primary" data-go="auth">Se connecter</button>
        </div>
      </main>`, { bottom: true });
  }

  const user = state.currentUser;
  const convList = state.conversationList || [];
  const activeKey = state.activeConversationId || convList[0]?.conversationKey || null;
  const activeMessages = activeKey ? (state.conversations[activeKey] || []) : [];

  const convListHtml = convList.length === 0
    ? `<p class="empty-hint" style="padding:16px">Aucune conversation pour l'instant. Ouvrez une fiche produit pour en démarrer une.</p>`
    : convList.map((c) => {
        const last = c.lastMessage;
        const unread = last && last.receiverId === user.id && !last.read;
        return `<button class="conversation ${c.conversationKey === activeKey ? 'active' : ''}" data-conv-key="${esc(c.conversationKey)}">
          <span class="avatar">${last ? initials(last.senderName) : "?"}</span>
          <span><strong>${esc(last?.senderName || "Conversation")}</strong><small>${esc(last?.text?.slice(0, 40) || "—")}</small></span>
          ${unread ? `<b>●</b>` : ""}
        </button>`;
      }).join("");

  const messagesHtml = activeMessages.length === 0
    ? `<div class="chat-empty">Aucun message dans cette conversation.</div>`
    : activeMessages.slice().reverse().map((m) => `
        <div class="bubble ${m.senderId === user.id ? 'me' : 'other'}">
          <span class="bubble-name">${esc(m.senderName)}</span>
          <p>${esc(m.text)}</p>
          <small>${esc(m.time)}</small>
        </div>`).join("");

  return shell(`
    <main class="dashboard">
      <div class="section-head">
        <h1>💬 Messages</h1>
        <p>Toutes vos discussions avec les producteurs et acheteurs, au même endroit.</p>
      </div>
      <section class="panel inbox">
        <div class="inbox-grid">
          <div class="conversation-list">${convListHtml}</div>
          <div class="chat-box">
            <div class="chat-messages" id="chatMessages" style="max-height:420px;overflow-y:auto">${messagesHtml}</div>
            ${activeKey ? `
            <div class="chat-input-row" style="margin-top:10px">
              <input id="dashChatInput" placeholder="Écrire un message..." maxlength="500">
              <button class="btn primary" id="dashChatSend" data-conv="${activeKey}">Envoyer</button>
            </div>` : `<p class="empty-hint" style="padding:12px;font-size:13px">Sélectionnez une conversation à gauche.</p>`}
          </div>
        </div>
      </section>
    </main>`, { bottom: true });
}
