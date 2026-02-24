// ══════════════════════════════════════════════
//  APP-INIT.JS — Entry point di index.html
//  Carica data.json (tramite DataLoader condiviso)
//  e avvia il rendering di tutti i moduli.
// ══════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", async () => {
  // Anno automatico
  updateYear();
  scheduleYearUpdate();

  // Click sul logo-area nell'header torna alla home
  const logoArea = document.querySelector(".logo-area");
  if (logoArea) {
    logoArea.style.cursor = "pointer";
    logoArea.addEventListener("click", goHome);
  }

  // Carica il JSON e avvia il rendering
  try {
    const data = await DataLoader.load();
    populateFooter(data.company);
    handleHeaderLogo(data.company.logo);
    renderBrands(data.brands);
    buildHomeScreen(data);
  } catch (e) {
    console.error("❌ Impossibile caricare i dati:", e);
  }
});
