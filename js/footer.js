// ══════════════════════════════════════════════
//  FOOTER.JS — Generazione Dinamica Totale
// ══════════════════════════════════════════════

/**
 * Genera l'intera struttura HTML del footer e la inietta nel contenitore.
 * @param {Object} company - I dati provenienti da data.json
 */
function renderFooter(company) {
  const footer = document.getElementById("siteFooter");
  if (!footer) return;

  const fullAddress = `${company.address}, ${company.cap} ${company.city} (${company.province})`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  const waNumber = company.phone.replace(/\+/g, "").replace(/\s/g, "");
  const currentYear = new Date().getFullYear();

  footer.innerHTML = `
    <div class="footer-content">
      <div class="footer-logo-section" id="footerCompanyCol">
        ${company.logo ? `<img src="${company.logo}" class="footer-logo" alt="Logo ${company.fullName}" onerror="this.remove()">` : ""}
        <h2 class="footer-company-name">${company.fullName}</h2>
        <p class="footer-address">
          <a href="${mapsUrl}" class="footer-link" target="_blank" rel="noopener noreferrer">
            ${fullAddress}
          </a>
        </p>
      </div>
      <div class="footer-grid">
        <div class="footer-col">
          <h4>Contatti</h4>
          <p><a href="tel:${company.phone}" class="footer-link">Tel: ${formatPhoneNumber(company.phone)}</a></p>
          <p><a href="mailto:${company.email}" class="footer-link">Email: ${company.email}</a></p>
          <p>
            <a href="https://wa.me/${waNumber}" class="footer-link" target="_blank" rel="noopener noreferrer">
              WhatsApp: ${formatPhoneNumber(company.phone)}
            </a>
          </p>
        </div>
        <div class="footer-col">
          <h4>Dati Legali</h4>
          <p>P.IVA: ${company.piva}</p>
          <p class="footer-copyright">
            &copy; <span>${currentYear}</span> Tutti i diritti riservati
          </p>
        </div>
      </div>
    </div>
  `;
}