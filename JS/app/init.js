// ══════════════════════════════════════════════
//  INIT — Setup UI locale (index.html)
//  Caricamento dati e anno gestiti da js/common.js
// ══════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
  // Rende cliccabile il logo-area per tornare alla home
  const logoArea = document.querySelector(".logo-area");
  if (logoArea) {
    logoArea.style.cursor = "pointer";
    logoArea.addEventListener("click", goHome);
  }
});