// ══════════════════════════════════════════════
//  PALMINO MOTORS — HUB OPERATIVO
// ══════════════════════════════════════════════
let _data = null;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  loadData();
});

// ── UTILS ──────────────────────────────────────
function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? `${parseInt(r[1],16)}, ${parseInt(r[2],16)}, ${parseInt(r[3],16)}` : "255,255,255";
}

function formatPhoneNumber(phone) {
  if (!phone) return phone;
  let c = phone.replace(/\s+/g,"");
  if (c.startsWith("+39")) return c.replace(/(\+39)(\d{3})(\d{3})(\d{4})/, "$1 $2 $3 $4");
  return phone;
}

function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); }

function highlightText(text, term) {
  if (!term) return text;
  return text.replace(new RegExp(`(${escapeRegExp(term)})`,"gi"),'<mark class="highlight">$1</mark>');
}

function openWhatsApp(event) {
  event.preventDefault();
  const webUrl = "https://web.whatsapp.com/";
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    setTimeout(() => { if (document.visibilityState !== "hidden") window.open(webUrl,"_blank"); }, 2000);
    window.location.href = "whatsapp://";
  } else {
    window.open(webUrl,"_blank");
  }
}

// ── LOAD ──────────────────────────────────────
async function loadData() {
  try {
    const res = await fetch("data.json");
    _data = await res.json();
    populateFooter(_data.company);
    handleHeaderLogo(_data.company.logo);
    renderBrands(_data.brands);
    buildHomeScreen(_data);
  } catch(e) {
    console.error("Errore:", e);
  }
}

// ══════════════════════════════════════════════
//  HEADER LOGO
// ══════════════════════════════════════════════
function handleHeaderLogo(logoPath) {
  if (!logoPath) return;
  const wrap = document.getElementById("headerLogoWrap");
  if (!wrap) return;
  const img = document.createElement("img");
  img.src = logoPath;
  img.className = "header-logo-img";
  img.alt = "Logo";
  img.onerror = () => img.remove();
  wrap.replaceWith(img);
}

// ══════════════════════════════════════════════
//  HOME — GRIGLIA SELEZIONE AREA
// ══════════════════════════════════════════════
function buildHomeScreen(data) {
  const grid = document.getElementById("areaGrid");
  if (!grid) return;

  const catCards = data.categories.map((cat, i) => {
    const rgb = hexToRgb(cat.color);
    const cl  = cat.colorLight || cat.color;
    return `
      <button class="area-card" onclick="enterArea(${i})"
        style="--ac:${cat.color}; --acl:${cl}; --acr:${rgb};">
        <div class="area-card-shine"></div>
        <div class="area-card-icon" style="background:linear-gradient(135deg,${cat.color},${cl})">
          ${getAreaEmoji(cat.name)}
        </div>
        <span class="area-card-label">${cat.name}</span>
        <span class="area-card-badge">${cat.links.length} link</span>
      </button>`;
  });

  // Brand card
  const brandRgb = hexToRgb("#dc2626");
  catCards.push(`
    <button class="area-card" onclick="enterArea('brands')"
      style="--ac:#dc2626; --acl:#f97316; --acr:${brandRgb};">
      <div class="area-card-shine"></div>
      <div class="area-card-icon" style="background:linear-gradient(135deg,#dc2626,#f97316)">
        🏷️
      </div>
      <span class="area-card-label">Brand Ufficiali</span>
      <span class="area-card-badge">${data.brands.length} brand</span>
    </button>`);

  grid.innerHTML = catCards.join("");
}

function getAreaEmoji(label) {
  const map = {
    "Gestionali":"📦","Pianificazione":"📅","Portali":"🛠️",
    "Finanziarie":"🏦","Email":"📧","Siti":"🌐","Social":"📱","Cloud":"☁️"
  };
  for (const [key, emoji] of Object.entries(map)) {
    if (label.includes(key)) return emoji;
  }
  return "📂";
}

// ══════════════════════════════════════════════
//  NAVIGAZIONE
// ══════════════════════════════════════════════
function enterArea(index) {
  document.getElementById("screenHome").style.display = "none";
  document.getElementById("screenDetail").style.display = "";
  document.getElementById("backBtn").style.display = "";
  // Brand section: nascondi sempre (non piu in fondo)
  document.getElementById("brandSection").style.display = "none";
  window.scrollTo({ top: 0 });

  const tag = document.getElementById("headerAreaTag");
  const dot = document.getElementById("headerAreaDot");
  const namEl = document.getElementById("headerAreaName");
  const header = document.getElementById("hubHeader");
  tag.style.display = "";

  if (index === "brands") {
    dot.style.background = "linear-gradient(135deg,#dc2626,#f97316)";
    namEl.textContent = "Brand Ufficiali";
    header.style.setProperty("--hc", "#dc2626");
    header.style.setProperty("--hr", hexToRgb("#dc2626"));
    renderBrandPage();
  } else {
    const cat = _data.categories[index];
    const rgb = hexToRgb(cat.color);
    dot.style.background = `linear-gradient(135deg,${cat.color},${cat.colorLight||cat.color})`;
    namEl.textContent = cat.name;
    header.style.setProperty("--hc", cat.color);
    header.style.setProperty("--hr", rgb);
    renderCategoryDetail(cat, rgb, cat.color, cat.colorLight || cat.color);
  }
}

function goHome() {
  document.getElementById("screenDetail").style.display = "none";
  document.getElementById("screenHome").style.display = "";
  document.getElementById("backBtn").style.display = "none";
  document.getElementById("headerAreaTag").style.display = "none";

  const header = document.getElementById("hubHeader");
  header.style.removeProperty("--hc");
  header.style.removeProperty("--hr");

  // Reset search
  const s = document.getElementById("detailSearch");
  if (s) { s.value = ""; }
  document.getElementById("detailSearchClear").classList.remove("visible");

  window.scrollTo({ top: 0 });
}

// ══════════════════════════════════════════════
//  DETAIL — CATEGORIA LINK CARDS
// ══════════════════════════════════════════════
function renderCategoryDetail(cat, rgb, color, colorLight) {
  const main = document.getElementById("detailMain");

  function renderCards(query) {
    const q = (query||"").toLowerCase().trim();
    const links = q
      ? cat.links.filter(l => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q))
      : cat.links;

    if (!links.length) {
      main.innerHTML = `<div class="detail-empty"><div class="detail-empty-icon">🔍</div><p>Nessun risultato per "<strong>${query}</strong>"</p></div>`;
      return;
    }

    main.innerHTML = `<div class="detail-links-grid">${links.map(link => {
      const isWa = link.title.toLowerCase().includes("whatsapp");
      return `
        <a href="${link.url}" target="_blank" rel="noopener noreferrer"
          class="detail-link-card"
          style="--dc:${color};--dcl:${colorLight};--dcr:${rgb};"
          ${isWa ? 'onclick="openWhatsApp(event)"':""}>
          <span class="detail-link-icon">${link.icon}</span>
          <div class="detail-link-info">
            <h3>${highlightText(link.title, query)}</h3>
            <p>${highlightText(link.description, query)}</p>
          </div>
          <svg class="detail-link-arrow" width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </a>`;
    }).join("")}</div>`;

    main.querySelectorAll(".detail-link-card").forEach(card => {
      card.addEventListener("mouseenter", () => {
        card.style.boxShadow = `0 8px 32px rgba(${rgb},0.25)`;
        card.style.borderColor = color;
        const icon = card.querySelector(".detail-link-icon");
        if (icon) icon.style.boxShadow = `0 0 18px rgba(${rgb},0.35)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.boxShadow = "";
        card.style.borderColor = "";
        const icon = card.querySelector(".detail-link-icon");
        if (icon) icon.style.boxShadow = "";
      });
    });
  }

  renderCards("");
}


// ══════════════════════════════════════════════
//  BRAND PAGE (come sezione precedente, a pagina intera)
// ══════════════════════════════════════════════
function renderBrandPage() {
  const main = document.getElementById("detailMain");
  const brands = _data.brands;
  main.innerHTML = `<div class="brand-links">${brands.map(brand => {
    const bc = brand.color || "#dc2626";
    const bcl = brand.colorLight || "#f97316";
    const brgb = hexToRgb(bc);
    return `
      <div class="brand-item" style="--bc:${bc};--bcl:${bcl};--bcr:${brgb};">
        <div class="brand-item-glow"></div>
        <div class="brand-gradient" style="background:linear-gradient(90deg,transparent,rgba(${brgb},0.3) 15%,${bc} 35%,${bcl} 50%,${bc} 65%,rgba(${brgb},0.3) 85%,transparent)"></div>
        <span class="brand-name" style="background:linear-gradient(135deg,#fafafa,${bc});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${brand.name}</span>
        <div class="brand-socials">
          ${brand.url ? `<a href="${brand.url}" target="_blank" rel="noopener noreferrer" class="brand-pill">${svgGlobe()}</a>` : ""}
          ${brand.facebook ? `<a href="${brand.facebook}" target="_blank" rel="noopener noreferrer" class="brand-pill">${svgFacebook()}</a>` : ""}
          ${brand.instagram ? `<a href="${brand.instagram}" target="_blank" rel="noopener noreferrer" class="brand-pill">${svgInstagram()}</a>` : ""}
        </div>
      </div>`;
  }).join("")}</div>`;

  main.querySelectorAll(".brand-item").forEach((item, idx) => {
    const brand = brands[idx];
    const bc = brand.color || "#dc2626";
    const brgb = hexToRgb(bc);
    item.style.borderColor = `rgba(${brgb},0.5)`;
    item.addEventListener("mouseenter", () => {
      item.style.borderColor = bc;
      item.style.boxShadow = `0 8px 32px rgba(${brgb},0.2)`;
      item.style.transform = "translateY(-4px)";
    });
    item.addEventListener("mouseleave", () => {
      item.style.borderColor = `rgba(${brgb},0.5)`;
      item.style.boxShadow = "";
      item.style.transform = "";
    });
  });
}

// ══════════════════════════════════════════════
//  BRAND SECTION (come prima)
// ══════════════════════════════════════════════
function renderBrands(brands) {
  const container = document.getElementById("brandContainer");
  const badge = document.getElementById("brandCount");
  if (!container) return;
  if (badge) badge.textContent = brands?.length || "";
  if (!brands?.length) return;

  container.innerHTML = brands.map(brand => {
    const bc = brand.color || "#dc2626";
    const bcl = brand.colorLight || "#f97316";
    const brgb = hexToRgb(bc);
    return `
      <div class="brand-item" style="--bc:${bc};--bcl:${bcl};--bcr:${brgb};">
        <div class="brand-item-glow"></div>
        <div class="brand-gradient" style="background:linear-gradient(90deg,transparent,rgba(${brgb},0.3) 15%,${bc} 35%,${bcl} 50%,${bc} 65%,rgba(${brgb},0.3) 85%,transparent)"></div>
        <span class="brand-name" style="background:linear-gradient(135deg,#fafafa,${bc});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${brand.name}</span>
        <div class="brand-socials">
          ${brand.url ? `<a href="${brand.url}" target="_blank" rel="noopener noreferrer" class="brand-pill">${svgGlobe()}</a>` : ""}
          ${brand.facebook ? `<a href="${brand.facebook}" target="_blank" rel="noopener noreferrer" class="brand-pill">${svgFacebook()}</a>` : ""}
          ${brand.instagram ? `<a href="${brand.instagram}" target="_blank" rel="noopener noreferrer" class="brand-pill">${svgInstagram()}</a>` : ""}
        </div>
      </div>`;
  }).join("");

  // Hover brand items
  container.querySelectorAll(".brand-item").forEach((item, idx) => {
    const brand = brands[idx];
    const bc = brand.color || "#dc2626";
    const brgb = hexToRgb(bc);
    item.style.borderColor = `rgba(${brgb},0.5)`;
    item.addEventListener("mouseenter", () => {
      item.style.borderColor = bc;
      item.style.boxShadow = `0 8px 32px rgba(${brgb},0.2)`;
      item.style.transform = "translateY(-4px)";
    });
    item.addEventListener("mouseleave", () => {
      item.style.borderColor = `rgba(${brgb},0.5)`;
      item.style.boxShadow = "";
      item.style.transform = "";
    });
  });
}

// ══════════════════════════════════════════════
//  FOOTER
// ══════════════════════════════════════════════
function populateFooter(company) {
  const setEl = (id, fn) => { const el = document.getElementById(id); if (el) fn(el); };

  setEl("companyName", el => el.textContent = company.fullName);

  setEl("fullAddress", el => {
    const full = `${company.address}, ${company.cap} ${company.city} (${company.province})`;
    el.textContent = full;
    el.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(full)}`;
  });

  setEl("footerPhone", el => {
    el.href = `tel:${company.phone}`;
    el.textContent = `Tel: ${formatPhoneNumber(company.phone)}`;
  });

  setEl("footerEmail", el => {
    el.href = `mailto:${company.email}`;
    el.textContent = `Email: ${company.email}`;
  });

  setEl("footerWhatsApp", el => {
    const n = company.phone.replace(/\+/g,"").replace(/\s/g,"");
    el.href = `https://wa.me/${n}`;
    el.textContent = `WhatsApp: ${formatPhoneNumber(company.phone)}`;
    el.onclick = openWhatsApp;
  });

  setEl("footerPiva", el => el.textContent = `P.IVA: ${company.piva}`);

  // Footer logo
  const footerCol = document.getElementById("footerCompanyCol");
  if (footerCol && company.logo) {
    const img = document.createElement("img");
    img.src = company.logo;
    img.className = "footer-logo";
    img.alt = "Logo";
    img.onerror = () => img.remove();
    footerCol.prepend(img);
  }
}

// ── SVG ──
function svgGlobe() { return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`; }
function svgInstagram() { return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>`; }
function svgFacebook() { return `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`; }