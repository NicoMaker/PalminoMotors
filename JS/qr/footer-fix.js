// ══════════════════════════════════════════════════════════════════════════════
//  QR FOOTER FIX — Carica il logo nel footer della pagina QR
// ══════════════════════════════════════════════════════════════════════════════

function setupFooterLogo() {
  const checkAndLoad = () => {
    if (!window.companyData) {
      console.log("⏳ Aspettando companyData...");
      setTimeout(checkAndLoad, 100);
      return;
    }

    console.log("✅ companyData trovato");

    const footerLogoEl = document.getElementById("footerLogo");
    if (!footerLogoEl) {
      console.error("❌ Elemento #footerLogo non trovato nel DOM");
      return;
    }

    const logoPath = "../" + window.companyData.logo;
    console.log("📸 Caricando logo da:", logoPath);

    footerLogoEl.src = logoPath;

    footerLogoEl.onload = () => {
      console.log("✅ Logo caricato correttamente!");
    };

    footerLogoEl.onerror = () => {
      console.error("❌ Errore caricamento logo da:", logoPath);
      footerLogoEl.style.backgroundColor = "#dc2626";
      footerLogoEl.style.display = "flex";
      footerLogoEl.style.alignItems = "center";
      footerLogoEl.style.justifyContent = "center";
      footerLogoEl.style.color = "white";
      footerLogoEl.innerText = "PM";
    };
  };

  checkAndLoad();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupFooterLogo);
} else {
  setupFooterLogo();
}