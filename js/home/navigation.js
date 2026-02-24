// ══════════════════════════════════════════════
//  NAVIGATION.JS — Navigazione home ↔ detail e
//                  rendering della vista categoria
// ══════════════════════════════════════════════

function enterArea(index) {
  document.getElementById("screenHome").style.display = "none";
  document.getElementById("screenDetail").style.display = "";
  document.getElementById("backBtn").style.display = "";
  document.getElementById("brandSection").style.display = "none";
  window.scrollTo({ top: 0 });

  const tag = document.getElementById("headerAreaTag");
  const dot = document.getElementById("headerAreaDot");
  const namEl = document.getElementById("headerAreaName");
  const header = document.getElementById("hubHeader");
  tag.style.display = "";

  const stickyBar = document.getElementById("headerSectionTitleRow");
  const stickyTitle = document.getElementById("headerSectionTitleText");
  stickyBar.style.display = "";
  document.body.classList.add("header-expanded");

  const data = DataLoader.getCache();

  if (index === "brands") {
    dot.style.background = "linear-gradient(135deg,#dc2626,#f97316)";
    namEl.textContent = "Brand Ufficiali";
    header.style.setProperty("--hc", "#dc2626");
    header.style.setProperty("--hr", hexToRgb("#dc2626"));
    stickyTitle.textContent = "Brand Ufficiali";
    stickyBar.style.setProperty("--hc", "#dc2626");
    renderBrandPage();
  } else {
    const cat = data.categories[index];
    const rgb = hexToRgb(cat.color);
    dot.style.background = `linear-gradient(135deg,${cat.color},${cat.colorLight || cat.color})`;
    namEl.textContent = cat.name;
    header.style.setProperty("--hc", cat.color);
    header.style.setProperty("--hr", rgb);
    stickyTitle.textContent = cat.name;
    stickyBar.style.setProperty("--hc", cat.color);
    renderCategoryDetail(cat, rgb, cat.color, cat.colorLight || cat.color);
  }
}

function goHome() {
  document.getElementById("screenDetail").style.display = "none";
  document.getElementById("screenHome").style.display = "";
  document.body.classList.remove("header-expanded");

  const sb = document.getElementById("headerSectionTitleRow");
  if (sb) sb.style.display = "none";
  document.getElementById("backBtn").style.display = "none";
  document.getElementById("headerAreaTag").style.display = "none";

  const header = document.getElementById("hubHeader");
  header.style.removeProperty("--hc");
  header.style.removeProperty("--hr");

  // Reset ricerca
  const s = document.getElementById("detailSearch");
  if (s) s.value = "";
  document.getElementById("detailSearchClear")?.classList.remove("visible");

  window.scrollTo({ top: 0 });
}

// ── DETAIL — Griglia link categoria ────────────
function renderCategoryDetail(cat, rgb, color, colorLight) {
  const main = document.getElementById("detailMain");

  function renderCards(query) {
    const q = (query || "").toLowerCase().trim();
    const links = q
      ? cat.links.filter(
          (l) =>
            l.title.toLowerCase().includes(q) ||
            l.description.toLowerCase().includes(q)
        )
      : cat.links;

    if (!links.length) {
      main.innerHTML = `<div class="detail-empty"><div class="detail-empty-icon">🔍</div><p>Nessun risultato per "<strong>${query}</strong>"</p></div>`;
      return;
    }

    main.innerHTML = `
      <br>
      <div class="detail-links-grid">
        ${links
          .map((link) => {
            const isWa = link.title.toLowerCase().includes("whatsapp");
            return `
            <a href="${link.url}" target="_blank" rel="noopener noreferrer"
              class="detail-link-card"
              style="--dc:${color};--dcl:${colorLight};--dcr:${rgb};"
              ${isWa ? 'onclick="openWhatsApp(event)"' : ""}>
              <span class="detail-link-icon">${link.icon}</span>
              <div class="detail-link-info">
                <h3>${highlightText(link.title, query)}</h3>
                <p>${highlightText(link.description, query)}</p>
              </div>
              <svg class="detail-link-arrow" width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </a>`;
          })
          .join("")}
      </div>`;

    main.querySelectorAll(".detail-link-card").forEach((card) => {
      card.addEventListener("mouseenter", () => {
        card.style.boxShadow = `0 8px 32px rgba(${rgb},0.25)`;
        card.style.borderColor = color;
      });
      card.addEventListener("mouseleave", () => {
        card.style.boxShadow = "";
        card.style.borderColor = "";
      });
    });
  }

  renderCards("");
}
