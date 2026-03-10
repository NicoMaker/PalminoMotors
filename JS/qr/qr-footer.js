// ══════════════════════════════════════════════
//  QR FOOTER — Usa PM.populateFooter da common.js
//  Il footer viene già popolato da common.js.
//  Qui gestiamo solo il logo QR (logo_qr diverso da logo).
// ══════════════════════════════════════════════

function loadQRLogo(companyData, onLoad) {
  if (!companyData?.logo_qr) { onLoad(null); return; }
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => onLoad(img);
  img.onerror = () => onLoad(null);
  img.src = companyData.logo_qr;
}