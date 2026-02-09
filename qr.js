class PalminoQRGenerator {
  constructor() {
    this.initializeElements();
    this.bindEvents();
    this.currentQR = null;
    this.logoImage = null;
    this.companyData = null;
    this.loadCompanyData();
    this.setCurrentYear();
  }

  initializeElements() {
    this.typeSelect = document.getElementById("qr-type");
    this.generateBtn = document.getElementById("generate-btn");
    this.downloadBtn = document.getElementById("download-btn");
    this.copyBtn = document.getElementById("copy-btn");
    this.qrContainer = document.getElementById("qr-container");
    this.downloadSection = document.getElementById("download-section");
    this.toast = document.getElementById("toast");
    this.toastMessage = document.getElementById("toast-message");

    this.infoType = document.getElementById("info-type");
    this.infoSize = document.getElementById("info-size");
    this.infoContent = document.getElementById("info-content");
    this.infoLogo = document.getElementById("info-logo");

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

    this.sizeSelect = document.getElementById("qr-size");
  }

  bindEvents() {
    this.typeSelect.addEventListener("change", () => this.handleTypeChange());
    this.generateBtn.addEventListener("click", () => this.generateQR());
    this.downloadBtn.addEventListener("click", () => this.downloadQR());
    this.copyBtn.addEventListener("click", () => this.copyToClipboard());

    Object.values(this.inputs).forEach((input) => {
      if (input) input.addEventListener("input", () => this.debounceGenerate());
    });

    this.sizeSelect.addEventListener("change", () => this.debounceGenerate());
  }

  setCurrentYear() {
    const yearElement = document.getElementById("year");
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }

  async loadCompanyData() {
    try {
      const response = await fetch("../data.json");
      const data = await response.json();
      this.companyData = data.company;
      
      this.updateFooter();
      this.loadLogo();
      
      console.log("Dati aziendali caricati con successo da data.json");
    } catch (error) {
      console.error("Errore caricamento data.json:", error);
      this.companyData = {};
      this.updateFooter();
      this.loadLogo();
    }
  }

  updateFooter() {
    if (!this.companyData) return;

    const companyName = document.getElementById("companyName");
    if (companyName) {
      companyName.textContent = this.companyData.fullName.toUpperCase();
    }

    const fullAddress = document.getElementById("fullAddress");
    if (fullAddress) {
      const addressText = `${this.companyData.address}, ${this.companyData.cap} ${this.companyData.city} (${this.companyData.province})`;
      fullAddress.textContent = addressText;
      fullAddress.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressText)}`;
    }

    const footerPhone = document.getElementById("footerPhone");
    if (footerPhone) {
      footerPhone.href = `tel:${this.companyData.phone}`;
      footerPhone.textContent = `Tel: ${this.companyData.phone}`;
    }

    const footerEmail = document.getElementById("footerEmail");
    if (footerEmail) {
      footerEmail.href = `mailto:${this.companyData.email}`;
      footerEmail.textContent = `Email: ${this.companyData.email}`;
    }

    const footerWhatsApp = document.getElementById("footerWhatsApp");
    if (footerWhatsApp) {
      const phoneNumber = this.companyData.phone.replace(/\+/g, "").replace(/\s/g, "");
      footerWhatsApp.href = `https://wa.me/${phoneNumber}`;
      footerWhatsApp.textContent = `WhatsApp: ${this.companyData.phone}`;
    }

    const footerPiva = document.getElementById("footerPiva");
    if (footerPiva) {
      footerPiva.textContent = `P.IVA: ${this.companyData.piva}`;
    }

    const headerLogo = document.getElementById("headerLogo");
    const footerLogo = document.getElementById("footerLogo");
    if (this.companyData.logo) {
      if (headerLogo) headerLogo.src = this.companyData.logo;
      if (footerLogo) footerLogo.src = this.companyData.logo;
    }
  }

  loadLogo() {
    if (!this.companyData) return;
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      this.logoImage = img;
      console.log("Logo Palmino Motors caricato con successo");
    };
    img.onerror = () => {
      console.warn("Logo non trovato, QR verrà generato senza logo");
    };
    img.src = this.companyData.logo_qr || "../img/logo_qr.png";
  }

  handleTypeChange() {
    const selectedType = this.typeSelect.value;
    Object.values(this.inputContainers).forEach((container) =>
      container.classList.add("hidden"),
    );
    if (this.inputContainers[selectedType]) {
      this.inputContainers[selectedType].classList.remove("hidden");
    }
    this.clearQR();
  }

  debounceGenerate() {
    clearTimeout(this.generateTimeout);
    this.generateTimeout = setTimeout(() => {
      if (this.hasValidInput()) this.generateQR();
    }, 500);
  }

  hasValidInput() {
    const type = this.typeSelect.value;
    
    switch(type) {
      case 'email':
        return this.inputs.email?.value?.trim();
      case 'whatsapp':
        return this.inputs.whatsapp?.value?.trim();
      case 'wifi':
        return this.inputs.wifiSsid?.value?.trim();
      default:
        return this.inputs[type]?.value?.trim();
    }
  }

  getQRData() {
    const type = this.typeSelect.value;
    
    switch (type) {
      case "text":
        return this.inputs.text.value.trim();
      
      case "url":
        let url = this.inputs.url.value.trim();
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          url = "https://" + url;
        }
        return url;
      
      case "email":
        const email = this.inputs.email.value.trim();
        const subject = this.inputs.emailSubject.value.trim();
        const body = this.inputs.emailBody.value.trim();
        let emailUrl = `mailto:${email}`;
        const params = [];
        if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
        if (body) params.push(`body=${encodeURIComponent(body)}`);
        if (params.length) emailUrl += "?" + params.join("&");
        return emailUrl;
      
      case "phone":
        return `tel:${this.inputs.phone.value.trim()}`;
      
      case "whatsapp":
        const waNumber = this.inputs.whatsapp.value.trim().replace(/\D/g, '');
        const waMessage = this.inputs.whatsappMessage.value.trim();
        let waUrl = `https://wa.me/${waNumber}`;
        if (waMessage) waUrl += `?text=${encodeURIComponent(waMessage)}`;
        return waUrl;
      
      case "wifi":
        const ssid = this.inputs.wifiSsid.value.trim();
        const password = this.inputs.wifiPassword.value.trim();
        const security = this.inputs.wifiSecurity.value;
        return `WIFI:T:${security};S:${ssid};P:${password};;`;
      
      default:
        return "";
    }
  }

  async generateQR() {
    const data = this.getQRData();
    const size = parseInt(this.sizeSelect.value, 10);

    if (!data) {
      this.showToast("Inserisci i dati richiesti", "error");
      return;
    }

    if (!this.companyData) {
      this.showToast("Caricamento dati aziendali in corso...", "error");
      return;
    }

    try {
      // Create base QR code
      const tempCanvas = document.createElement("canvas");
      const qr = new QRious({
        element: tempCanvas,
        value: data,
        size: size,
        foreground: "#000000",
        background: "#ffffff",
        level: "H"
      });

      // NEW LAYOUT: Logo sopra + QR + Info sotto
      const finalCanvas = document.createElement("canvas");
      const headerHeight = Math.max(100, size * 0.2); // Spazio per logo grande sopra
      const footerHeight = Math.max(100, size * 0.2); // Spazio per info sotto
      finalCanvas.width = size;
      finalCanvas.height = headerHeight + size + footerHeight;
      
      const ctx = finalCanvas.getContext("2d");

      // Draw white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

      // 1. LOGO GRANDE SOPRA AL QR
      if (this.logoImage) {
        const maxLogoSize = Math.max(80, size * 0.16);
        const logoAspectRatio = this.logoImage.width / this.logoImage.height;
        
        let logoWidth, logoHeight;
        if (logoAspectRatio > 1) {
          logoWidth = maxLogoSize;
          logoHeight = maxLogoSize / logoAspectRatio;
        } else {
          logoHeight = maxLogoSize;
          logoWidth = maxLogoSize * logoAspectRatio;
        }
        
        const logoX = (finalCanvas.width - logoWidth) / 2;
        const logoY = (headerHeight - logoHeight) / 2;
        
        ctx.drawImage(this.logoImage, logoX, logoY, logoWidth, logoHeight);
      }

      // Bordo sotto il logo
      ctx.strokeStyle = "#00f5ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, headerHeight);
      ctx.lineTo(finalCanvas.width, headerHeight);
      ctx.stroke();

      // 2. QR CODE AL CENTRO
      ctx.drawImage(tempCanvas, 0, headerHeight);

      // 3. INFO FOOTER SOTTO AL QR
      const footerY = headerHeight + size;
      
      // Bordo sopra il footer
      ctx.strokeStyle = "#00f5ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, footerY);
      ctx.lineTo(finalCanvas.width, footerY);
      ctx.stroke();

      // Background footer con gradient
      const gradient = ctx.createLinearGradient(0, footerY, 0, footerY + footerHeight);
      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(1, "#f8f9fa");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, footerY, finalCanvas.width, footerHeight);

      // PALMINO MOTORS in corsivo (simula font corsivo con italic)
      ctx.fillStyle = "#0a0e27";
      const titleFontSize = Math.max(14, size * 0.035);
      ctx.font = `italic bold ${titleFontSize}px Georgia, serif`; // Corsivo elegante
      ctx.textAlign = "center";
      ctx.fillText("Palmino Motors", finalCanvas.width / 2, footerY + footerHeight * 0.25);

      // Resto del testo in Calibri
      const textFontSize = Math.max(10, size * 0.022);
      ctx.font = `${textFontSize}px Calibri, Arial, sans-serif`;
      ctx.fillStyle = "#495057";
      
      // Indirizzo
      const fullAddress = `${this.companyData.address}, ${this.companyData.cap} ${this.companyData.city} (${this.companyData.province})`;
      ctx.fillText(fullAddress, finalCanvas.width / 2, footerY + footerHeight * 0.45);

      // Tel e Email
      const smallTextSize = Math.max(9, size * 0.020);
      ctx.font = `${smallTextSize}px Calibri, Arial, sans-serif`;
      ctx.fillText(`Tel: ${this.companyData.phone}`, finalCanvas.width / 2, footerY + footerHeight * 0.65);
      ctx.fillText(this.companyData.email, finalCanvas.width / 2, footerY + footerHeight * 0.80);

      // P.IVA
      const pivaSize = Math.max(8, size * 0.018);
      ctx.font = `${pivaSize}px Calibri, Arial, sans-serif`;
      ctx.fillStyle = "#6c757d";
      ctx.fillText(`P.IVA: ${this.companyData.piva}`, finalCanvas.width / 2, footerY + footerHeight * 0.93);

      // Display QR code
      this.qrContainer.innerHTML = "";
      finalCanvas.id = "qrCanvas";
      this.qrContainer.appendChild(finalCanvas);
      this.qrContainer.classList.add("has-qr");
      
      // Show download buttons
      this.downloadSection.classList.remove("hidden");

      this.currentQR = { 
        canvas: finalCanvas, 
        data, 
        size, 
        type: this.typeSelect.value
      };
      
      // Update info section
      this.updateInfoSection();
      
      // Show success toast

    } catch (error) {
      console.error("Errore generazione QR:", error);
      this.showToast("Errore nella generazione del QR Code", "error");
    }
  }

  downloadQR() {
    if (!this.currentQR) return;
    
    const link = document.createElement("a");
    link.href = this.currentQR.canvas.toDataURL("image/png");
    
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/:/g, "-").replace("T", "_");
    const fileName = `PalminoMotors_QR_${this.currentQR.type}_${timestamp}.png`;
    
    link.download = fileName;
    link.click();
    
    this.showToast("QR Code scaricato con successo!", "success");
  }

  async copyToClipboard() {
    if (!this.currentQR) return;

    try {
      const blob = await new Promise(resolve => 
        this.currentQR.canvas.toBlob(resolve, "image/png")
      );
      
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob })
      ]);
      
      this.showToast("QR Code copiato negli appunti!", "success");
    } catch (error) {
      console.error("Errore copia negli appunti:", error);
      this.showToast("Impossibile copiare l'immagine", "error");
    }
  }

  clearQR() {
    this.qrContainer.innerHTML = `
      <div class="placeholder">
        <i class="fas fa-qrcode"></i>
        <p>Il tuo QR Code apparirà qui</p>
        <span class="hint">Compila i campi e premi Genera</span>
      </div>`;
    this.qrContainer.classList.remove("has-qr");
    this.downloadSection.classList.add("hidden");
    this.currentQR = null;
    this.infoType.textContent = "-";
    this.infoSize.textContent = "-";
    this.infoContent.textContent = "-";
  }

  updateInfoSection() {
    if (!this.currentQR) return;
    
    const typeMap = {
      text: "Testo",
      url: "URL/Link",
      email: "Email",
      phone: "Telefono",
      whatsapp: "WhatsApp",
      wifi: "WiFi",
    };
    
    this.infoType.textContent = typeMap[this.currentQR.type] || this.currentQR.type;
    this.infoSize.textContent = `${this.currentQR.size}px`;
    this.infoLogo.textContent = "Logo + Info";
    
    const contentText = this.currentQR.data.length > 60
      ? this.currentQR.data.slice(0, 60) + "..."
      : this.currentQR.data;
    this.infoContent.textContent = contentText;
  }

  showToast(msg, type = "success") {
    this.toastMessage.textContent = msg;
    
    const icon = this.toast.querySelector("i");
    if (type === "error") {
      this.toast.style.background = "linear-gradient(135deg, #ff006e 0%, #ff4d4d 100%)";
      icon.className = "fas fa-exclamation-circle";
    } else {
      this.toast.style.background = "linear-gradient(135deg, #00ff88 0%, #00f5ff 100%)";
      icon.className = "fas fa-check-circle";
    }
    
    this.toast.classList.add("show");
    setTimeout(() => this.toast.classList.remove("show"), 3000);
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  new PalminoQRGenerator();
  
  // Add smooth scroll behavior
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Parallax effect for glow orbs
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset;
    const orbs = document.querySelectorAll(".glow-orb");
    
    orbs.forEach((orb, index) => {
      const speed = 0.3 + index * 0.1;
      orb.style.transform = `translateY(${scrolled * speed}px)`;
    });
  });
});