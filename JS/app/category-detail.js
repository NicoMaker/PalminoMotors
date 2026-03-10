// ══════════════════════════════════════════════
//  CATEGORY DETAIL — Render link cards per categoria
// ══════════════════════════════════════════════

function renderCategoryDetail(cat, rgb, color, colorLight) {
  const main = document.getElementById("detailMain");

  function renderCards(query) {
    const q = (query || "").toLowerCase().trim();
    const links = q
      ? cat.links.filter(
          (l) =>
            l.title.toLowerCase().includes(q) ||
            l.description.toLowerCase().includes(q),
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
            const isGmail = link.title.toLowerCase().includes("gmail");
            return `
            <a href="${link.url}" target="_blank" rel="noopener noreferrer"
              class="detail-link-card"
              style="--dc:${color};--dcl:${colorLight};--dcr:${rgb};"
              ${isWa ? 'onclick="openWhatsApp(event)"' : ""}
              ${isGmail ? 'onclick="openMail(event)"' : ""}>
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
