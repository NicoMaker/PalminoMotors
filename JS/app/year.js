// ══════════════════════════════════════════════
//  YEAR — Aggiornamento automatico anno nel footer
// ══════════════════════════════════════════════

function updateYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

function scheduleYearUpdate() {
  const now = new Date();
  const nextYear = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0, 0);
  const msUntilNewYear = nextYear - now;

  setTimeout(() => {
    updateYear();
    setInterval(updateYear, 365.25 * 24 * 60 * 60 * 1000);
  }, msUntilNewYear);
}
