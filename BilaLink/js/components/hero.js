// js/components/hero.js
import { icon } from "../utils/helpers.js";
import { i18n } from "../i18n.js";

export function hero() {
  return `<section class="hero">
    <div class="hero-copy">
      <span class="eyebrow">${i18n.badge()}</span>
      <h1>${i18n.heroTitle()}</h1>
      <p>${i18n.heroSub()}</p>
      <div class="hero-actions">
        <button class="btn primary" data-go="catalogue">${icon("search")} ${i18n.btnExplore()}</button>
        <button class="btn soft" data-go="publish">${icon("plus")} ${i18n.btnList()}</button>
      </div>
    </div>
    <div class="hero-media" aria-label="Agricultural producers">
      <img src="https://i.pinimg.com/1200x/2f/ac/2d/2fac2d20c9055bb5e19ee0b893c4c9bb.jpg" alt="Sunny agricultural field">
      <div class="floating-card">
        <strong>${i18n.cardContact()}</strong>
        <span>${i18n.cardContactSub()}</span>
      </div>
    </div>
  </section>`;
}

export function statsGrid(stats) {
  return `<section class="stats-grid">${stats.map(([n, l]) => `<article><strong>${n}</strong><span>${l}</span></article>`).join("")}</section>`;
}

export function feature(iconName, title, text) {
  return `<article class="feature">${icon(iconName)}<h3>${title}</h3><p>${text}</p></article>`;
}
