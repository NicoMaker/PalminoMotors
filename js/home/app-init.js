// ══════════════════════════════════════════════
//  APP-INIT.JS — Entry point di index.html
// ══════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", async () => {
  // Logo area torna alla home
  const logoArea = document.querySelector(".logo-area");
  if (logoArea) {
    logoArea.style.cursor = "pointer";
    logoArea.addEventListener(
      "click",
      () => (window.location.href = "index.html"),
    );
  }

  try {
    const data = await DataLoader.load();

    // Rendering Footer Unificato
    renderFooter(data.company);

    // Inizializzazione componenti Home
    handleHeaderLogo(data.company.logo); // Qui usa il logo normale
    renderBrands(data.brands);
    buildHomeScreen(data);
  } catch (e) {
    console.error("❌ Errore inizializzazione Home:", e);
  }
});
