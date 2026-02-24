// ══════════════════════════════════════════════
//  QR-INIT.JS — Entry point di qr.html
//  Carica data.json (tramite DataLoader condiviso)
//  e orchestra QRCore, QRCanvas e QRUI.
// ══════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", async () => {
  // Anno automatico
  updateYear();
  scheduleYearUpdate();

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

  // ── Inizializzazione moduli ───────────────────
  QRCore.init(inputs, typeSelect, sizeSelect);
  QRUI.init();

  // ── Caricamento dati aziendali ────────────────
  try {
    const data = await DataLoader.load();
    QRCanvas.setCompanyData(data.company);
    QRUI.populateQRFooter(data.company);

    // Precarica il logo per il QR
    if (data.company.logo_qr) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => QRCanvas.setLogo(img);
      img.onerror = () => console.warn("⚠️ Logo QR non caricato:", img.src);
      img.src = data.company.logo_qr;
    }

    console.log("✅ Dati aziendali caricati da data.json");
  } catch (err) {
    console.error("❌ Errore caricamento data.json:", err);
  }

  // ── Debounce per generazione automatica ───────
  let generateTimeout = null;
  function debounceGenerate() {
    clearTimeout(generateTimeout);
    generateTimeout = setTimeout(() => {
      if (QRCore.hasValidInput()) generateQR();
    }, 500);
  }

  // ── Generazione QR ────────────────────────────
  async function generateQR() {
    const data = QRCore.getQRData();
    const size = QRCore.getSize();

    if (!data) {
      QRUI.showToast("Inserisci i dati richiesti", "error");
      return;
    }

    if (!DataLoader.getCache()) {
      QRUI.showToast("Caricamento dati aziendali in corso...", "error");
      return;
    }

    try {
      const canvas = await QRCanvas.render(data, size);
      QRUI.showCanvas(canvas, data, size, QRCore.getType());
    } catch (err) {
      console.error("❌ Errore QR:", err);
      QRUI.showToast("Errore generazione QR", "error");
    }
  }

  // ── Event listeners ───────────────────────────
  typeSelect.addEventListener("change", () =>
    QRCore.handleTypeChange(inputContainers, QRUI.clearQR)
  );

  document.getElementById("generate-btn")
    ?.addEventListener("click", generateQR);

  document.getElementById("download-btn")
    ?.addEventListener("click", () => QRUI.downloadQR());

  document.getElementById("copy-btn")
    ?.addEventListener("click", () => QRUI.copyToClipboard());

  document.getElementById("print-btn")
    ?.addEventListener("click", () => QRUI.printQR());

  Object.values(inputs).forEach((input) => {
    if (input) input.addEventListener("input", debounceGenerate);
  });

  sizeSelect.addEventListener("change", debounceGenerate);
});
