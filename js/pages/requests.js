// js/pages/requests.js
import { shell } from "../components/navbar.js";
import { esc } from "../utils/format.js";
import { buyerRequests } from "../data/products.js";
import { PROVINCES } from "../data/provinces.js";
import { i18n } from "../i18n.js";

export function requests() {
  return shell(`
    <main class="requests">
      <section class="request-form">
        <div class="section-head"><h1>${i18n.reqPageTitle()}</h1><p>${i18n.reqPageSub()}</p></div>
        <form id="requestForm">
          <input name="title" placeholder="${i18n.reqPlaceholder()}" required>
          <input name="budget" placeholder="${i18n.reqBudget()}" required>
          <select name="province">${PROVINCES.map((p) => `<option>${p}</option>`).join("")}</select>
          <input name="date" type="date" min="${new Date().toISOString().slice(0, 10)}" required>
          <button class="btn primary">${i18n.btnPostReq()}</button>
        </form>
      </section>
      <section class="request-list">
        ${buyerRequests.map((r) => `<article class="request-card">
          <strong>${esc(r.title)}</strong>
          <p>${esc(r.buyer)} · ${esc(r.province)} · ${i18n.reqWants()} ${esc(r.date)}</p>
          <span>Budget: ${esc(r.budget)}</span>
          <button class="btn soft" data-reply="${r.id}">${i18n.btnReply()}</button>
          <b>${i18n.reqReplies(r.replies)}</b>
        </article>`).join("")}
      </section>
    </main>`, { bottom: true });
}
