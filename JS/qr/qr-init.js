// ══════════════════════════════════════════════
//  QR INIT — Classe QRGenerator e avvio
//  I dati aziendali vengono da PM (js/common.js)
// ══════════════════════════════════════════════

class QRGenerator {
  constructor() {
    this.initializeElements();
    this.bindEvents();
    this.currentQR = null;
    this.logoImage = null;
    this.generateTimeout = null;

    // Se common.js ha già caricato i dati, usali subito;
    // altrimenti aspetta il callback PM.onDataLoaded
    if (PM.company) {
      this._onReady(PM.company);
    } else {
      PM.onDataLoaded = (data) => this._onReady(data.company);
    }
  }

  _onReady(company) {
    loadQRLogo(company, (img) => { this.logoImage = img; });
  }

  initializeElements() {
    this.typeSelect = document.getElementById("qr-type");
    this.generateBtn = document.getElementById("generate-btn");
    this.downloadBtn = document.getElementById("download-btn");
    this.copyBtn = document.getElementById("copy-btn");
    this.printBtn = document.getElementById("print-btn");
    this.qrContainer = document.getElementById("qr-container");
    this.downloadSection = document.getElementById("download-section");
    this.toast = document.getElementById("toast");
    this.toastMessage = document.getElementById("toast-message");
    this.infoType = document.getElementById("info-type");
    this.infoSize = document.getElementById("info-size");
    this.infoContent = document.getElementById("info-content");
    this.infoLogo = document.getElementById("info-logo");
    this.sizeSelect = document.getElementById("qr-size");

    this.inputs = {
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

    this.inputContainers = {
      text: document.getElementById("text-input"),
      url: document.getElementById("url-input"),
      email: document.getElementById("email-input"),
      phone: document.getElementById("phone-input"),
      whatsapp: document.getElementById("whatsapp-input"),
      wifi: document.getElementById("wifi-input"),
    };
  }

  bindEvents() {
    this.typeSelect.addEventListener("change", () =>
      handleTypeChange(this.typeSelect, this.inputContainers, () => this._clearQR()),
    );
    this.generateBtn.addEventListener("click", () => this.generateQR());
    this.downloadBtn.addEventListener("click", () => downloadQR(this.currentQR));
    this.copyBtn.addEventListener("click", () =>
      copyToClipboard(this.currentQR, (msg, t) => this._showToast(msg, t)),
    );
    this.printBtn.addEventListener("click", () =>
      printQR(this.currentQR, (msg, t) => this._showToast(msg, t)),
    );
    Object.values(this.inputs).forEach((input) => {
      if (input) input.addEventListener("input", () => this.debounceGenerate());
    });
    this.sizeSelect.addEventListener("change", () => this.debounceGenerate());
  }

  debounceGenerate() {
    clearTimeout(this.generateTimeout);
    this.generateTimeout = setTimeout(() => {
      if (this.hasValidInput()) this.generateQR();
    }, 500);
  }

  hasValidInput() {
    const type = this.typeSelect.value;
    if (type === "email") return this.inputs.email?.value?.trim();
    if (type === "whatsapp") return this.inputs.whatsapp?.value?.trim();
    if (type === "wifi") return this.inputs.wifiSsid?.value?.trim();
    return this.inputs[type]?.value?.trim();
  }

  async waitForLogo(maxWait = 5000) {
    return new Promise((resolve) => {
      if (this.logoImage?.complete && this.logoImage.naturalWidth > 0) {
        resolve(true); return;
      }
      const start = Date.now();
      const check = () => {
        if (this.logoImage?.complete && this.logoImage.naturalWidth > 0) resolve(true);
        else if (Date.now() - start > maxWait) resolve(false);
        else setTimeout(check, 100);
      };
      check();
    });
  }

  async generateQR() {
    const company = PM.company;
    if (!company) { this._showToast("Caricamento dati aziendali in corso...", "error"); return; }

    const data = getQRData(this.inputs, this.typeSelect);
    const size = parseInt(this.sizeSelect.value, 10);

    if (!data) { this._showToast("Inserisci i dati richiesti", "error"); return; }

    try {
      if (!this.logoImage && company.logo_qr) {
        await this.waitForLogo(5000);
      }

      const finalCanvas = buildQRCanvas(
        data, size, this.logoImage, company,
        (p) => PM.formatPhoneNumber(p),
      );

      this.qrContainer.innerHTML = "";
      finalCanvas.id = "qrCanvas";
      this.qrContainer.appendChild(finalCanvas);
      this.qrContainer.classList.add("has-qr");
      this.downloadSection.classList.remove("hidden");

      this.currentQR = { canvas: finalCanvas, data, size, type: this.typeSelect.value };
      updateInfoSection(
        this.currentQR,
        this.infoType, this.infoSize, this.infoLogo, this.infoContent,
      );
    } catch (error) {
      console.error("❌ Errore QR:", error);
      this._showToast("Errore generazione QR", "error");
    }
  }

  _clearQR() {
    clearQR(this.qrContainer, this.downloadSection, this.infoType, this.infoSize, this.infoContent);
    this.currentQR = null;
  }

  _showToast(msg, type) {
    showToast(this.toast, this.toastMessage, msg, type);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new QRGenerator();

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });
});