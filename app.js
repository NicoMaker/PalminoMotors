// ══════════════════════════════════════════════
//  PALMINO MOTORS — HUB OPERATIVO
// ══════════════════════════════════════════════
let _data = null;

// ── AGGIORNAMENTO ANNO AUTOMATICO ──────────────
function updateYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

function scheduleYearUpdate() {
  const now = new Date();
  const nextYear = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0, 0); // 1° gennaio anno prossimo
  const msUntilNewYear = nextYear - now;

  setTimeout(() => {
    updateYear();
    // Dopo il primo aggiornamento, ripeti ogni anno (365 giorni in ms)
    setInterval(updateYear, 365.25 * 24 * 60 * 60 * 1000);
  }, msUntilNewYear);
}

document.addEventListener("DOMContentLoaded", () => {
  updateYear();
  scheduleYearUpdate();
  loadData();

  // Cliccando su logo-area (titolo "Palmino Motors Hub Operativo") torna alla home
  const logoArea = document.querySelector(".logo-area");
  if (logoArea) {
    logoArea.style.cursor = "pointer";
    logoArea.addEventListener("click", goHome);
  }
});

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
  return phone;
}

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function highlightText(text, term) {
  if (!term) return text;
  return text.replace(
    new RegExp(`(${escapeRegExp(term)})`, "gi"),
    '<mark class="highlight">$1</mark>',
  );
}

function openWhatsApp(event) {
  event.preventDefault();
  const webUrl = "https://web.whatsapp.com/";
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    setTimeout(() => {
      if (document.visibilityState !== "hidden") window.open(webUrl, "_blank");
    }, 2000);
    window.location.href = "whatsapp://";
  } else {
    window.open(webUrl, "_blank");
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
  } catch (e) {
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
  img.style.cursor = "pointer"; // Rende palese che è cliccabile
  img.onclick = goHome; // <--- AGGIUNGI QUESTA RIGA

  img.onerror = () => img.remove();
  wrap.innerHTML = "";
  wrap.className = "header-logo-img-wrap";
  wrap.appendChild(img);
}

// ══════════════════════════════════════════════
//  HOME — GRIGLIA SELEZIONE AREA
// ══════════════════════════════════════════════
function buildHomeScreen(data) {
  // HOME LOGO HERO
  const hero = document.getElementById("homeLogoHero");
  if (hero && data.company?.logo) {
    const img = document.createElement("img");
    img.src = data.company.logo;
    img.className = "home-logo-img-big";
    img.alt = data.company.fullName || "Logo";

    // --- MODIFICA: Torna alla home cliccando il logo grande ---
    img.style.cursor = "pointer";
    img.onclick = goHome;
    // ---------------------------------------------------------

    img.onerror = () => {
      hero.innerHTML = '<div class="home-logo-circle-big">PM</div>';
    };
    hero.innerHTML = "";
    hero.appendChild(img);
  }

  // HOME COMPANY NAME
  const nameEl = document.getElementById("homeCompanyName");
  if (nameEl && data.company?.fullName)
    nameEl.textContent = data.company.fullName;

  const grid = document.getElementById("areaGrid");
  if (!grid) return;

  // Mappatura delle categorie dati
  const catCards = data.categories.map((cat, i) => {
    const rgb = hexToRgb(cat.color);
    const cl = cat.colorLight || cat.color;
    return `
      <button class="area-card" onclick="enterArea(${i})"
        style="--ac:${cat.color}; --acl:${cl}; --acr:${rgb};">
        <div class="area-card-shine"></div>
        <div class="area-card-icon" style="background:rgba(${rgb},0.15); border:2.5px solid ${cat.color};">
        ${cat.icon || cat.links[0]?.icon || getAreaEmoji(cat.name)}
        </div>
        <span class="area-card-label">${cat.name}</span>
        <span class="area-card-badge">${cat.links.length} link</span>
      </button>`;
  });

  // Aggiunta card speciale per i Brand Ufficiali
  const brandRgb = hexToRgb("#dc2626");
  catCards.push(`
    <button class="area-card" onclick="enterArea('brands')"
      style="--ac:#dc2626; --acl:#f97316; --acr:${brandRgb};">
      <div class="area-card-shine"></div>
      <div class="area-card-icon" style="background:rgba(220,38,38,0.15); border:2.5px solid #dc2626;">
        🏷️
      </div>
      <span class="area-card-label">Brand Ufficiali</span>
      <span class="area-card-badge">${data.brands.length} brand</span>
    </button>`);

  grid.innerHTML = catCards.join("");
}
function getAreaEmoji(label) {
  const map = {};
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

  const stickyBar = document.getElementById("headerSectionTitleRow");
  const stickyTitle = document.getElementById("headerSectionTitleText");
  stickyBar.style.display = "";
  document.body.classList.add("header-expanded");

  if (index === "brands") {
    dot.style.background = "linear-gradient(135deg,#dc2626,#f97316)";
    namEl.textContent = "Brand Ufficiali";
    header.style.setProperty("--hc", "#dc2626");
    header.style.setProperty("--hr", hexToRgb("#dc2626"));
    stickyTitle.textContent = "Brand Ufficiali";
    stickyBar.style.setProperty("--hc", "#dc2626");
    renderBrandPage();
  } else {
    const cat = _data.categories[index];
    const rgb = hexToRgb(cat.color);
    dot.style.background = `linear-gradient(135deg,${cat.color},${cat.colorLight || cat.color})`;
    namEl.textContent = cat.name;
    header.style.setProperty("--hc", cat.color);
    header.style.setProperty("--hr", rgb);
    stickyTitle.textContent = cat.name;
    stickyBar.style.setProperty("--hc", cat.color);
    renderCategoryDetail(cat, rgb, cat.color, cat.colorLight || cat.color);
  }
}

function goHome() {
  document.getElementById("screenDetail").style.display = "none";
  document.getElementById("screenHome").style.display = "";
  document.body.classList.remove("header-expanded");
  const sb = document.getElementById("headerSectionTitleRow");
  if (sb) sb.style.display = "none";
  document.getElementById("backBtn").style.display = "none";
  document.getElementById("headerAreaTag").style.display = "none";

  const header = document.getElementById("hubHeader");
  header.style.removeProperty("--hc");
  header.style.removeProperty("--hr");

  // Reset search
  const s = document.getElementById("detailSearch");
  if (s) {
    s.value = "";
  }
  document.getElementById("detailSearchClear").classList.remove("visible");

  window.scrollTo({ top: 0 });
}

// ══════════════════════════════════════════════
//  DETAIL — CATEGORIA LINK CARDS
// ══════════════════════════════════════════════
function renderCategoryDetail(cat, rgb, color, colorLight) {
  const main = document.getElementById("detailMain");

  function renderCards(query) {
    const q = (query || "").toLowerCase().trim();
    const links = q
      ? cat.links.filter(
          (l) =>
            l.title.toLowerCase().includes(q) ||
            l.description.toLowerCase().includes(q),
        )
      : cat.links;

    if (!links.length) {
      main.innerHTML = `<div class="detail-empty"><div class="detail-empty-icon">🔍</div><p>Nessun risultato per "<strong>${query}</strong>"</p></div>`;
      return;
    }

    main.innerHTML = `
      <br>
      <div class="detail-links-grid">
        ${links
          .map((link) => {
            const isWa = link.title.toLowerCase().includes("whatsapp");
            return `
            <a href="${link.url}" target="_blank" rel="noopener noreferrer"
              class="detail-link-card"
              style="--dc:${color};--dcl:${colorLight};--dcr:${rgb};"
              ${isWa ? 'onclick="openWhatsApp(event)"' : ""}>
              <span class="detail-link-icon">${link.icon}</span>
              <div class="detail-link-info">
                <h3>${highlightText(link.title, query)}</h3>
                <p>${highlightText(link.description, query)}</p>
              </div>
              <svg class="detail-link-arrow" width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </a>`;
          })
          .join("")}
      </div>`;

    main.querySelectorAll(".detail-link-card").forEach((card) => {
      card.addEventListener("mouseenter", () => {
        card.style.boxShadow = `0 8px 32px rgba(${rgb},0.25)`;
        card.style.borderColor = color;
      });
      card.addEventListener("mouseleave", () => {
        card.style.boxShadow = "";
        card.style.borderColor = "";
      });
    });
  }

  renderCards("");
}

// ══════════════════════════════════════════════
//  BRAND PAGE
// ══════════════════════════════════════════════
function buildBrandItemHTML(brand) {
  const bc = brand.color || "#dc2626";
  const bcl = brand.colorLight || "#f97316";
  const brgb = hexToRgb(bc);
  const gradBg = `linear-gradient(90deg,transparent,rgba(${brgb},0.3) 15%,${bc} 35%,${bcl} 50%,${bc} 65%,rgba(${brgb},0.3) 85%,transparent)`;
  return `
  <div class="brand-item" style="--bc:${bc};--bcl:${bcl};--bcr:${brgb};">
    <div class="brand-item-glow"></div>
    <span class="brand-name" style="background:linear-gradient(135deg,#fafafa,${bc});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${brand.name}</span>
    <div class="brand-gradient" style="background:${gradBg}"></div>
    <div class="brand-socials">
      ${brand.url ? `<a href="${brand.url}" target="_blank" rel="noopener noreferrer" class="brand-pill" title="Sito Web">${svgGlobe()}</a>` : ""}
      ${brand.facebook ? `<a href="${brand.facebook}" target="_blank" rel="noopener noreferrer" class="brand-pill" title="Facebook">${svgFacebook()}</a>` : ""}
      ${brand.instagram ? `<a href="${brand.instagram}" target="_blank" rel="noopener noreferrer" class="brand-pill" title="Instagram">${svgInstagram()}</a>` : ""}
    </div>
    ${buildReferenteHTML(brand, bc)}
  </div>`;
}

function renderBrandPage() {
  const main = document.getElementById("detailMain");
  const brands = _data.brands;

  main.innerHTML = `
    <br>
    <div class="brand-links brand-links-2col">
      ${brands.map(buildBrandItemHTML).join("")}
    </div>`;

  // Listener per l'animazione dei brand
  main.querySelectorAll(".brand-item").forEach((item, idx) => {
    const brand = brands[idx];
    const bc = brand.color || "#dc2626";
    const brgb = hexToRgb(bc);
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

  container.innerHTML = brands.map(buildBrandItemHTML).join("");

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
  const setEl = (id, fn) => {
    const el = document.getElementById(id);
    if (el) fn(el);
  };

  setEl("companyName", (el) => (el.textContent = company.fullName));

  setEl("fullAddress", (el) => {
    const full = `${company.address}, ${company.cap} ${company.city} (${company.province})`;
    el.textContent = full;
    el.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(full)}`;
  });

  setEl("footerPhone", (el) => {
    el.href = `tel:${company.phone}`;
    el.textContent = `Tel: ${formatPhoneNumber(company.phone)}`;
  });

  setEl("footerEmail", (el) => {
    el.href = `mailto:${company.email}`;
    el.textContent = `Email: ${company.email}`;
  });

  setEl("footerWhatsApp", (el) => {
    const n = company.phone.replace(/\+/g, "").replace(/\s/g, "");
    el.href = `https://wa.me/${n}`;
    el.textContent = `WhatsApp: ${formatPhoneNumber(company.phone)}`;
    el.onclick = openWhatsApp;
  });

  setEl("footerPiva", (el) => (el.textContent = `P.IVA: ${company.piva}`));

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
const svgGlobe = () =>
  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
const svgInstagram = () =>
  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>`;

const svgFacebook = () =>
  `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`;

const svgPhone = () =>
  `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 16z"/></svg>`;

const svgEmail = () =>
  `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;

const svgWhatsApp = () =>
  `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>`;

function buildReferenteHTML(brand, color) {
  let referenti = brand.referenti || (brand.referente ? [brand.referente] : []);
  const referentiConDati = referenti.filter(
    (r) => r && (r.phone || r.whatsapp || r.email),
  );

  const bc = brand.color || "#dc2626";
  const bcl = brand.colorLight || bc;
  const brgb = hexToRgb(bc);

  const shimmerLine = `<div class="brand-ref-line" style="width:100%;height:4px;border-radius:2px;position:relative;overflow:hidden;background:linear-gradient(90deg,transparent,rgba(${brgb},0.3) 15%,${bc} 35%,${bcl} 50%,${bc} 65%,rgba(${brgb},0.3) 85%,transparent);margin-top:12px;"><span class="brand-ref-shimmer"></span></div>`;

  // Nessun referente: solo testo colorato, niente riga animata
  if (!referentiConDati.length) {
    return `<div class="brand-ref-empty" style="--bc:${bc};--bcl:${bcl};">
      <span class="brand-ref-empty-text">Nessun referente</span>
    </div>`;
  }

  const refBlocks = referentiConDati
    .map((r, idx) => {
      const items = [];
      if (r.phone)
        items.push(
          `<a href="tel:${r.phone}" class="brand-pill" title="Cellulare: ${formatPhoneNumber(r.phone)}">${svgPhone()}</a>`,
        );
      if (r.whatsapp) {
        const n = r.whatsapp.replace(/\+/g, "").replace(/\s/g, "");
        items.push(
          `<a href="https://wa.me/${n}" target="_blank" rel="noopener noreferrer" class="brand-pill" title="WhatsApp: ${formatPhoneNumber(r.whatsapp)}" onclick="openWhatsApp(event)">${svgWhatsApp()}</a>`,
        );
      }
      if (r.email)
        items.push(
          `<a href="mailto:${r.email}" class="brand-pill" title="Email: ${r.email}">${svgEmail()}</a>`,
        );
      if (!items.length) return "";

      const nameLabel = r.name
        ? `<div class="brand-ref-name-label">${r.name}</div>`
        : referentiConDati.length > 1
          ? `<div class="brand-ref-name-label brand-ref-name-num">#${idx + 1}</div>`
          : "";

      return `
    <div class="brand-ref-block">
      ${nameLabel}
      <div class="brand-ref-contacts">${items.join("")}</div>
    </div>`;
    })
    .join("");

  const sectionLabel = referentiConDati.length > 1 ? "REFERENTI" : "REFERENTE";
  const sectionHeader = `
    <div class="brand-ref-separator" style="margin-top:28px;">
      <span class="brand-ref-sep-label">${sectionLabel}</span>
    </div>`;

  return `<div class="brand-ref-wrap">${sectionHeader}${shimmerLine}<div class="brand-ref-blocks-wrap">${refBlocks}</div></div>`;
}