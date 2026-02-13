document.addEventListener("DOMContentLoaded", () => {
  loadData();
  document.getElementById("year").textContent = new Date().getFullYear();
  initAnimations();
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

    // Ripristina le selezioni salvate
    restoreSavedFilters(data.categories.length);

    setTimeout(() => {
      animateCards();
    }, 100);
  } catch (error) {
    console.error("Errore caricamento dati:", error);
  }
}

function handleLogos(logoPath) {
  if (!logoPath) return;

  const logoArea = document.querySelector(".logo-area");
  const oldCircle = document.querySelector(".logo-circle");
  if (oldCircle) oldCircle.remove();

  const headerImg = document.createElement("img");
  headerImg.src = logoPath;
  headerImg.className = "main-logo";
  headerImg.alt = "Palmino Motors Logo";
  logoArea.prepend(headerImg);

  const footerCol = document.getElementById("footerCompanyCol");
  const footerImg = document.createElement("img");
  footerImg.src = logoPath;
  footerImg.className = "footer-logo";
  footerImg.alt = "Logo Footer";
  footerCol.prepend(footerImg);
}

function renderCategoryFilters(categories) {
  const container = document.getElementById("categoryFilters");
  
  // Pulsante "Tutte"
  const allButton = document.createElement("button");
  allButton.className = "filter-btn active";
  allButton.innerHTML = '<span>Tutte le Categorie</span>';
  allButton.setAttribute("data-filter", "all");
  container.appendChild(allButton);

  // Pulsanti per ogni categoria
  categories.forEach((cat, index) => {
    const button = document.createElement("button");
    button.className = "filter-btn";
    button.innerHTML = `<span>${cat.name}</span>`;
    button.setAttribute("data-filter", index);
    container.appendChild(button);
  });

  // Event listener per i pulsanti
  container.addEventListener("click", (e) => {
    const button = e.target.closest(".filter-btn");
    if (!button) return;

    const filter = button.getAttribute("data-filter");
    const allBtn = container.querySelector('[data-filter="all"]');
    const categoryButtons = container.querySelectorAll('.filter-btn:not([data-filter="all"])');

    if (filter === "all") {
      // Cliccato "Tutte" - attiva tutte e disattiva le singole
      allBtn.classList.add("active");
      categoryButtons.forEach(btn => btn.classList.remove("active"));
      filterCategories("all");
      saveFiltersToStorage("all");
    } else {
      // Cliccato una categoria specifica
      button.classList.toggle("active");
      
      // Controlla quante categorie sono selezionate
      const activeCategories = Array.from(categoryButtons).filter(btn => 
        btn.classList.contains("active")
      );

      if (activeCategories.length === 0) {
        // Nessuna categoria selezionata - attiva "Tutte"
        allBtn.classList.add("active");
        filterCategories("all");
        saveFiltersToStorage("all");
      } else if (activeCategories.length === categoryButtons.length) {
        // Tutte le categorie selezionate - attiva "Tutte" e disattiva le singole
        allBtn.classList.add("active");
        categoryButtons.forEach(btn => btn.classList.remove("active"));
        filterCategories("all");
        saveFiltersToStorage("all");
      } else {
        // Alcune categorie selezionate - disattiva "Tutte"
        allBtn.classList.remove("active");
        const selectedFilters = activeCategories.map(btn => btn.getAttribute("data-filter"));
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
    console.error("Errore salvataggio filtri:", error);
  }
}

function restoreSavedFilters(totalCategories) {
  try {
    const saved = localStorage.getItem("palminoMotorsFilters");
    
    // Se non ci sono filtri salvati, avvia con "Tutte"
    if (!saved) {
      filterCategories("all");
      return;
    }

    const filters = JSON.parse(saved);
    const container = document.getElementById("categoryFilters");
    const allBtn = container.querySelector('[data-filter="all"]');
    const categoryButtons = container.querySelectorAll('.filter-btn:not([data-filter="all"])');

    // Se è salvato "all", tutto ok
    if (filters === "all") {
      filterCategories("all");
      return;
    }

    // Se è un array di filtri
    if (Array.isArray(filters)) {
      // Verifica che tutti gli indici salvati siano validi
      const validFilters = filters.filter(f => parseInt(f) < totalCategories);
      
      // Se nessun filtro è valido, torna a "Tutte"
      if (validFilters.length === 0) {
        filterCategories("all");
        saveFiltersToStorage("all");
        return;
      }

      // Applica i filtri salvati validi
      allBtn.classList.remove("active");
      categoryButtons.forEach(btn => {
        const btnFilter = btn.getAttribute("data-filter");
        if (validFilters.includes(btnFilter)) {
          btn.classList.add("active");
        }
      });
      
      filterCategories(validFilters);
    } else {
      // Formato non riconosciuto, torna a "Tutte"
      filterCategories("all");
      saveFiltersToStorage("all");
    }
  } catch (error) {
    // In caso di errore, avvia con "Tutte"
    console.error("Errore ripristino filtri:", error);
    filterCategories("all");
    saveFiltersToStorage("all");
  }
}

function filterCategories(filter) {
  const sections = document.querySelectorAll(".category-section");
  
  // Se filter è "all" o un array, gestiamo di conseguenza
  const filters = filter === "all" ? "all" : (Array.isArray(filter) ? filter : [filter]);
  
  sections.forEach((section) => {
    const categoryIndex = section.getAttribute("data-category");
    
    if (filters === "all" || filters.includes(categoryIndex)) {
      section.classList.remove("hidden");
      // Riapplica l'animazione
      section.style.opacity = "0";
      section.style.transform = "translateY(20px)";
      setTimeout(() => {
        section.style.transition = "all 0.6s ease";
        section.style.opacity = "1";
        section.style.transform = "translateY(0)";
      }, 50);
    } else {
      section.classList.add("hidden");
    }
  });

  // Rianima le card delle categorie visibili
  setTimeout(() => {
    const visibleCards = document.querySelectorAll(".category-section:not(.hidden) .link-card");
    visibleCards.forEach((card, index) => {
      card.style.opacity = "0";
      card.style.transform = "translateX(-20px)";
      setTimeout(() => {
        card.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
        card.style.opacity = "1";
        card.style.transform = "translateX(0)";
      }, index * 80);
    });
  }, 100);
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
                (link, linkIndex) => `
                  <a 
                    href="${link.url}" 
                    target="_blank" 
                    class="link-card" 
                    data-card="${catIndex}-${linkIndex}"
                    style="opacity: 0; transform: translateX(-20px);"
                  >
                    <span class="link-icon">${link.icon}</span>
                    <div class="link-info">
                      <h3>${link.title}</h3>
                      <p>${link.description}</p>
                    </div>
                  </a>
                `,
              )
              .join("")}
          </div>
        </section>
      `,
    )
    .join("");
}

function renderBrands(brands) {
  const container = document.getElementById("brandContainer");

  // Controllo se ci sono marchi da visualizzare
  if (!brands || brands.length === 0) {
    container.innerHTML = "<p>Nessun marchio disponibile.</p>";
    return;
  }

  container.innerHTML = brands
    .map(
      (brand, index) => `
        <div class="brand-item" data-brand="${index}" style="opacity: 0; transform: translateY(20px);">
          <span class="brand-name">${brand.name}</span>
          <div class="brand-socials">
            ${brand.url ? `<a href="${brand.url}" target="_blank" class="brand-pill brand-site" aria-label="Sito ufficiale ${brand.name}">🌐</a>` : ""}
            ${brand.facebook ? `<a href="${brand.facebook}" target="_blank" class="brand-pill brand-facebook" aria-label="Facebook ${brand.name}">f</a>` : ""}
            ${brand.instagram ? `<a href="${brand.instagram}" target="_blank" class="brand-pill brand-instagram" aria-label="Instagram ${brand.name}">⌾</a>` : ""}
          </div>
        </div>
      `,
    )
    .join("");
}

function populateFooter(company) {
  document.getElementById("companyName").textContent =
    company.fullName.toUpperCase();

  const addressLink = document.getElementById("fullAddress");
  const fullAddress = `${company.address}, ${company.cap} ${company.city} (${company.province})`;
  addressLink.textContent = fullAddress;
  addressLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    fullAddress,
  )}`;

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

function initAnimations() {
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset;
    const orbs = document.querySelectorAll(".glow-orb");

    orbs.forEach((orb, index) => {
      const speed = 0.5 + index * 0.2;
      orb.style.transform = `translateY(${scrolled * speed}px)`;
    });
  });

  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0) translateX(0)";
      }
    });
  }, observerOptions);

  document
    .querySelectorAll(".link-card, .category-section, .brand-item")
    .forEach((el) => {
      observer.observe(el);
    });
}

function animateCards() {
  const cards = document.querySelectorAll(".link-card");
  cards.forEach((card, index) => {
    setTimeout(() => {
      card.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
      card.style.opacity = "1";
      card.style.transform = "translateX(0)";
    }, index * 100);
  });

  const brands = document.querySelectorAll(".brand-item");
  brands.forEach((brand, index) => {
    setTimeout(
      () => {
        brand.style.transition = "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)";
        brand.style.opacity = "1";
        brand.style.transform = "translateY(0)";
      },
      cards.length * 100 + index * 80,
    );
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".link-card");
  cards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      const ripple = document.createElement("div");
      ripple.style.cssText = `
        position: absolute;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgba(0, 245, 255, 0.5);
        pointer-events: none;
        animation: ripple 0.6s ease-out;
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
      `;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  const style = document.createElement("style");
  style.textContent = `
    @keyframes ripple {
      to {
        width: 100px;
        height: 100px;
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
});