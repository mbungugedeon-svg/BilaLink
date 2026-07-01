// js/pages/publish.js
import { shell } from "../components/navbar.js";
import { selectField, inputField } from "../components/formFields.js";
import { icon, allCrops } from "../utils/helpers.js";
import { esc } from "../utils/format.js";
import { state } from "../services/state.js";
import { PROVINCES } from "../data/provinces.js";
import { i18n } from "../i18n.js";

export function publish() {
  const qualityOptions = [
    i18n.qualStandard(),
    i18n.qualGood(),
    i18n.qualPremium(),
    i18n.qualFresh(),
  ];

  // Aperçu de la photo sélectionnée
  const photoPreview = state.publishPhotoData
    ? `<div class="photo-preview-wrap">
        <img id="photoPreview" src="${state.publishPhotoData}" alt="Aperçu">
        <button type="button" class="btn ghost compact" id="removePhoto">✕ Supprimer</button>
       </div>`
    : `<div class="upload-zone" id="uploadZone">
        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <strong>Cliquez ou glissez votre photo ici</strong>
        <small>JPG, PNG, WEBP · Max 5 Mo</small>
       </div>`;

  return shell(`
    <main class="form-layout">
      <section class="form-card">
        <div class="section-head">
          <h1>${i18n.publishTitle()}</h1>
          <p>${i18n.publishSub()}</p>
        </div>
        <form id="publishForm">

          <div class="photo-upload-section">
            <label class="field"><span>📸 Photo du produit <strong style="color:var(--danger)">*</strong></span></label>
            <input type="file" id="photoInput" accept="image/*" style="display:none">
            <div id="photoArea">${photoPreview}</div>
            ${!state.publishPhotoData
              ? `<button type="button" class="btn soft wide" id="triggerPhoto">📷 Choisir une photo</button>`
              : ""}
          </div>

          <div class="form-grid">
            ${selectField("crop", i18n.fieldProduct(), allCrops(), "Manioc")}
            ${inputField("qty", i18n.fieldStock(), "text", "")}
            ${inputField("price", i18n.fieldPrice(), "number", "")}
            ${inputField("unit", i18n.fieldUnit(), "text", "")}
            ${selectField("provincePub", i18n.filterProvince(), PROVINCES, "Kinshasa")}
            ${inputField("cityPub", i18n.filterCity(), "text", "")}
          </div>

          <label class="field">
            <span>${i18n.fieldDesc()}</span>
            <textarea id="desc" rows="3" placeholder="${i18n.descPlaceholder()}"></textarea>
          </label>

          <div class="form-grid">
            ${selectField("quality", i18n.fieldQuality(), qualityOptions, qualityOptions[1])}
            ${inputField("harvestDate", i18n.fieldHarvest(), "date", "")}
          </div>

          <details class="filters">
            <summary>${i18n.advOptions()}</summary>
            <div class="toggles">
              <label><input id="availableNow" type="checkbox" checked> ${i18n.optAvailNow()}</label>
              <label><input id="delivery" type="checkbox"> ${i18n.optDelivery()}</label>
              <label><input id="negotiable" type="checkbox" checked> ${i18n.optNeg()}</label>
            </div>
          </details>

          <div class="ai-box">
            <button type="button" class="btn soft" id="aiHelp">${icon("bot")} ${i18n.aiBtn()}</button>
            <p id="aiText">${esc(state.aiText || i18n.aiDefault())}</p>
          </div>

          <button class="btn primary wide" type="submit" id="publishSubmit">
            🚀 ${i18n.btnPublish()}
          </button>
        </form>
      </section>
    </main>`, { bottom: true });
}
