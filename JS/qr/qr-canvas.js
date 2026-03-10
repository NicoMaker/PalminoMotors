// ══════════════════════════════════════════════
//  QR CANVAS — Generazione canvas con header/footer
// ══════════════════════════════════════════════

function buildQRCanvas(data, size, logoImage, companyData, formatPhoneNumber) {
  const tempCanvas = document.createElement("canvas");
  new QRious({
    element: tempCanvas,
    value: data,
    size: size,
    foreground: "#000000",
    background: "#ffffff",
    level: "H",
  });

  const finalCanvas = document.createElement("canvas");
  const headerHeight = Math.max(100, size * 0.2);
  const footerHeight = Math.max(160, size * 0.32);
  finalCanvas.width = size;
  finalCanvas.height = headerHeight + size + footerHeight;

  const ctx = finalCanvas.getContext("2d");

  // Sfondo bianco
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

  // 1. LOGO HEADER
  if (logoImage && logoImage.complete && logoImage.naturalWidth > 0) {
    const maxLogoSize = Math.max(80, size * 0.3);
    const logoAspectRatio = logoImage.width / logoImage.height;
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
    ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
  } else {
    ctx.fillStyle = "#00f5ff";
    ctx.strokeStyle = "#00f5ff";
    ctx.lineWidth = 2;
    ctx.font = `bold ${Math.max(18, size * 0.045)}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeText("PALMINO", finalCanvas.width / 2, headerHeight / 2);
    ctx.fillText("PALMINO", finalCanvas.width / 2, headerHeight / 2);
  }

  // Bordo header
  ctx.strokeStyle = "#00f5ff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, headerHeight);
  ctx.lineTo(finalCanvas.width, headerHeight);
  ctx.stroke();

  // 2. QR AL CENTRO
  ctx.drawImage(tempCanvas, 0, headerHeight);

  // 3. FOOTER
  const footerY = headerHeight + size;

  ctx.strokeStyle = "#00f5ff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, footerY);
  ctx.lineTo(finalCanvas.width, footerY);
  ctx.stroke();

  const gradient = ctx.createLinearGradient(0, footerY, 0, footerY + footerHeight);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(1, "#f8f9fa");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, footerY, finalCanvas.width, footerHeight);

  ctx.fillStyle = "#0a0e27";
  const titleFontSize = Math.max(14, size * 0.035);
  ctx.font = `italic bold ${titleFontSize}px Georgia, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Palmino Motors", finalCanvas.width / 2, footerY + footerHeight * 0.12);

  const textFontSize = Math.max(10, size * 0.022);
  ctx.font = `${textFontSize}px Calibri, Arial, sans-serif`;
  ctx.fillStyle = "#495057";
  ctx.textBaseline = "middle";

  const fullAddress = `${companyData.address}, ${companyData.cap} ${companyData.city} (${companyData.province})`;
  ctx.fillText(fullAddress, finalCanvas.width / 2, footerY + footerHeight * 0.28);

  const smallTextSize = Math.max(9, size * 0.02);
  ctx.font = `${smallTextSize}px Calibri, Arial, sans-serif`;
  ctx.fillText(
    `Tel: ${formatPhoneNumber(companyData.phone)}`,
    finalCanvas.width / 2,
    footerY + footerHeight * 0.44,
  );

  ctx.fillStyle = "#495057";
  ctx.fillText(companyData.email, finalCanvas.width / 2, footerY + footerHeight * 0.6);

  const website = companyData.website || "www.palminomotors.com";
  const websiteSize = Math.max(9, size * 0.02);
  ctx.font = `${websiteSize}px Calibri, Arial, sans-serif`;
  ctx.fillStyle = "#495057";
  ctx.fillText(website, finalCanvas.width / 2, footerY + footerHeight * 0.76);

  const pivaSize = Math.max(8, size * 0.018);
  ctx.font = `${pivaSize}px Calibri, Arial, sans-serif`;
  ctx.fillStyle = "#6c757d";
  ctx.fillText(`P.IVA: ${companyData.piva}`, finalCanvas.width / 2, footerY + footerHeight * 0.9);

  return finalCanvas;
}
