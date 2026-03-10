// ══════════════════════════════════════════════
//  QR FOOTER — Popolamento footer e caricamento logo
// ══════════════════════════════════════════════

function updateQRFooter(companyData, formatPhoneNumber) {
  if (!companyData) return;

  const setEl = (id, fn) => {
    const el = document.getElementById(id);
    if (el) fn(el);
  };

  setEl("companyName", (el) => (el.textContent = companyData.fullName.toUpperCase()));

  setEl("fullAddress", (el) => {
    const addressText = `${companyData.address}, ${companyData.cap} ${companyData.city} (${companyData.province})`;
    el.textContent = addressText;
    el.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressText)}`;
  });

  setEl("footerPhone", (el) => {
    el.href = `tel:${companyData.phone}`;
    el.textContent = `Tel: ${formatPhoneNumber(companyData.phone)}`;
  });

  setEl("footerEmail", (el) => {
    el.href = `mailto:${companyData.email}`;
    el.textContent = `Email: ${companyData.email}`;
  });

  setEl("footerWhatsApp", (el) => {
    const phoneNumber = companyData.phone.replace(/\+/g, "").replace(/\s/g, "");
    el.href = `https://wa.me/${phoneNumber}`;
    el.textContent = `WhatsApp: ${formatPhoneNumber(companyData.phone)}`;
  });

  setEl("footerPiva", (el) => (el.textContent = `P.IVA: ${companyData.piva}`));

  const footerLogo = document.getElementById("footerLogo");
  if (companyData.logo && footerLogo) footerLogo.src = companyData.logo;
}

function loadQRLogo(companyData, onLoad) {
  if (!companyData?.logo_qr) { onLoad(null); return; }
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => onLoad(img);
  img.onerror = () => onLoad(null);
  img.src = companyData.logo_qr;
}
