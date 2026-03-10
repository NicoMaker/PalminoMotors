// ══════════════════════════════════════════════
//  FOOTER — Popolamento dati aziendali nel footer
// ══════════════════════════════════════════════

function populateFooter(company) {
  const setEl = (id, fn) => {
    const el = document.getElementById(id);
    if (el) fn(el);
  };

  setEl("companyName", (el) => (el.textContent = company.fullName));

  setEl("fullAddress", (el) => {
    const full = `${company.address}, ${company.cap} ${company.city} (${company.province})`;
    el.textContent = full;
    el.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(full)}`;
  });

  setEl("footerPhone", (el) => {
    el.href = `tel:${company.phone}`;
    el.textContent = `Tel: ${formatPhoneNumber(company.phone)}`;
  });

  setEl("footerEmail", (el) => {
    el.href = "https://mail.google.com";
    el.target = "_blank";
    el.rel = "noopener noreferrer";
    el.textContent = `Email: ${company.email}`;
  });

  setEl("footerWhatsApp", (el) => {
    const n = company.phone.replace(/\+/g, "").replace(/\s/g, "");
    el.href = `https://wa.me/${n}`;
    el.textContent = `WhatsApp: ${formatPhoneNumber(company.phone)}`;
    el.onclick = openWhatsApp;
  });

  setEl("footerPiva", (el) => (el.textContent = `P.IVA: ${company.piva}`));

  const footerCol = document.getElementById("footerCompanyCol");
  if (footerCol && company.logo) {
    const img = document.createElement("img");
    img.src = company.logo;
    img.className = "footer-logo";
    img.alt = "Logo";
    img.onerror = () => img.remove();
    footerCol.prepend(img);
  }
}
