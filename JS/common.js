// ══════════════════════════════════════════════
//  COMMON — Usato sia da index.html che da qr.html
//  [VERSIONE CON PERCORSI DINAMICI PER QR/]
// ══════════════════════════════════════════════

// Oggetto globale dati (accessibile da tutti i file)
window.companyData = null;
window.appData = null;

// ── UTILS ──────────────────────────────────────
function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r
    ? `${parseInt(r[1], 16)}, ${parseInt(r[2], 16)}, ${parseInt(r[3], 16)}`
    : "255,255,255";
}

function formatPhoneNumber(phone) {
  if (!phone) return phone;
  let c = phone.replace(/\s+/g, "");
  if (c.startsWith("+39"))
    return c.replace(/(\+39)(\d{3})(\d{3})(\d{4})/, "$1 $2 $3 $4");
  if (c.startsWith("+"))
    return c.replace(/(\+\d{1,3})(\d{3})(\d{3})(\d{4})/, "$1 $2 $3 $4");
  if (c.length === 10) return c.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
  if (c.length > 6) return c.replace(/(\d{3})(?=\d)/g, "$1 ");
  return phone;
}

// ── ANNO AUTOMATICO ────────────────────────────
function updateYear() {
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

function scheduleYearUpdate() {
  const scheduleNext = () => {
    const now = new Date();
    // Prossimo 1° gennaio a mezzanotte
    const nextNewYear = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0, 0);
    const msUntilNewYear = nextNewYear - now;

    setTimeout(() => {
      updateYear(); // Aggiorna l'anno nel DOM
      scheduleNext(); // Riprogramma per il Capodanno successivo
    }, msUntilNewYear);
  };

  scheduleNext();
}

// ── FOOTER ─────────────────────────────────────
function populateFooter(company) {
  const s = (id, fn) => {
    const el = document.getElementById(id);
    if (el) fn(el);
  };

  s("companyName", (el) => (el.textContent = company.fullName));

  s("fullAddress", (el) => {
    const full = `${company.address}, ${company.cap} ${company.city} (${company.province})`;
    el.textContent = full;
    el.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(full)}`;
  });

  s("footerPhone", (el) => {
    el.href = `tel:${company.phone}`;
    el.textContent = `Tel: ${formatPhoneNumber(company.phone)}`;
  });

  s("footerEmail", (el) => {
    el.href = "https://mail.google.com";
    el.target = "_blank";
    el.rel = "noopener noreferrer";
    el.textContent = `Email: ${company.email}`;
  });

  s("footerWhatsApp", (el) => {
    const n = company.phone.replace(/\+/g, "").replace(/\s/g, "");
    el.href = `https://wa.me/${n}`;
    el.textContent = `WhatsApp: ${formatPhoneNumber(company.phone)}`;
    el.onclick = openWhatsApp;
  });

  s("footerPiva", (el) => (el.textContent = `P.IVA: ${company.piva}`));

  const footerLogo = document.getElementById("footerLogo");
  if (footerLogo && company.logo) {
    footerLogo.src = company.logo;
  }

  const footerCol = document.getElementById("footerCompanyCol");
  if (footerCol && company.logo && !footerLogo) {
    const img = document.createElement("img");
    img.src = company.logo;
    img.className = "footer-logo";
    img.alt = "Logo";
    img.onerror = () => img.remove();
    footerCol.prepend(img);
  }
}

// ── WHATSAPP / MAIL ────────────────────────────
function openWhatsApp(event) {
  event.preventDefault();
  const href = event.currentTarget?.href || "";
  const match = href.match(/wa\.me\/(\d+)/);
  const number = match ? match[1] : null;
  const webUrl = number
    ? `https://web.whatsapp.com/send?phone=${number}`
    : "https://web.whatsapp.com/";
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    window.location.href = number
      ? `whatsapp://send?phone=${number}`
      : "whatsapp://";
    return;
  }

  let appOpened = false;
  const start = Date.now();
  const onBlur = () => {
    appOpened = true;
  };
  window.addEventListener("blur", onBlur);

  const a = document.createElement("a");
  a.href = number ? `whatsapp://send?phone=${number}` : "whatsapp://";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => {
    window.removeEventListener("blur", onBlur);
    if (!appOpened && Date.now() - start < 1500) window.open(webUrl, "_blank");
  }, 1200);
}

function openMail(event) {
  event.preventDefault();
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  const tryApp = (appHref, fallback) => {
    let appOpened = false;
    const onBlur = () => {
      appOpened = true;
    };
    window.addEventListener("blur", onBlur);
    const a = document.createElement("a");
    a.href = appHref;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => {
      window.removeEventListener("blur", onBlur);
      if (!appOpened) window.open(fallback, "_blank");
    }, 1200);
  };

  if (isAndroid) {
    tryApp(
      "intent://compose#Intent;scheme=googlegmail;package=com.google.android.gm;end",
      "https://mail.google.com",
    );
  } else if (isIOS) {
    window.location.href = "googlegmail://";
    setTimeout(() => window.open("https://mail.google.com", "_blank"), 1200);
  } else {
    window.open("https://mail.google.com", "_blank");
  }
}

// ── CARICAMENTO DATI ───────────────────────────
// Callback opzionale — ogni pagina può sovrascriverlo prima del DOMContentLoaded
window.onDataLoaded = null;

async function loadData() {
  try {
    const dataPath = window.location.pathname.includes("/qr/")
      ? "../JSON/dati.json"
      : "JSON/dati.json";

    const res = await fetch(dataPath);
    const data = await res.json();

    window.appData = data;
    window.companyData = data.company;

    updateYear();
    scheduleYearUpdate();
    populateFooter(data.company);

    if (typeof window.onDataLoaded === "function") {
      window.onDataLoaded(data);
    }
  } catch (e) {
    console.error("❌ Errore caricamento dati.json:", e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadData();
});
