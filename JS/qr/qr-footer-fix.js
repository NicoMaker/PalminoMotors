// ══════════════════════════════════════════════════════════════════════════════
//  QR FOOTER FIX — Carica il logo quando data.json è disponibile
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Quando PM.company è disponibile, carica il logo nel footer
 */
function setupFooterLogo() {
  // Attendi che PM.company sia disponibile
  const checkAndLoad = () => {
    if (!window.PM || !PM.company) {
      console.log("⏳ Aspettando PM.company...");
      setTimeout(checkAndLoad, 100);
      return;
    }

    console.log("✅ PM.company trovato");

    const footerLogoEl = document.getElementById("footerLogo");
    if (!footerLogoEl) {
      console.error("❌ Elemento #footerLogo non trovato nel DOM");
      return;
    }

    // Carica il logo da data.json
    const logoPath = "../" + PM.company.logo;
    console.log("📸 Caricando logo da:", logoPath);

    footerLogoEl.src = logoPath;

    footerLogoEl.onload = () => {
      console.log("✅ Logo caricato correttamente!");
    };

    footerLogoEl.onerror = () => {
      console.error("❌ Errore caricamento logo da:", logoPath);
      // Fallback: mostra uno sfondo
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

// Avvia quando il DOM è pronto
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupFooterLogo);
} else {
  setupFooterLogo();
}
