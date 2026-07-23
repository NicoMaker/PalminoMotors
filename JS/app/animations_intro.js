// Decide PRIMA del render se saltare l'intro (ritorno da QR)
try {
  if (sessionStorage.getItem("pm_skip_intro") === "1") {
    sessionStorage.removeItem("pm_skip_intro");
    document.documentElement.classList.add("no-intro");
  }
} catch (e) {}
