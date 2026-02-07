document.addEventListener("DOMContentLoaded", () => {
  loadData();
  document.getElementById("year").textContent = new Date().getFullYear();
  initAnimations();
});

async function loadData() {
  try {
    const response = await fetch("data.json");
    const data = await response.json();

    renderCategories(data.categories);
    renderBrands(data.brands);
    populateFooter(data.company);
    handleLogos(data.company.logo);
    
    // Trigger staggered animations after content loads
    setTimeout(() => {
      animateCards();
    }, 100);
  } catch (error) {
    console.error("Errore caricamento dati:", error);
  }
}

function handleLogos(logoPath) {
  if (!logoPath) return;

  // Sostituzione logo nell'Header
  const logoArea = document.querySelector(".logo-area");
  const oldCircle = document.querySelector(".logo-circle");
  if (oldCircle) oldCircle.remove();

  const headerImg = document.createElement("img");
  headerImg.src = logoPath;
  headerImg.className = "main-logo";
  headerImg.alt = "Palmino Motors Logo";
  logoArea.prepend(headerImg);

  // Inserimento logo nel Footer
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
                    (link, linkIndex) => `
                    <a href="${link.url}" 
                       target="_blank" 
                       class="link-card" 
                       data-card="${catIndex}-${linkIndex}"
                       style="opacity: 0; transform: translateX(-20px);">
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
  container.innerHTML = brands
    .map(
      (brand, index) => `
        <a href="${brand.url}" 
           target="_blank" 
           class="brand-item"
           data-brand="${index}"
           style="opacity: 0; transform: translateY(20px);">
            <span>${brand.name}</span>
        </a>
    `,
    )
    .join("");
}

function populateFooter(company) {
  document.getElementById("companyName").textContent = company.fullName.toUpperCase();
  document.getElementById("fullAddress").textContent =
    `${company.address}, ${company.cap} ${company.city} (${company.province})`;
  
  // Set clickable phone link
  const phoneLink = document.getElementById("footerPhone");
  phoneLink.href = `tel:${company.phone}`;
  phoneLink.textContent = `Tel: ${company.phone}`;
  
  // Set clickable email link
  const emailLink = document.getElementById("footerEmail");
  emailLink.href = `mailto:${company.email}`;
  emailLink.textContent = `Email: ${company.email}`;
  
  document.getElementById("footerPiva").textContent = `P.IVA: ${company.piva}`;
}

// Animation functions
function initAnimations() {
  // Parallax effect on scroll
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const orbs = document.querySelectorAll('.glow-orb');
    
    orbs.forEach((orb, index) => {
      const speed = 0.5 + (index * 0.2);
      orb.style.transform = `translateY(${scrolled * speed}px)`;
    });
  });

  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0) translateX(0)';
      }
    });
  }, observerOptions);

  // Observe all cards and sections
  document.querySelectorAll('.link-card, .category-section, .brand-item').forEach(el => {
    observer.observe(el);
  });
}

function animateCards() {
  // Staggered animation for link cards
  const cards = document.querySelectorAll('.link-card');
  cards.forEach((card, index) => {
    setTimeout(() => {
      card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      card.style.opacity = '1';
      card.style.transform = 'translateX(0)';
    }, index * 100);
  });

  // Staggered animation for brand items
  const brands = document.querySelectorAll('.brand-item');
  brands.forEach((brand, index) => {
    setTimeout(() => {
      brand.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      brand.style.opacity = '1';
      brand.style.transform = 'translateY(0)';
    }, (cards.length * 100) + (index * 80));
  });
}

// Add cursor glow effect
document.addEventListener('mousemove', (e) => {
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  glow.style.cssText = `
    position: fixed;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0, 245, 255, 0.1) 0%, transparent 70%);
    pointer-events: none;
    z-index: 9999;
    left: ${e.clientX - 100}px;
    top: ${e.clientY - 100}px;
    transition: opacity 0.3s ease;
    opacity: 0;
  `;
  
  document.body.appendChild(glow);
  
  setTimeout(() => {
    glow.style.opacity = '1';
  }, 10);
  
  setTimeout(() => {
    glow.style.opacity = '0';
    setTimeout(() => glow.remove(), 300);
  }, 500);
});

// Add interactive card hover sound effect (visual feedback)
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.link-card');
  
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      // Create ripple effect
      const ripple = document.createElement('div');
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
});

// Add CSS for ripple animation
const style = document.createElement('style');
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