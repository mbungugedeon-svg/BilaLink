// js/pages/home.js
import { shell } from "../components/navbar.js";
import { hero, statsGrid, feature } from "../components/hero.js";
import { listings } from "../data/products.js";
import { PROVINCES } from "../data/provinces.js";
import { i18n } from "../i18n.js";

export function home() {
  const stats = [
    ["2 480+", i18n.statSuppliers()],
    ["930+",   i18n.statBuyers()],
    [listings.length + "+", i18n.statListings()],
    [PROVINCES.length, i18n.statProvinces()],
  ];

  return shell(`
    <main class="landing">
      ${hero()}
      ${statsGrid(stats)}

      <section class="section mvp-section">
        <div class="section-head">
          <h2>${i18n.mvpTitle()}</h2>
          <p>${i18n.mvpSub()}</p>
        </div>
        <div class="mvp-grid">
          <article>
            <span class="eyebrow">${i18n.mvpSupTag()}</span>
            <h3>${i18n.mvpSupTitle()}</h3>
            <ul>
              <li>${i18n.mvpSup1()}</li>
              <li>${i18n.mvpSup2()}</li>
              <li>${i18n.mvpSup3()}</li>
            </ul>
          </article>
          <article>
            <span class="eyebrow">${i18n.mvpBuyTag()}</span>
            <h3>${i18n.mvpBuyTitle()}</h3>
            <ul>
              <li>${i18n.mvpBuy1()}</li>
              <li>${i18n.mvpBuy2()}</li>
              <li>${i18n.mvpBuy3()}</li>
            </ul>
          </article>
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <h2>${i18n.whyTitle()}</h2>
          <p>${i18n.whySub()}</p>
        </div>
        <div class="feature-grid">
          ${feature("leaf",   i18n.feat1Title(), i18n.feat1Text())}
          ${feature("map",    i18n.feat2Title(), i18n.feat2Text())}
          ${feature("phone",  i18n.feat3Title(), i18n.feat3Text())}
          ${feature("chart",  i18n.feat4Title(), i18n.feat4Text())}
          ${feature("shield", i18n.feat5Title(), i18n.feat5Text())}
          ${feature("star",   i18n.feat6Title(), i18n.feat6Text())}
        </div>
      </section>

      <section class="section how">
        <div class="section-head">
          <h2>${i18n.howTitle()}</h2>
          <p>${i18n.howSub()}</p>
        </div>
        <div class="steps">
          ${[i18n.step1(), i18n.step2(), i18n.step3(), i18n.step4()]
            .map((s, i) => `<article><b>${i + 1}</b><span>${s}</span></article>`).join("")}
        </div>
      </section>
    </main>`);
}
