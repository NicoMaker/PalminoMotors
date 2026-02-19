document.addEventListener("DOMContentLoaded", () => {
  loadData();
  document.getElementById("year").textContent = new Date().getFullYear();
});

// ──────────────────────────────────────────────
//  UTILS
// ──────────────────────────────────────────────
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

function openWhatsApp(event) {
  event.preventDefault();
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const webUrl = "https://web.whatsapp.com/";
  if (isMobile) {
    let t = setTimeout(() => {
      if (document.visibilityState !== "hidden") window.open(webUrl, "_blank");
    }, 2000);
    document.addEventListener(
      "visibilitychange",
      function h() {
        if (document.visibilityState === "hidden") {
          clearTimeout(t);
          document.removeEventListener("visibilitychange", h);
        }
      },
      { once: true },
    );
    window.location.href = "whatsapp://";
  } else {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    let t = setTimeout(() => {
      document.body.removeChild(iframe);
      window.open(webUrl, "_blank");
    }, 1500);
    document.addEventListener(
      "visibilitychange",
      function h() {
        if (document.visibilityState === "hidden") {
          clearTimeout(t);
          document.body.removeChild(iframe);
          document.removeEventListener("visibilitychange", h);
        }
      },
      { once: true },
    );
    iframe.src = "whatsapp://";
  }
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text, term) {
  if (!term) return text;
  const re = new RegExp(`(${escapeRegExp(term)})`, "gi");
  return text.replace(re, '<mark class="highlight">$1</mark>');
}

// ──────────────────────────────────────────────
//  STATE  (no localStorage — sempre da zero)
// ──────────────────────────────────────────────
const state = {
  selectedCategories: new Set(), // empty = tutte
  searchQuery: "",
};

// ──────────────────────────────────────────────
//  LOAD
// ──────────────────────────────────────────────
async function loadData() {
  try {
    const res = await fetch("data.json");
    const data = await res.json();

    renderCategories(data.categories);
    renderBrands(data.brands);
    populateFooter(data.company);
    handleLogos(data.company.logo);
    applyDynamicColors(data.categories, data.brands);
    buildChips(data.categories);
    initSearch();
    initReset();
    updateView();
  } catch (e) {
    console.error("Errore caricamento dati:", e);
  }
}

// ──────────────────────────────────────────────
//  CHIPS (multi-select)
// ──────────────────────────────────────────────
function getEmojiForCategory(i) {
  return ["🌐", "🛠️", "📊", "📱", "☁️", "📅", "📧", "🏦"][i] ?? "📂";
}

function buildChips(categories) {
  const container = document.getElementById("categoryChips");

  // "Tutte" chip già nel HTML — collega evento
  const allChip = container.querySelector(".chip-all");
  allChip.addEventListener("click", () => {
    state.selectedCategories.clear();
    updateChipUI();
    updateView();
  });

  categories.forEach((cat, i) => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.dataset.index = i;

    const dot = document.createElement("span");
    dot.className = "chip-dot";
    dot.style.background = `linear-gradient(135deg, ${cat.color} 0%, ${cat.colorLight || cat.color} 100%)`;

    chip.appendChild(dot);
    chip.appendChild(document.createTextNode(cat.name));
    chip.style.setProperty("--chip-color", cat.color);

    chip.addEventListener("click", () => {
      const idx = String(i);
      if (state.selectedCategories.has(idx)) {
        state.selectedCategories.delete(idx);
      } else {
        state.selectedCategories.add(idx);
        // Se tutte le categorie sono selezionate, torna a "Tutte"
        const totalCategories = document.querySelectorAll('#categoryChips .chip:not(.chip-all)').length;
        if (state.selectedCategories.size >= totalCategories) {
          state.selectedCategories.clear();
        }
      }
      updateChipUI();
      updateView();
    });

    container.appendChild(chip);
  });

  // Arrow scroll buttons
  const scrollEl = container;
  const leftBtn = document.getElementById("chipsLeft");
  const rightBtn = document.getElementById("chipsRight");

  function updateArrows() {
    if (!leftBtn || !rightBtn) return;
    leftBtn.disabled = scrollEl.scrollLeft <= 2;
    rightBtn.disabled =
      scrollEl.scrollLeft + scrollEl.clientWidth >= scrollEl.scrollWidth - 2;
  }

  leftBtn?.addEventListener("click", () => {
    scrollEl.scrollBy({ left: -200, behavior: "smooth" });
  });
  rightBtn?.addEventListener("click", () => {
    scrollEl.scrollBy({ left: 200, behavior: "smooth" });
  });
  scrollEl.addEventListener("scroll", updateArrows);
  updateArrows();
  // Re-check after fonts load
  window.addEventListener("load", updateArrows);
}

function updateChipUI() {
  const chips = document.querySelectorAll("#categoryChips .chip");
  const allChip = document.querySelector(".chip-all");
  const isAll = state.selectedCategories.size === 0;

  allChip.classList.toggle("active", isAll);

  chips.forEach((chip) => {
    if (chip.classList.contains("chip-all")) return;
    const idx = chip.dataset.index;
    const active = state.selectedCategories.has(idx);
    chip.classList.toggle("active", active);
    if (active) {
      chip.style.borderColor = chip
        .querySelector(".chip-dot")
        .style.background.split("(")[1]
        ?.split(")")[0]
        ? chip.style.getPropertyValue("--chip-color")
        : "";
      chip.style.borderColor = chip.style.getPropertyValue("--chip-color");
      chip.style.boxShadow = `0 0 0 2px ${chip.style.getPropertyValue("--chip-color")}22, 0 4px 16px ${chip.style.getPropertyValue("--chip-color")}22`;
      chip.style.color = "#f0f0f8";
    } else {
      chip.style.borderColor = "";
      chip.style.boxShadow = "";
      chip.style.color = "";
    }
  });
}

// ──────────────────────────────────────────────
//  SEARCH
// ──────────────────────────────────────────────
function initSearch() {
  const input = document.getElementById("searchInput");
  const clear = document.getElementById("searchClear");

  input.addEventListener("input", () => {
    state.searchQuery = input.value.trim();
    clear.classList.toggle("visible", state.searchQuery.length > 0);
    updateView();
  });

  clear.addEventListener("click", () => {
    input.value = "";
    state.searchQuery = "";
    clear.classList.remove("visible");
    updateView();
    input.focus();
  });
}

function initReset() {
  const btn = document.getElementById("resetBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    state.selectedCategories.clear();
    state.searchQuery = "";
    document.getElementById("searchInput").value = "";
    document.getElementById("searchClear").classList.remove("visible");
    updateChipUI();
    updateView();
  });
}

// ──────────────────────────────────────────────
//  UPDATE VIEW  (filter + search combined)
// ──────────────────────────────────────────────
function updateView() {
  const sections = document.querySelectorAll(".category-section");
  const query = state.searchQuery.toLowerCase();
  const hasFilter = state.selectedCategories.size > 0;
  let anyVisible = false;

  sections.forEach((section) => {
    const catIdx = section.getAttribute("data-category");
    const inFilter = !hasFilter || state.selectedCategories.has(catIdx);

    if (!inFilter) {
      section.classList.add("hidden");
      return;
    }

    // search within this section
    const cards = section.querySelectorAll(".link-card");
    let sectionHasMatch = false;

    cards.forEach((card) => {
      const title = card.querySelector(".link-info h3");
      const desc = card.querySelector(".link-info p");

      if (!query) {
        // reset highlights
        if (title) title.textContent = title.textContent;
        if (desc) desc.textContent = desc.textContent;
        card.classList.remove("search-hidden");
        sectionHasMatch = true;
      } else {
        const rawTitle =
          title?.getAttribute("data-raw") || title?.textContent || "";
        const rawDesc =
          desc?.getAttribute("data-raw") || desc?.textContent || "";

        // store original text on first pass
        if (title && !title.hasAttribute("data-raw"))
          title.setAttribute("data-raw", title.textContent);
        if (desc && !desc.hasAttribute("data-raw"))
          desc.setAttribute("data-raw", desc.textContent);

        const titleMatch = rawTitle.toLowerCase().includes(query);
        const descMatch = rawDesc.toLowerCase().includes(query);

        if (titleMatch || descMatch) {
          card.classList.remove("search-hidden");
          if (title)
            title.innerHTML = highlightText(rawTitle, state.searchQuery);
          if (desc) desc.innerHTML = highlightText(rawDesc, state.searchQuery);
          sectionHasMatch = true;
        } else {
          card.classList.add("search-hidden");
          if (title) title.innerHTML = rawTitle;
          if (desc) desc.innerHTML = rawDesc;
        }
      }
    });

    // Aggiorna il contatore visibile della sezione
    const countEl = section.querySelector(".category-count");
    if (countEl) {
      const visibleCount = section.querySelectorAll(".link-card:not(.search-hidden)").length;
      countEl.textContent = visibleCount;
    }

    if (sectionHasMatch) {
      section.classList.remove("hidden");
      anyVisible = true;
    } else {
      section.classList.add("hidden");
    }
  });

  const noResults = document.getElementById("noResults");
  if (noResults) noResults.style.display = anyVisible ? "none" : "flex";
}

// ──────────────────────────────────────────────
//  RENDER
// ──────────────────────────────────────────────
function renderCategories(categories) {
  const container = document.getElementById("linksContainer");
  if (!container) return;

  container.innerHTML = categories
    .map(
      (cat, catIndex) => `
    <section class="category-section" data-category="${catIndex}">
      <div class="category-header">
        <span class="category-dot" style="background: linear-gradient(135deg, ${cat.color} 0%, ${cat.colorLight || cat.color} 100%);"></span>
        <h2 class="category-title">${cat.name}</h2>
        <span class="category-count">${cat.links.length}</span>
      </div>
      <div class="links-grid">
        ${cat.links
          .map(
            (link) => `
          <a href="${link.url}"
             target="_blank"
             rel="noopener noreferrer"
             class="link-card"
             ${link.title.toLowerCase().includes("whatsapp") ? 'onclick="openWhatsApp(event); return false;"' : ""}>
            <span class="link-icon">${link.icon}</span>
            <div class="link-info">
              <h3>${link.title}</h3>
              <p>${link.description}</p>
            </div>
            <svg class="link-arrow" width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>`,
          )
          .join("")}
      </div>
    </section>`,
    )
    .join("");
}

function renderBrands(brands) {
  const container = document.getElementById("brandContainer");
  if (!container) return;

  // Aggiorna il conteggio dinamico accanto al titolo
  const countBadge = document.getElementById("brandCount");
  if (countBadge) {
    countBadge.textContent = brands?.length ? `${brands.length}` : "";
  }

  if (!brands?.length) {
    container.innerHTML = "<p>Nessun marchio disponibile.</p>";
    return;
  }

  container.innerHTML = brands
    .map(
      (brand) => `
    <div class="brand-item">
      <span class="brand-name">${brand.name}</span>
      <div class="brand-gradient"></div>
      <div class="brand-socials">
        ${brand.url ? `<a href="${brand.url}"       target="_blank" rel="noopener noreferrer" class="brand-pill" aria-label="Sito ${brand.name}">${svgGlobe()}</a>` : ""}
        ${brand.facebook ? `<a href="${brand.facebook}"  target="_blank" rel="noopener noreferrer" class="brand-pill" aria-label="Facebook ${brand.name}">${svgFacebook()}</a>` : ""}
        ${brand.instagram ? `<a href="${brand.instagram}" target="_blank" rel="noopener noreferrer" class="brand-pill" aria-label="Instagram ${brand.name}">${svgInstagram()}</a>` : ""}
      </div>
    </div>`,
    )
    .join("");
}

function svgGlobe() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
}
function svgFacebook() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`;
}
function svgInstagram() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>`;
}

// ──────────────────────────────────────────────
//  DYNAMIC COLORS
// ──────────────────────────────────────────────
function applyDynamicColors(categories, brands) {
  categories.forEach((cat, index) => {
    const color = cat.color || "#ffffff";
    const colorLight = cat.colorLight || color;
    const rgb = hexToRgb(color);
    const soft = `rgba(${rgb}, 0.14)`;
    const medium = `rgba(${rgb}, 0.28)`;
    const softBorder = `rgba(${rgb}, 0.20)`;

    const section = document.querySelector(
      `.category-section[data-category="${index}"]`,
    );
    if (!section) return;

    const title = section.querySelector(".category-title");
    if (title) {
      title.style.backgroundImage = `linear-gradient(135deg, ${color} 0%, ${colorLight} 100%)`;
      title.style.webkitBackgroundClip = "text";
      title.style.backgroundClip = "text";
      title.style.webkitTextFillColor = "transparent";
    }

    const cards = section.querySelectorAll(".link-card");
    cards.forEach((card) => {
      card.style.borderColor = color;

      card.addEventListener("mouseenter", () => {
        card.style.boxShadow = `0 8px 32px rgba(${rgb}, 0.25)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.boxShadow = "";
      });
    });

    const icons = section.querySelectorAll(".link-icon");
    icons.forEach((icon) => {
      icon.style.background = soft;
      icon.style.borderColor = softBorder;

      const card = icon.closest(".link-card");
      if (card) {
        card.addEventListener("mouseenter", () => {
          icon.style.background = medium;
          icon.style.borderColor = color;
          icon.style.boxShadow = `0 0 20px ${soft}`;
        });
        card.addEventListener("mouseleave", () => {
          icon.style.background = soft;
          icon.style.borderColor = softBorder;
          icon.style.boxShadow = "";
        });
      }
    });

    const arrows = section.querySelectorAll(".link-arrow");
    arrows.forEach((a) => {
      a.style.color = color;
    });
  });

  brands.forEach((brand, index) => {
    const color = brand.color || "#dc2626";
    const colorLight = brand.colorLight || "#f97316";
    const rgb = hexToRgb(color);

    const items = document.querySelectorAll(".brand-item");
    const item = items[index];
    if (!item) return;

    item.style.borderColor = `rgba(${rgb}, 0.6)`;
    item.style.setProperty("--brand-color", color);
    item.style.setProperty("--brand-color-light", colorLight);

    const gradientBar = item.querySelector(".brand-gradient");
    if (gradientBar) {
      gradientBar.style.background = `linear-gradient(90deg, transparent, rgba(${rgb},0.3) 15%, ${color} 35%, ${colorLight} 50%, ${color} 65%, rgba(${rgb},0.3) 85%, transparent)`;
    }

    const nameEl = item.querySelector(".brand-name");
    if (nameEl) {
      nameEl.style.backgroundImage = `linear-gradient(135deg, #fafafa 0%, ${color} 100%)`;
      nameEl.style.webkitBackgroundClip = "text";
      nameEl.style.backgroundClip = "text";
      nameEl.style.webkitTextFillColor = "transparent";
    }

    item.addEventListener("mouseenter", () => {
      item.style.borderColor = color;
      item.style.boxShadow = `0 8px 32px rgba(${rgb}, 0.2)`;
      item.style.transform = "translateY(-3px)";
    });
    item.addEventListener("mouseleave", () => {
      item.style.borderColor = `rgba(${rgb}, 0.6)`;
      item.style.boxShadow = "";
      item.style.transform = "";
    });
  });
}

// ──────────────────────────────────────────────
//  LOGO
// ──────────────────────────────────────────────
function handleLogos(logoPath) {
  if (!logoPath) return;

  const logoArea = document.querySelector(".logo-area");
  const circle = document.querySelector(".logo-circle");
  const headerImg = document.createElement("img");
  headerImg.src = logoPath;
  headerImg.className = "main-logo";
  headerImg.alt = "Logo";
  headerImg.crossOrigin = "anonymous";
  headerImg.onerror = () => headerImg.remove();

  if (circle) circle.replaceWith(headerImg);
  else if (logoArea) logoArea.prepend(headerImg);

  const footerCol = document.getElementById("footerCompanyCol");
  if (footerCol) {
    const footerImg = document.createElement("img");
    footerImg.src = logoPath;
    footerImg.className = "footer-logo";
    footerImg.alt = "Logo Footer";
    footerImg.crossOrigin = "anonymous";
    footerImg.onerror = () => footerImg.remove();
    footerCol.prepend(footerImg);
  }
}

// ──────────────────────────────────────────────
//  FOOTER
// ──────────────────────────────────────────────
function populateFooter(company) {
  const companyNameEl = document.getElementById("companyName");
  if (companyNameEl)
    companyNameEl.textContent = company.fullName
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const addressLink = document.getElementById("fullAddress");
  if (addressLink) {
    const full = `${company.address}, ${company.cap} ${company.city} (${company.province})`;
    addressLink.textContent = full;
    addressLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(full)}`;
  }

  const phoneLink = document.getElementById("footerPhone");
  if (phoneLink) {
    phoneLink.href = `tel:${company.phone}`;
    phoneLink.textContent = `Tel: ${formatPhoneNumber(company.phone)}`;
  }

  const emailLink = document.getElementById("footerEmail");
  if (emailLink) {
    emailLink.href = `mailto:${company.email}`;
    emailLink.textContent = `Email: ${company.email}`;
  }

  const waLink = document.getElementById("footerWhatsApp");
  if (waLink) {
    const n = company.phone.replace(/\+/g, "").replace(/\s/g, "");
    waLink.href = `https://wa.me/${n}`;
    waLink.textContent = `WhatsApp: ${formatPhoneNumber(company.phone)}`;
  }

  const pivaEl = document.getElementById("footerPiva");
  if (pivaEl) pivaEl.textContent = `P.IVA: ${company.piva}`;
}