// ══════════════════════════════════════════════
//  QR-CANVAS.JS — Disegno del canvas finale
//                 Logo + QR Code + Info footer
// ══════════════════════════════════════════════

const QRCanvas = (() => {
  let _logoImage = null;
  let _companyData = null;

  function setLogo(img) {
    _logoImage = img;
  }

  function setCompanyData(data) {
    _companyData = data;
  }

  /**
   * Attende che il logo sia disponibile (max maxWait ms).
   * Risolve con true se caricato, false se scaduto il timeout.
   */
  function waitForLogo(maxWait = 5000) {
    return new Promise((resolve) => {
      if (_logoImage?.complete && _logoImage.naturalWidth > 0) {
        resolve(true);
        return;
      }
      const start = Date.now();
      const check = () => {
        if (_logoImage?.complete && _logoImage.naturalWidth > 0) {
          resolve(true);
        } else if (Date.now() - start > maxWait) {
          console.warn("⏰ Timeout logo");
          resolve(false);
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }

  /**
   * Genera e restituisce il canvas finale con header logo, QR e footer info.
   * @param {string} data - Stringa QR
   * @param {number} size - Dimensione QR in px
   * @returns {HTMLCanvasElement}
   */
  async function render(data, size) {
    // Attende logo se non ancora pronto
    if (!_logoImage && _companyData?.logo_qr) {
      await waitForLogo(5000);
    }

    // Canvas QR grezzo
    const tempCanvas = document.createElement("canvas");
    new QRious({
      element: tempCanvas,
      value: data,
      size,
      foreground: "#000000",
      background: "#ffffff",
      level: "H",
    });

    // Dimensioni canvas finale
    const headerHeight = Math.max(100, size * 0.2);
    const footerHeight = Math.max(160, size * 0.32);
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = size;
    finalCanvas.height = headerHeight + size + footerHeight;

    const ctx = finalCanvas.getContext("2d");

    // Sfondo bianco
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

    // 1. LOGO HEADER
    if (_logoImage?.complete && _logoImage.naturalWidth > 0) {
      const maxLogoSize = Math.max(80, size * 0.3);
      const ratio = _logoImage.width / _logoImage.height;
      const logoWidth = ratio > 1 ? maxLogoSize : maxLogoSize * ratio;
      const logoHeight = ratio > 1 ? maxLogoSize / ratio : maxLogoSize;
      const logoX = (finalCanvas.width - logoWidth) / 2;
      const logoY = (headerHeight - logoHeight) / 2;
      ctx.drawImage(_logoImage, logoX, logoY, logoWidth, logoHeight);
    } else {
      ctx.fillStyle = "#00f5ff";
      ctx.font = `bold ${Math.max(18, size * 0.045)}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("PALMINO", finalCanvas.width / 2, headerHeight / 2);
    }

    // Bordo separatore header
    ctx.strokeStyle = "#00f5ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, headerHeight);
    ctx.lineTo(finalCanvas.width, headerHeight);
    ctx.stroke();

    // 2. QR CODE
    ctx.drawImage(tempCanvas, 0, headerHeight);

    // 3. FOOTER
    const footerY = headerHeight + size;

    // Bordo separatore footer
    ctx.beginPath();
    ctx.moveTo(0, footerY);
    ctx.lineTo(finalCanvas.width, footerY);
    ctx.stroke();

    // Gradiente footer
    const gradient = ctx.createLinearGradient(0, footerY, 0, footerY + footerHeight);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(1, "#f8f9fa");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, footerY, finalCanvas.width, footerHeight);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Titolo azienda
    ctx.fillStyle = "#0a0e27";
    ctx.font = `italic bold ${Math.max(14, size * 0.035)}px Georgia, serif`;
    ctx.fillText("Palmino Motors", finalCanvas.width / 2, footerY + footerHeight * 0.12);

    const textSize = Math.max(10, size * 0.022);
    ctx.font = `${textSize}px Calibri, Arial, sans-serif`;
    ctx.fillStyle = "#495057";

    // Indirizzo
    const fullAddress = `${_companyData.address}, ${_companyData.cap} ${_companyData.city} (${_companyData.province})`;
    ctx.fillText(fullAddress, finalCanvas.width / 2, footerY + footerHeight * 0.28);

    // Telefono
    const smallSize = Math.max(9, size * 0.02);
    ctx.font = `${smallSize}px Calibri, Arial, sans-serif`;
    ctx.fillText(
      `Tel: ${formatPhoneNumber(_companyData.phone)}`,
      finalCanvas.width / 2,
      footerY + footerHeight * 0.44
    );

    // Email
    ctx.fillStyle = "#495057";
    ctx.fillText(_companyData.email, finalCanvas.width / 2, footerY + footerHeight * 0.6);

    // Sito web
    const websiteSize = Math.max(9, size * 0.02);
    ctx.font = `${websiteSize}px Calibri, Arial, sans-serif`;
    ctx.fillText(
      _companyData.website || "www.palminomotors.com",
      finalCanvas.width / 2,
      footerY + footerHeight * 0.76
    );

    // P.IVA
    const pivaSize = Math.max(8, size * 0.018);
    ctx.font = `${pivaSize}px Calibri, Arial, sans-serif`;
    ctx.fillStyle = "#6c757d";
    ctx.fillText(
      `P.IVA: ${_companyData.piva}`,
      finalCanvas.width / 2,
      footerY + footerHeight * 0.9
    );

    return finalCanvas;
  }

  return { setLogo, setCompanyData, waitForLogo, render };
})();
