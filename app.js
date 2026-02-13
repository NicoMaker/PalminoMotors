document.addEventListener("DOMContentLoaded", () => {
  loadData();
  document.getElementById("year").textContent = new Date().getFullYear();
});

async function loadData() {
  try {
    const response = await fetch("data.json");
    const data = await response.json();

    renderCategoryFilters(data.categories);
    renderCategories(data.categories);
    renderBrands(data.brands);
    populateFooter(data.company);
    handleLogos(data.company.logo);
    restoreSavedFilters(data.categories.length);
  } catch (error) {
    console.error("Errore caricamento dati:", error);
  }
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
  } else {
    logoArea.prepend(headerImg);
  }

  const footerCol = document.getElementById("footerCompanyCol");
  const footerImg = document.createElement("img");
  footerImg.src = logoPath;
  footerImg.className = "footer-logo";
  footerImg.alt = "Logo Footer";
  footerImg.crossOrigin = "anonymous";
  footerCol.prepend(footerImg);
}

function renderCategoryFilters(categories) {
  const container = document.getElementById("categoryFilters");

  const allButton = document.createElement("button");
  allButton.className = "filter-btn active";
  allButton.textContent = "Tutte";
  allButton.setAttribute("data-filter", "all");
  container.appendChild(allButton);

  categories.forEach((cat, index) => {
    const button = document.createElement("button");
    button.className = "filter-btn";
    button.textContent = cat.name;
    button.setAttribute("data-filter", index);
    container.appendChild(button);
  });

  container.addEventListener("click", (e) => {
    const button = e.target.closest(".filter-btn");
    if (!button) return;

    const filter = button.getAttribute("data-filter");
    const allBtn = container.querySelector('[data-filter="all"]');
    const categoryButtons = container.querySelectorAll('.filter-btn:not([data-filter="all"])');

    if (filter === "all") {
      // Cliccato "Tutte" - mostra tutto e deseleziona le categorie specifiche
      allBtn.classList.add("active");
      categoryButtons.forEach((btn) => btn.classList.remove("active"));
      filterCategories("all");
      saveFiltersToStorage("all");
    } else {
      // Cliccato una categoria specifica
      
      // SEMPRE rimuovi "Tutte" quando clicchi una categoria
      allBtn.classList.remove("active");
      
      // Toggle della categoria cliccata
      button.classList.toggle("active");

      const activeCategories = Array.from(categoryButtons).filter((btn) =>
        btn.classList.contains("active")
      );

      if (activeCategories.length === 0) {
        // Nessuna categoria selezionata -> torna a "Tutte"
        allBtn.classList.add("active");
        filterCategories("all");
        saveFiltersToStorage("all");
      } else if (activeCategories.length === categoryButtons.length) {
        // Tutte le categorie selezionate -> equivale a "Tutte"
        allBtn.classList.add("active");
        categoryButtons.forEach((btn) => btn.classList.remove("active"));
        filterCategories("all");
        saveFiltersToStorage("all");
      } else {
        // Alcune categorie selezionate -> mostra solo quelle
        const selectedFilters = activeCategories.map((btn) =>
          btn.getAttribute("data-filter")
        );
        filterCategories(selectedFilters);
        saveFiltersToStorage(selectedFilters);
      }
    }
  });
}

function saveFiltersToStorage(filters) {
  try {
    localStorage.setItem("palminoMotorsFilters", JSON.stringify(filters));
  } catch (error) {
    // localStorage not available
  }
}

function restoreSavedFilters(totalCategories) {
  try {
    const saved = localStorage.getItem("palminoMotorsFilters");
    if (!saved) {
      filterCategories("all");
      return;
    }

    const filters = JSON.parse(saved);
    const container = document.getElementById("categoryFilters");
    const allBtn = container.querySelector('[data-filter="all"]');
    const categoryButtons = container.querySelectorAll(
      '.filter-btn:not([data-filter="all"])'
    );

    if (filters === "all") {
      filterCategories("all");
      return;
    }

    if (Array.isArray(filters)) {
      const validFilters = filters.filter((f) => parseInt(f) < totalCategories);

      if (validFilters.length === 0) {
        filterCategories("all");
        saveFiltersToStorage("all");
        return;
      }

      allBtn.classList.remove("active");
      categoryButtons.forEach((btn) => {
        if (validFilters.includes(btn.getAttribute("data-filter"))) {
          btn.classList.add("active");
        }
      });
      filterCategories(validFilters);
    } else {
      filterCategories("all");
      saveFiltersToStorage("all");
    }
  } catch (error) {
    filterCategories("all");
    saveFiltersToStorage("all");
  }
}

function filterCategories(filter) {
  const sections = document.querySelectorAll(".category-section");
  const filters = filter === "all" ? "all" : Array.isArray(filter) ? filter : [filter];

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
  document.getElementById("companyName").textContent = company.fullName.toUpperCase();

  const addressLink = document.getElementById("fullAddress");
  const fullAddress = `${company.address}, ${company.cap} ${company.city} (${company.province})`;
  addressLink.textContent = fullAddress;
  addressLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  const phoneLink = document.getElementById("footerPhone");
  phoneLink.href = `tel:${company.phone}`;
  phoneLink.textContent = `Tel: ${company.phone}`;

  const emailLink = document.getElementById("footerEmail");
  emailLink.href = `mailto:${company.email}`;
  emailLink.textContent = `Email: ${company.email}`;

  const whatsappLink = document.getElementById("footerWhatsApp");
  const phoneNumber = company.phone.replace(/\+/g, "").replace(/\s/g, "");
  whatsappLink.href = `https://wa.me/${phoneNumber}`;
  whatsappLink.textContent = `WhatsApp: ${company.phone}`;

  document.getElementById("footerPiva").textContent = `P.IVA: ${company.piva}`;
}