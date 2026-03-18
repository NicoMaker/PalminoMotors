// ══════════════════════════════════════════════════════════════════════════════
//  QR FOOTER — VERSIONE SEMPLIFICATA E CORRETTA
//  Questo file carica il logo nel footer della pagina QR
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Carica l'immagine del logo per il QR
 * @param {Object} companyData - I dati dell'azienda da data.json
 * @param {Function} onLoad - Callback quando l'immagine è caricata
 */
function loadQRLogo(companyData, onLoad) {
  // Se non esiste logo_qr nei dati, skip
  if (!companyData?.logo_qr) {
    console.warn("⚠️ logo_qr non trovato in data.json");
    onLoad(null);
    return;
  }

  const img = new Image();
  img.crossOrigin = "anonymous";

  // 🔧 SOLUZIONE SEMPLICE:
  // - companyData.logo_qr = "img/Logo2.png" (dal data.json)
  // - Siamo in: qr/qr.html
  // - Quindi: '../img/Logo2.png' è il percorso corretto

  const logoPath = "../" + companyData.logo_qr;

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
