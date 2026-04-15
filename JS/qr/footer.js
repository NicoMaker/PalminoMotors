// ══════════════════════════════════════════════════════════════════════════════
//  QR FOOTER — Carica il logo per il canvas QR
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Carica l'immagine del logo per il QR
 * @param {Object} company - I dati dell'azienda da dati.json
 * @param {Function} onLoad - Callback quando l'immagine è caricata
 */
function loadQRLogo(company, onLoad) {
  if (!company?.logo_qr) {
    console.warn("⚠️ logo_qr non trovato in dati.json");
    onLoad(null);
    return;
  }

  const img = new Image();
  img.crossOrigin = "anonymous";

  // Siamo in: qr/qr.html → '../img/Logo2.png' è il percorso corretto
  const logoPath = "../" + company.logo_qr;

  console.log("📸 Tentativo caricamento logo da:", logoPath);

  img.onload = () => {
    console.log("✅ Logo QR caricato correttamente");
    onLoad(img);
  };

  img.onerror = () => {
    console.error("❌ Errore caricamento logo QR. Percorso:", logoPath);
    onLoad(null);
  };

  img.src = logoPath;
}