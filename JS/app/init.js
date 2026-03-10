// ══════════════════════════════════════════════
//  INIT — Punto di ingresso, DOMContentLoaded
// ══════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
  updateYear();
  scheduleYearUpdate();
  loadData();

  const logoArea = document.querySelector(".logo-area");
  if (logoArea) {
    logoArea.style.cursor = "pointer";
    logoArea.addEventListener("click", goHome);
  }
});
