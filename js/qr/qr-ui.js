// ══════════════════════════════════════════════
//  QR-UI.JS — Interfaccia utente della pagina QR
//             Download, copia, stampa, toast,
//             sezione info e footer.
// ══════════════════════════════════════════════

const QRUI = (() => {
  // ── Elementi DOM ─────────────────────────────
  let _qrContainer, _downloadSection, _toast, _toastMsg;
  let _infoType, _infoSize, _infoContent, _infoLogo;
  let _currentQR = null;

  function init() {
    _qrContainer = document.getElementById("qr-container");
    _downloadSection = document.getElementById("download-section");
    _toast = document.getElementById("toast");
    _toastMsg = document.getElementById("toast-message");
    _infoType = document.getElementById("info-type");
    _infoSize = document.getElementById("info-size");
    _infoContent = document.getElementById("info-content");
    _infoLogo = document.getElementById("info-logo");
  }

  // ── Rendering QR nel container ────────────────
  function showCanvas(canvas, data, size, type) {
    _qrContainer.innerHTML = "";
    canvas.id = "qrCanvas";
    _qrContainer.appendChild(canvas);
    _qrContainer.classList.add("has-qr");
    _downloadSection.classList.remove("hidden");

    _currentQR = { canvas, data, size, type };
    _updateInfoSection();
    console.log("✅ QR generato con successo");
  }

  function clearQR() {
    _qrContainer.innerHTML = `
      <div class="placeholder">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" opacity="0.3">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/>
          <rect x="18" y="14" width="3" height="3"/><rect x="14" y="18" width="3" height="3"/>
          <rect x="18" y="18" width="3" height="3"/>
        </svg>
        <p>Il tuo QR Code apparira qui</p>
        <span class="hint">Compila i campi e premi Genera</span>
      </div>`;
    _qrContainer.classList.remove("has-qr");
    _downloadSection.classList.add("hidden");
    _currentQR = null;
    if (_infoType) _infoType.textContent = "-";
    if (_infoSize) _infoSize.textContent = "-";
    if (_infoContent) _infoContent.textContent = "-";
  }

  // ── Info section ──────────────────────────────
  function _updateInfoSection() {
    if (!_currentQR) return;
    const typeMap = {
      text: "Testo", url: "URL/Link", email: "Email",
      phone: "Telefono", whatsapp: "WhatsApp", wifi: "WiFi",
    };
    _infoType.textContent = typeMap[_currentQR.type] || _currentQR.type;
    _infoSize.textContent = `${_currentQR.size}px`;
    if (_infoLogo) _infoLogo.textContent = "Logo + Info";
    const txt = _currentQR.data.length > 60
      ? _currentQR.data.slice(0, 60) + "..."
      : _currentQR.data;
    _infoContent.textContent = txt;
  }

  // ── Download ──────────────────────────────────
  function downloadQR() {
    if (!_currentQR) return;
    const link = document.createElement("a");
    link.href = _currentQR.canvas.toDataURL("image/png");
    const ts = new Date().toISOString().slice(0, 19).replace(/:/g, "-").replace("T", "_");
    link.download = `PalminoMotors_QR_${_currentQR.type}_${ts}.png`;
    link.click();
  }

  // ── Copia negli appunti ───────────────────────
  async function copyToClipboard() {
    if (!_currentQR) return;
    try {
      const blob = await new Promise((res) =>
        _currentQR.canvas.toBlob(res, "image/png")
      );
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      showToast("QR Code copiato negli appunti!", "success");
    } catch (err) {
      console.error("❌ Errore copia:", err);
      showToast("Impossibile copiare l'immagine", "error");
    }
  }

  // ── Stampa ────────────────────────────────────
  function printQR() {
    if (!_currentQR) return;
    const imageUrl = _currentQR.canvas.toDataURL("image/png");
    const win = window.open("", "_blank");
    if (!win) { showToast("Abilita i popup per stampare", "error"); return; }
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Stampa QR Code - Palmino Motors</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { display:flex; justify-content:center; align-items:center; min-height:100vh; background:white; padding:20px; }
        img { max-width:100%; height:auto; display:block; }
        @media print { body { padding:0; } img { max-width:100%; page-break-inside:avoid; } }
      </style></head><body>
      <img src="${imageUrl}" alt="QR Code Palmino Motors" onload="window.print();setTimeout(()=>window.close(),100);" />
    </body></html>`);
  }

  // ── Toast ─────────────────────────────────────
  function showToast(msg, type = "success") {
    _toastMsg.textContent = msg;
    if (type === "error") {
      _toast.style.background = "linear-gradient(135deg,#ff006e 0%,#ff4d4d 100%)";
    } else {
      _toast.style.background = "linear-gradient(135deg,#00ff88 0%,#00f5ff 100%)";
    }
    _toast.classList.add("show");
    setTimeout(() => _toast.classList.remove("show"), 3000);
  }

  // ── Footer pagina QR ──────────────────────────
  function populateQRFooter(company) {
    const $ = (id) => document.getElementById(id);

    const companyName = $("companyName");
    if (companyName) companyName.textContent = company.fullName.toUpperCase();

    const addr = $("fullAddress");
    if (addr) {
      const text = `${company.address}, ${company.cap} ${company.city} (${company.province})`;
      addr.textContent = text;
      addr.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text)}`;
    }

    const phone = $("footerPhone");
    if (phone) {
      phone.href = `tel:${company.phone}`;
      phone.textContent = `Tel: ${formatPhoneNumber(company.phone)}`;
    }

    const email = $("footerEmail");
    if (email) {
      email.href = `mailto:${company.email}`;
      email.textContent = `Email: ${company.email}`;
    }

    const wa = $("footerWhatsApp");
    if (wa) {
      const n = company.phone.replace(/\+/g, "").replace(/\s/g, "");
      wa.href = `https://wa.me/${n}`;
      wa.textContent = `WhatsApp: ${formatPhoneNumber(company.phone)}`;
    }

    const piva = $("footerPiva");
    if (piva) piva.textContent = `P.IVA: ${company.piva}`;

    const footerLogo = $("footerLogo");
    if (footerLogo && company.logo) footerLogo.src = company.logo;
  }

  function getCurrentQR() {
    return _currentQR;
  }

  return {
    init,
    showCanvas,
    clearQR,
    downloadQR,
    copyToClipboard,
    printQR,
    showToast,
    populateQRFooter,
    getCurrentQR,
  };
})();
