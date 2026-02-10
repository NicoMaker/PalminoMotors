document.addEventListener("DOMContentLoaded", () => {
  loadData();
  document.getElementById("year").textContent = new Date().getFullYear();
  initAnimations();
  initRippleEffect(); // Spostato qui per evitare doppio listener
});

async function loadData() {
  try {
    const response = await fetch("data.json");
    const data = await response.json();

    renderCategories(data.categories);
    renderBrands(data.brands);
    populateFooter(data.company);
    handleLogos(data.company.logo);

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

  // Header logo
  const headerImg = document.createElement("img");
  headerImg.src = logoPath;
  headerImg.className = "main-logo";
  headerImg.alt = "Palmino Motors Logo";
  logoArea.prepend(headerImg);

  // Footer logo
  const footerCol = document.getElementById("footerCompanyCol");
  const footerImg = document.createElement("img");
  footerImg.src = logoPath;
  footerImg.className = "footer-logo";
  footerImg.alt = "Logo Footer";
  footerCol.prepend(footerImg);
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
                (linkIndex) => `
                  <a 
                    href="${link.url}" 
                    target="_blank"
                    rel="noopener noreferrer"
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

  if (!brands || brands.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-dim);">Nessun marchio disponibile.</p>';
    return;
  }

  container.innerHTML = brands
    .map(
      (brand, index) => `
        <div class="brand-item" data-brand="${index}" style="opacity: 0; transform: translateY(20px);">
          <span class="brand-name">${brand.name}</span>
          <div class="brand-socials">
            ${brand.url ? `<a href="${brand.url}" target="_blank" rel="noopener noreferrer" class="brand-pill brand-site" aria-label="Sito ufficiale ${brand.name}">🌐</a>` : ""}
            ${brand.facebook ? `<a href="${brand.facebook}" target="_blank" rel="noopener noreferrer" class="brand-pill brand-facebook" aria-label="Facebook ${brand.name}">f</a>` : ""}
            ${brand.instagram ? `<a href="${brand.instagram}" target="_blank" rel="noopener noreferrer" class="brand-pill brand-instagram" aria-label="Instagram ${brand.name}">⌾</a>` : ""}
          </div>
        </div>
      `,
    )
    .join("");
}

function populateFooter(company) {
  // Company name
  document.getElementById("companyName").textContent = company.fullName.toUpperCase();

  // Address con link a Google Maps
  const addressLink = document.getElementById("fullAddress");
  const fullAddress = `${company.address}, ${company.cap} ${company.city} (${company.province})`;
  addressLink.textContent = fullAddress;
  addressLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  addressLink.target = "_blank";
  addressLink.rel = "noopener noreferrer";

  // Phone
  const phoneLink = document.getElementById("footerPhone");
  phoneLink.href = `tel:${company.phone}`;
  phoneLink.textContent = company.phone;

  // Email
  const emailLink = document.getElementById("footerEmail");
  emailLink.href = `mailto:${company.email}`;
  emailLink.textContent = company.email;

  // WhatsApp
  const whatsappLink = document.getElementById("footerWhatsApp");
  const phoneNumber = company.phone.replace(/[\s\+]/g, "");
  whatsappLink.href = `https://wa.me/${phoneNumber}`;
  whatsappLink.textContent = company.phone;
  whatsappLink.target = "_blank";
  whatsappLink.rel = "noopener noreferrer";

  // P.IVA
  document.getElementById("footerPiva").textContent = `P.IVA: ${company.piva}`;
}

function initAnimations() {
  // Parallax effect per gli orbs
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrolled = window.pageYOffset;
        const orbs = document.querySelectorAll(".glow-orb");

        orbs.forEach((orb, index) => {
          const speed = 0.5 + index * 0.2;
          orb.style.transform = `translateY(${scrolled * speed}px)`;
        });

        ticking = false;
      });
      ticking = true;
    }
  });

  // Intersection Observer per animazioni scroll
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
    .forEach((el) => observer.observe(el));
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

// Effetto ripple sulle card - UNIFICATO
function initRippleEffect() {
  // Aggiungi lo stile per l'animazione
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

  // Delega gli eventi alle card future
  document.addEventListener("mouseenter", (e) => {
    if (e.target.closest(".link-card")) {
      const card = e.target.closest(".link-card");
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
      card.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }
  }, true);
}