document.addEventListener("DOMContentLoaded", () => {
  loadData();
  document.getElementById("year").textContent = new Date().getFullYear();
});

/**
 * Formatta un numero di telefono per la visualizzazione
 * Rimuove caratteri non numerici (eccetto +) e aggiunge spazi per leggibilità
 */
function formatPhoneNumber(phone) {
  if (!phone) return phone;
  
  // Rimuovi tutti gli spazi esistenti
  let cleaned = phone.replace(/\s+/g, '');
  
  // Se inizia con +39 (Italia)
  if (cleaned.startsWith('+39')) {
    // +39 XXX XXX XXXX
    return cleaned.replace(/(\+39)(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
  }
  // Se inizia con +
  else if (cleaned.startsWith('+')) {
    // Formato generico internazionale: +XX XXX XXX XXXX
    return cleaned.replace(/(\+\d{1,3})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
  }
  // Se è un numero italiano senza prefisso (10 cifre)
  else if (cleaned.length === 10) {
    // XXX XXX XXXX
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  }
  // Formato generico per altri numeri
  else if (cleaned.length > 6) {
    // Dividi in gruppi di 3 cifre
    return cleaned.replace(/(\d{3})(?=\d)/g, '$1 ');
  }
  
  return phone;
}

/**
 * Gestisce l'apertura di WhatsApp con priorità all'app (mobile o desktop)
 * Fallback a WhatsApp Web se l'app non è installata
 */
function openWhatsApp(event, element) {
  event.preventDefault();
  
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isDesktop = !isMobile;
  
  if (isMobile) {
    // Su mobile: prova ad aprire l'app con protocollo whatsapp://
    window.location.href = 'whatsapp://';
    
    // Fallback a WhatsApp Web dopo 1.5 secondi se l'app non si apre
    setTimeout(() => {
      if (document.visibilityState === 'visible') {
        window.open('https://web.whatsapp.com/', '_blank');
      }
    }, 1500);
  } else {
    // Su desktop: prova ad aprire l'app desktop con protocollo whatsapp://
    const appOpened = window.open('whatsapp://', '_blank');
    
    // Fallback a WhatsApp Web dopo 1 secondo se l'app non si apre
    setTimeout(() => {
      // Se la finestra dell'app non si è aperta o è stata chiusa immediatamente
      if (!appOpened || appOpened.closed || document.visibilityState === 'visible') {
        window.open('https://web.whatsapp.com/', '_blank');
      }
    }, 1000);
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

  // Event listener per il cambio di selezione
  filterSelect.addEventListener("change", (e) => {
    const value = e.target.value;
    if (value === "all") {
      filterCategories("all");
      saveFilterToStorage("all");
    } else {
      filterCategories([value]);
      saveFilterToStorage([value]);
    }
    
    // Scroll automatico in alto quando cambi categoria
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
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
                     ${link.title.toLowerCase().includes('whatsapp') ? 'onclick="openWhatsApp(event, this); return false;"' : ''}>
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