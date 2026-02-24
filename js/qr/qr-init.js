// ══════════════════════════════════════════════
//  QR-INIT.JS — Entry point di qr.html
// ══════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", async () => {
  // ── Riferimenti DOM form ──────────────────────
  const inputs = {
    text: document.getElementById("qr-text"),
    url: document.getElementById("qr-url"),
    email: document.getElementById("qr-email"),
    emailSubject: document.getElementById("qr-email-subject"),
    emailBody: document.getElementById("qr-email-body"),
    phone: document.getElementById("qr-phone"),
    whatsapp: document.getElementById("qr-whatsapp"),
    whatsappMessage: document.getElementById("qr-whatsapp-message"),
    wifiSsid: document.getElementById("wifi-ssid"),
    wifiPassword: document.getElementById("wifi-password"),
    wifiSecurity: document.getElementById("wifi-security"),
  };

  const inputContainers = {
    text: document.getElementById("text-input"),
    url: document.getElementById("url-input"),
    email: document.getElementById("email-input"),
    phone: document.getElementById("phone-input"),
    whatsapp: document.getElementById("whatsapp-input"),
    wifi: document.getElementById("wifi-input"),
  };

  const typeSelect = document.getElementById("qr-type");
  const sizeSelect = document.getElementById("qr-size");

  // Inizializzazione moduli
  QRUI.init();
  QRCore.init(inputs, typeSelect, sizeSelect);

  // ── Caricamento Dati e Logo Specifico QR ──────
  try {
    const data = await DataLoader.load();

    // Genera il footer unificato
    renderFooter(data.company);

    // Passa i dati aziendali al canvas
    QRCanvas.setCompanyData(data.company);

    // Carica il logo specifico per il QR (logo_qr dal JSON)
    const qrLogoPath = data.company.logo_qr || data.company.logo; // fallback su logo se logo_qr manca
    if (qrLogoPath) {
      const img = new Image();
      img.src = qrLogoPath;
      // Imposta il logo nel modulo Canvas
      QRCanvas.setLogo(img);
    }

    console.log("✅ Dati caricati. Logo QR impostato da:", qrLogoPath);
  } catch (e) {
    console.error("❌ Errore caricamento:", e);
  }

  // ── Logica Generazione ────────────────────────
  let generateTimeout;
  function debounceGenerate() {
    clearTimeout(generateTimeout);
    generateTimeout = setTimeout(() => {
      if (QRCore.hasValidInput()) generateQR();
    }, 500);
  }

  async function generateQR() {
    const data = QRCore.getQRData();
    const size = QRCore.getSize();

    if (!data) return;

    try {
      const canvas = await QRCanvas.render(data, size);
      QRUI.showCanvas(canvas, data, size, QRCore.getType());
    } catch (err) {
      console.error("❌ Errore generazione QR:", err);
    }
  }

  // Event Listeners
  typeSelect.addEventListener("change", () =>
    QRCore.handleTypeChange(inputContainers, QRUI.clearQR),
  );
  document
    .getElementById("generate-btn")
    ?.addEventListener("click", generateQR);

  Object.values(inputs).forEach((input) => {
    if (input) input.addEventListener("input", debounceGenerate);
  });
  sizeSelect.addEventListener("change", debounceGenerate);
});
