document.addEventListener("DOMContentLoaded", () => {
  loadData();
  document.getElementById("year").textContent = new Date().getFullYear();
  initHamburgerMenu();
});

let categoriesData = [];
let activeFilters = new Set();

async function loadData() {
  try {
    const response = await fetch("data.json");
    const data = await response.json();

    categoriesData = data.categories;
    renderCategoryButtons(data.categories);
    renderCategories(data.categories);
    renderBrands(data.brands);
    populateFooter(data.company);
    handleLogos(data.company.logo);
    restoreSavedFilter(data.categories.length);
  } catch (error) {
    console.error("Errore caricamento dati:", error);
  }
}

function initHamburgerMenu() {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const sidebarMenu = document.getElementById("sidebarMenu");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const sidebarClose = document.getElementById("sidebarClose");
  const selectAllBtn = document.getElementById("selectAllBtn");
  const clearAllBtn = document.getElementById("clearAllBtn");

  function openSidebar() {
    hamburgerBtn.classList.add("active");
    sidebarMenu.classList.add("active");
    sidebarOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    hamburgerBtn.classList.remove("active");
    sidebarMenu.classList.remove("active");
    sidebarOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  hamburgerBtn.addEventListener("click", openSidebar);
  sidebarClose.addEventListener("click", closeSidebar);
  sidebarOverlay.addEventListener("click", closeSidebar);

  selectAllBtn.addEventListener("click", () => {
    selectAllCategories();
  });

  clearAllBtn.addEventListener("click", () => {
    clearAllCategories();
  });

  // Chiudi con ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebarMenu.classList.contains("active")) {
      closeSidebar();
    }
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

function renderCategoryButtons(categories) {
  const container = document.getElementById("categoryButtonsContainer");
  if (!container) return;

  container.innerHTML = categories
    .map(
      (cat, index) => `
        <button class="category-btn" data-category="${index}">
          <span class="category-icon">${getEmojiForCategory(index)}</span>
          <span class="category-name">${cat.name}</span>
        </button>
      `
    )
    .join("");

  // Aggiungi event listeners
  const allBtn = document.querySelector('.category-btn[data-category="all"]');
  allBtn.addEventListener("click", () => {
    selectAllCategories();
  });

  container.querySelectorAll(".category-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const category = btn.getAttribute("data-category");
      toggleCategory(category);
    });
  });
}

function toggleCategory(categoryIndex) {
  const allBtn = document.querySelector('.category-btn[data-category="all"]');
  
  // Se clicchi su "Tutte"
  if (categoryIndex === "all") {
    // Se già tutte selezionate, non fare nulla
    if (activeFilters.size === 0) {
      return;
    }
    // Altrimenti seleziona tutte
    selectAllCategories();
    return;
  }

  // Toggle la categoria
  if (activeFilters.has(categoryIndex)) {
    // Deseleziona questa categoria
    activeFilters.delete(categoryIndex);
  } else {
    // Se nessuna categoria è selezionata (mostra tutte), 
    // seleziona tutte TRANNE questa
    if (activeFilters.size === 0) {
      // Aggiungi tutte le categorie tranne quella cliccata
      for (let i = 0; i < categoriesData.length; i++) {
        if (i.toString() !== categoryIndex) {
          activeFilters.add(i.toString());
        }
      }
    } else {
      // Altrimenti aggiungi normalmente
      activeFilters.add(categoryIndex);
    }
  }

  // Se tutte le categorie sono selezionate, passa a "mostra tutte"
  if (activeFilters.size === categoriesData.length) {
    selectAllCategories();
    return;
  }

  // Se nessuna categoria è selezionata, mostra tutte
  if (activeFilters.size === 0) {
    selectAllCategories();
    return;
  }

  // Aggiorna UI
  allBtn.classList.remove("active");
  updateCategoryButtons();
  filterCategories();
  updateActiveFiltersBadges();
  saveFilterToStorage();
}

function selectAllCategories() {
  activeFilters.clear();
  const allBtn = document.querySelector('.category-btn[data-category="all"]');
  allBtn.classList.add("active");
  
  document.querySelectorAll('.category-btn:not([data-category="all"])').forEach((btn) => {
    btn.classList.remove("active");
  });
  
  filterCategories();
  updateActiveFiltersBadges();
  saveFilterToStorage();
}

function clearAllCategories() {
  activeFilters.clear();
  updateCategoryButtons();
  selectAllCategories();
}

function updateCategoryButtons() {
  const allBtn = document.querySelector('.category-btn[data-category="all"]');
  
  if (activeFilters.size === 0) {
    allBtn.classList.add("active");
  } else {
    allBtn.classList.remove("active");
  }

  document.querySelectorAll('.category-btn:not([data-category="all"])').forEach((btn) => {
    const category = btn.getAttribute("data-category");
    if (activeFilters.has(category)) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function filterCategories() {
  const sections = document.querySelectorAll(".category-section");

  sections.forEach((section) => {
    const categoryIndex = section.getAttribute("data-category");
    
    if (activeFilters.size === 0 || activeFilters.has(categoryIndex)) {
      section.classList.remove("hidden");
    } else {
      section.classList.add("hidden");
    }
  });

  // Smooth scroll to top
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function updateActiveFiltersBadges() {
  const container = document.getElementById("activeFilters");
  if (!container) return;

  if (activeFilters.size === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = Array.from(activeFilters)
    .map((index) => {
      const category = categoriesData[parseInt(index)];
      if (!category) return "";
      
      return `
        <div class="filter-badge">
          <span class="filter-badge-icon">${getEmojiForCategory(parseInt(index))}</span>
          <span>${category.name}</span>
          <button class="filter-badge-remove" data-category="${index}" aria-label="Rimuovi filtro">×</button>
        </div>
      `;
    })
    .join("");

  // Aggiungi event listeners per rimuovere
  container.querySelectorAll(".filter-badge-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      const category = btn.getAttribute("data-category");
      toggleCategory(category);
    });
  });
}

function saveFilterToStorage() {
  try {
    const filterArray = Array.from(activeFilters);
    localStorage.setItem("palminoMotorsFilter", JSON.stringify(filterArray));
  } catch (error) {
    // localStorage not available
  }
}

function restoreSavedFilter(totalCategories) {
  try {
    const saved = localStorage.getItem("palminoMotorsFilter");
    if (!saved) {
      selectAllCategories();
      return;
    }

    const filter = JSON.parse(saved);
    
    if (Array.isArray(filter) && filter.length > 0) {
      activeFilters = new Set(filter.filter(f => parseInt(f) < totalCategories));
      
      if (activeFilters.size === 0) {
        selectAllCategories();
      } else {
        updateCategoryButtons();
        filterCategories();
        updateActiveFiltersBadges();
      }
    } else {
      selectAllCategories();
    }
  } catch (error) {
    selectAllCategories();
  }
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
                  <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="link-card">
                    <span class="link-icon">${link.icon}</span>
                    <div class="link-info">
                      <h3>${link.title}</h3>
                      <p>${link.description}</p>
                    </div>
                    <svg class="link-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </a>`
              )
              .join("")}
          </div>
        </section>`
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
        </div>`
    )
    .join("");
}

function populateFooter(company) {
  const companyNameEl = document.getElementById("companyName");
  if (companyNameEl) {
    companyNameEl.textContent = company.fullName.toUpperCase();
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
    phoneLink.textContent = `Tel: ${company.phone}`;
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
    whatsappLink.textContent = `WhatsApp: ${company.phone}`;
  }

  const pivaEl = document.getElementById("footerPiva");
  if (pivaEl) {
    pivaEl.textContent = `P.IVA: ${company.piva}`;
  }
}