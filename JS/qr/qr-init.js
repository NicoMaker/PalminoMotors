// ══════════════════════════════════════════════
//  QR INIT — Classe QRGenerator e avvio
// ══════════════════════════════════════════════

class QRGenerator {
  constructor() {
    this.initializeElements();
    this.bindEvents();
    this.currentQR = null;
    this.logoImage = null;
    this.companyData = null;
    this.generateTimeout = null;
    this.loadCompanyData();
    this.setCurrentYear();
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

  setCurrentYear() {
    const el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();

    const now = new Date();
    const nextYear = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0, 0);
    setTimeout(() => {
      const e = document.getElementById("year");
      if (e) e.textContent = new Date().getFullYear();
      setInterval(() => {
        const e2 = document.getElementById("year");
        if (e2) e2.textContent = new Date().getFullYear();
      }, 365.25 * 24 * 60 * 60 * 1000);
    }, nextYear - now);
  }

  async loadCompanyData() {
    try {
      const response = await fetch("data.json");
      const data = await response.json();
      this.companyData = data.company;
      updateQRFooter(this.companyData, (p) => this._formatPhone(p));
      loadQRLogo(this.companyData, (img) => { this.logoImage = img; });
    } catch (error) {
      console.error("❌ Errore caricamento data.json:", error);
      this.companyData = {};
      updateQRFooter(this.companyData, (p) => this._formatPhone(p));
    }
  }

  _formatPhone(phone) {
    if (!phone) return phone;
    let c = phone.replace(/\s+/g, "");
    if (c.startsWith("+39")) return c.replace(/(\+39)(\d{3})(\d{3})(\d{4})/, "$1 $2 $3 $4");
    if (c.startsWith("+")) return c.replace(/(\+\d{1,3})(\d{3})(\d{3})(\d{4})/, "$1 $2 $3 $4");
    if (c.length === 10) return c.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
    if (c.length > 6) return c.replace(/(\d{3})(?=\d)/g, "$1 ");
    return phone;
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
    const data = getQRData(this.inputs, this.typeSelect);
    const size = parseInt(this.sizeSelect.value, 10);

    if (!data) { this._showToast("Inserisci i dati richiesti", "error"); return; }
    if (!this.companyData) { this._showToast("Caricamento dati aziendali in corso...", "error"); return; }

    try {
      if (!this.logoImage && this.companyData.logo_qr) {
        await this.waitForLogo(5000);
      }

      const finalCanvas = buildQRCanvas(
        data, size, this.logoImage, this.companyData, (p) => this._formatPhone(p),
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
