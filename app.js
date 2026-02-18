document.addEventListener("DOMContentLoaded", () => {
  loadData();
  document.getElementById("year").textContent = new Date().getFullYear();
});

/**
 * Converte un colore HEX in stringa "r, g, b" per uso in rgba()
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "255, 255, 255";
}

/**
 * Formatta un numero di telefono per la visualizzazione
 */
function formatPhoneNumber(phone) {
  if (!phone) return phone;
  let cleaned = phone.replace(/\s+/g, "");
  if (cleaned.startsWith("+39")) {
    return cleaned.replace(/(\+39)(\d{3})(\d{3})(\d{4})/, "$1 $2 $3 $4");
  } else if (cleaned.startsWith("+")) {
    return cleaned.replace(/(\+\d{1,3})(\d{3})(\d{3})(\d{4})/, "$1 $2 $3 $4");
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
  } else if (cleaned.length > 6) {
    return cleaned.replace(/(\d{3})(?=\d)/g, "$1 ");
  }
  return phone;
}

/**
 * Gestisce l'apertura di WhatsApp:
 * - Su mobile: tenta di aprire l'app installata, altrimenti WhatsApp Web
 * - Su desktop: apre direttamente WhatsApp Web
 */
function openWhatsApp(event, element) {
  event.preventDefault();
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    // Su mobile proviamo lo schema nativo whatsapp://
    // Se l'app è installata si apre, altrimenti dopo il timeout apriamo WhatsApp Web
    const appUrl = "whatsapp://";
    const webUrl = "https://web.whatsapp.com/";

    // Nascondi la pagina: se torna visibile entro 2s l'app non è installata
    let fallbackTimer = setTimeout(() => {
      if (document.visibilityState !== "hidden") {
        window.open(webUrl, "_blank");
      }
    }, 2000);

    document.addEventListener(
      "visibilitychange",
      function onHide() {
        if (document.visibilityState === "hidden") {
          clearTimeout(fallbackTimer);
          document.removeEventListener("visibilitychange", onHide);
        }
      },
      { once: true },
    );

    window.location.href = appUrl;
  } else {
    // Su desktop: tenta di aprire l'app con iframe nascosto (non blocca la pagina)
    // Se l'app non è installata, apre WhatsApp Web dopo il timeout
    const webUrl = "https://web.whatsapp.com/";

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    let fallbackTimer = setTimeout(() => {
      document.body.removeChild(iframe);
      window.open(webUrl, "_blank");
    }, 1500);

    document.addEventListener(
      "visibilitychange",
      function onHide() {
        if (document.visibilityState === "hidden") {
          clearTimeout(fallbackTimer);
          document.body.removeChild(iframe);
          document.removeEventListener("visibilitychange", onHide);
        }
      },
      { once: true },
    );

    iframe.src = "whatsapp://";
  }
}

async function loadData() {
  try {
    const response = await fetch("data.json");
    const data = await response.json();

    renderCategoryFilter(data.categories);
    renderCategories(data.categories);
    renderBrands(data.brands);
    populateFooter(data.company);
    handleLogos(data.company.logo);
    restoreSavedFilter(data.categories.length);
    applyDynamicColors(data.categories, data.brands);
  } catch (error) {
    console.error("Errore caricamento dati:", error);
  }
}

/**
 * Applica i colori dinamici via JS:
 * - Bordi delle card di categoria
 * - Titoli di sezione (gradient inline)
 * - Icone delle card
 * - Frecce delle card
 * - Brand: bordo, gradient-bar e nome
 */
function applyDynamicColors(categories, brands) {
  // --- CATEGORIE ---
  categories.forEach((cat, index) => {
    const color = cat.color || "#ffffff";
    const colorLight = cat.colorLight || color;
    const rgb = hexToRgb(color);
    const soft = `rgba(${rgb}, 0.15)`;
    const medium = `rgba(${rgb}, 0.30)`;
    const softBorder = `rgba(${rgb}, 0.20)`;

    const section = document.querySelector(
      `.category-section[data-category="${index}"]`,
    );
    if (!section) return;

    // Titolo: gradient inline tramite CSS custom properties su style
    const title = section.querySelector(".category-title");
    if (title) {
      title.style.backgroundImage = `linear-gradient(135deg, ${color} 0%, ${colorLight} 100%)`;
      title.style.webkitBackgroundClip = "text";
      title.style.backgroundClip = "text";
      title.style.webkitTextFillColor = "transparent";
    }

    // Card: bordo colorato + hover shadow
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

    // Icone: sfondo soft + bordo
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

    // Frecce: colore categoria
    const arrows = section.querySelectorAll(".link-arrow");
    arrows.forEach((arrow) => {
      arrow.style.color = color;
    });
  });

  // --- BRAND ---
  brands.forEach((brand, index) => {
    const color = brand.color || "#dc2626";
    const colorLight = brand.colorLight || "#f97316";
    const rgb = hexToRgb(color);
    const rgbLight = hexToRgb(colorLight);

    const items = document.querySelectorAll(".brand-item");
    const item = items[index];
    if (!item) return;

    // Bordo card brand
    item.style.borderColor = color;

    // Pseudo-sfondo ::before non è accessibile via JS direttamente,
    // usiamo una variabile CSS inline sull'elemento
    item.style.setProperty("--brand-color", color);
    item.style.setProperty("--brand-color-light", colorLight);

    // Gradient bar decorativa
    const gradientBar = item.querySelector(".brand-gradient");
    if (gradientBar) {
      gradientBar.style.background = `linear-gradient(
        90deg,
        transparent 0%,
        rgba(${rgb}, 0.3) 15%,
        ${color} 35%,
        ${colorLight} 50%,
        ${color} 65%,
        rgba(${rgb}, 0.3) 85%,
        transparent 100%
      )`;
    }

    // Nome brand: gradient testo
    const nameEl = item.querySelector(".brand-name");
    if (nameEl) {
      nameEl.style.backgroundImage = `linear-gradient(135deg, #fafafa 0%, ${color} 100%)`;
      nameEl.style.webkitBackgroundClip = "text";
      nameEl.style.backgroundClip = "text";
      nameEl.style.webkitTextFillColor = "transparent";
    }

    // Hover card brand
    item.addEventListener("mouseenter", () => {
      item.style.borderColor = color;
      item.style.boxShadow = `0 12px 40px rgba(${rgb}, 0.3)`;
    });
    item.addEventListener("mouseleave", () => {
      item.style.borderColor = color;
      item.style.boxShadow = "";
    });

    // Brand pill hover: usa il colore del brand invece dell'accent globale
    const pills = item.querySelectorAll(".brand-pill");
    pills.forEach((pill) => {
      pill.addEventListener("mouseenter", () => {
        pill.style.setProperty("--pill-bg", color);
        pill.style.borderColor = color;
        pill.style.boxShadow = `0 8px 20px rgba(${rgb}, 0.35)`;
      });
      pill.addEventListener("mouseleave", () => {
        pill.style.borderColor = "";
        pill.style.boxShadow = "";
      });
    });
  });
}

function handleLogos(logoPath) {
  if (!logoPath) return;

  const logoArea = document.querySelector(".logo-area");
  const oldCircle = document.querySelector(".logo-circle");

  const headerImg = document.createElement("img");
  headerImg.src = logoPath;
  headerImg.className = "main-logo";
  headerImg.alt = "Palmino Motors Logo";
  headerImg.crossOrigin = "anonymous";

  if (oldCircle) {
    oldCircle.replaceWith(headerImg);
  } else if (logoArea) {
    logoArea.prepend(headerImg);
  }

  const footerCol = document.getElementById("footerCompanyCol");
  if (footerCol) {
    const footerImg = document.createElement("img");
    footerImg.src = logoPath;
    footerImg.className = "footer-logo";
    footerImg.alt = "Logo Footer";
    footerImg.crossOrigin = "anonymous";
    footerCol.prepend(footerImg);
  }
}

function getEmojiForCategory(index) {
  const emojis = ["🌐", "🛠️", "📊", "📱", "☁️", "📅", "📧", "🏦"];
  return emojis[index] || "📂";
}

function renderCategoryFilter(categories) {
  const filterSelect = document.getElementById("filterSelect");

  if (!filterSelect) {
    console.error("Element filterSelect not found");
    return;
  }

  categories.forEach((cat, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${getEmojiForCategory(index)} ${cat.name}`;
    filterSelect.appendChild(option);
  });

  filterSelect.addEventListener("change", (e) => {
    const value = e.target.value;
    if (value === "all") {
      filterCategories("all");
      saveFilterToStorage("all");
    } else {
      filterCategories([value]);
      saveFilterToStorage([value]);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function saveFilterToStorage(filter) {
  try {
    localStorage.setItem("palminoMotorsFilter", JSON.stringify(filter));
  } catch (error) {
    // localStorage not available
  }
}

function restoreSavedFilter(totalCategories) {
  try {
    const saved = localStorage.getItem("palminoMotorsFilter");
    if (!saved) {
      filterCategories("all");
      return;
    }

    const filter = JSON.parse(saved);
    const filterSelect = document.getElementById("filterSelect");
    if (!filterSelect) return;

    if (filter === "all") {
      filterSelect.value = "all";
      filterCategories("all");
      return;
    }

    if (Array.isArray(filter) && filter.length === 1) {
      const validFilter = filter[0];
      if (parseInt(validFilter) < totalCategories) {
        filterSelect.value = validFilter;
        filterCategories(filter);
      } else {
        filterSelect.value = "all";
        filterCategories("all");
        saveFilterToStorage("all");
      }
    } else {
      filterSelect.value = "all";
      filterCategories("all");
      saveFilterToStorage("all");
    }
  } catch (error) {
    filterCategories("all");
    saveFilterToStorage("all");
  }
}

function filterCategories(filter) {
  const sections = document.querySelectorAll(".category-section");
  const filters =
    filter === "all" ? "all" : Array.isArray(filter) ? filter : [filter];

  sections.forEach((section) => {
    const categoryIndex = section.getAttribute("data-category");
    if (filters === "all" || filters.includes(categoryIndex)) {
      section.classList.remove("hidden");
    } else {
      section.classList.add("hidden");
    }
  });
}

function renderCategories(categories) {
  const container = document.getElementById("linksContainer");
  if (!container) return;

  container.innerHTML = categories
    .map(
      (cat, catIndex) => `
        <section class="category-section" data-category="${catIndex}">
          <h2 class="category-title">${cat.name}</h2>
          <div class="links-grid">
            ${cat.links
              .map(
                (link) => `
                  <a href="${link.url}"
                     target="_blank"
                     rel="noopener noreferrer"
                     class="link-card"
                     ${link.title.toLowerCase().includes("whatsapp") ? 'onclick="openWhatsApp(event, this); return false;"' : ""}>
                    <span class="link-icon">${link.icon}</span>
                    <div class="link-info">
                      <h3>${link.title}</h3>
                      <p>${link.description}</p>
                    </div>
                    <svg class="link-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
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

  if (!brands || brands.length === 0) {
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
            ${
              brand.url
                ? `<a href="${brand.url}" target="_blank" rel="noopener noreferrer" class="brand-pill" aria-label="Sito ${brand.name}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                   </a>`
                : ""
            }
            ${
              brand.facebook
                ? `<a href="${brand.facebook}" target="_blank" rel="noopener noreferrer" class="brand-pill" aria-label="Facebook ${brand.name}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                   </a>`
                : ""
            }
            ${
              brand.instagram
                ? `<a href="${brand.instagram}" target="_blank" rel="noopener noreferrer" class="brand-pill" aria-label="Instagram ${brand.name}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
                    </svg>
                   </a>`
                : ""
            }
          </div>
        </div>`,
    )
    .join("");
}

function populateFooter(company) {
  const companyNameEl = document.getElementById("companyName");
  if (companyNameEl) {
    companyNameEl.textContent = company.fullName
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  const addressLink = document.getElementById("fullAddress");
  if (addressLink) {
    const fullAddress = `${company.address}, ${company.cap} ${company.city} (${company.province})`;
    addressLink.textContent = fullAddress;
    addressLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
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

  const whatsappLink = document.getElementById("footerWhatsApp");
  if (whatsappLink) {
    const phoneNumber = company.phone.replace(/\+/g, "").replace(/\s/g, "");
    whatsappLink.href = `https://wa.me/${phoneNumber}`;
    whatsappLink.textContent = `WhatsApp: ${formatPhoneNumber(company.phone)}`;
  }

  const pivaEl = document.getElementById("footerPiva");
  if (pivaEl) {
    pivaEl.textContent = `P.IVA: ${company.piva}`;
  }
}
