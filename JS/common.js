// ══════════════════════════════════════════════
//  COMMON — Dati condivisi da data.json
//  Usato sia da index.html che da qr.html
// ══════════════════════════════════════════════

window.PM = window.PM || {};

// ── UTILS ──────────────────────────────────────
PM.hexToRgb = function (hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r
    ? `${parseInt(r[1], 16)}, ${parseInt(r[2], 16)}, ${parseInt(r[3], 16)}`
    : "255,255,255";
};

PM.formatPhoneNumber = function (phone) {
  if (!phone) return phone;
  let c = phone.replace(/\s+/g, "");
  if (c.startsWith("+39"))
    return c.replace(/(\+39)(\d{3})(\d{3})(\d{4})/, "$1 $2 $3 $4");
  if (c.startsWith("+"))
    return c.replace(/(\+\d{1,3})(\d{3})(\d{3})(\d{4})/, "$1 $2 $3 $4");
  if (c.length === 10)
    return c.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
  if (c.length > 6)
    return c.replace(/(\d{3})(?=\d)/g, "$1 ");
  return phone;
};

// ── ANNO AUTOMATICO ────────────────────────────
PM.updateYear = function () {
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
  // compatibilità con id="year"
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
};

PM.scheduleYearUpdate = function () {
  const now = new Date();
  const nextYear = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0, 0);
  setTimeout(() => {
    PM.updateYear();
    setInterval(PM.updateYear, 365.25 * 24 * 60 * 60 * 1000);
  }, nextYear - now);
};

// ── FOOTER ─────────────────────────────────────
PM.populateFooter = function (company) {
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
    el.textContent = `Tel: ${PM.formatPhoneNumber(company.phone)}`;
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
    el.textContent = `WhatsApp: ${PM.formatPhoneNumber(company.phone)}`;
    el.onclick = PM.openWhatsApp;
  });

  s("footerPiva", (el) => (el.textContent = `P.IVA: ${company.piva}`));

  // Logo footer
  const footerLogo = document.getElementById("footerLogo");
  if (footerLogo && company.logo) {
    footerLogo.src = company.logo;
  }

  // Logo footer col (index.html — aggiunge img dinamicamente)
  const footerCol = document.getElementById("footerCompanyCol");
  if (footerCol && company.logo && !footerLogo) {
    const img = document.createElement("img");
    img.src = company.logo;
    img.className = "footer-logo";
    img.alt = "Logo";
    img.onerror = () => img.remove();
    footerCol.prepend(img);
  }
};

// ── WHATSAPP / MAIL ────────────────────────────
PM.openWhatsApp = function (event) {
  event.preventDefault();
  const href = event.currentTarget?.href || "";
  const match = href.match(/wa\.me\/(\d+)/);
  const number = match ? match[1] : null;
  const webUrl = number
    ? `https://web.whatsapp.com/send?phone=${number}`
    : "https://web.whatsapp.com/";
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    window.location.href = number ? `whatsapp://send?phone=${number}` : "whatsapp://";
    return;
  }

  let appOpened = false;
  const start = Date.now();
  const onBlur = () => { appOpened = true; };
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
};

PM.openMail = function (event) {
  event.preventDefault();
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  const tryApp = (appHref, fallback) => {
    let appOpened = false;
    const onBlur = () => { appOpened = true; };
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
      "https://mail.google.com"
    );
  } else if (isIOS) {
    window.location.href = "googlegmail://";
    setTimeout(() => window.open("https://mail.google.com", "_blank"), 1200);
  } else {
    window.open("https://mail.google.com", "_blank");
  }
};

// ── CARICAMENTO data.json ──────────────────────
PM.loadData = async function () {
  try {
    const res = await fetch("data.json");
    const data = await res.json();
    PM.data = data;
    PM.company = data.company;

    PM.updateYear();
    PM.scheduleYearUpdate();
    PM.populateFooter(data.company);

    // Callback opzionale per la pagina specifica
    if (typeof PM.onDataLoaded === "function") {
      PM.onDataLoaded(data);
    }
  } catch (e) {
    console.error("❌ Errore caricamento data.json:", e);
  }
};

// Avvio automatico al DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  PM.loadData();
});