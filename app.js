document.addEventListener("DOMContentLoaded", () => {
  loadData();
  document.getElementById("year").textContent = new Date().getFullYear();
});

async function loadData() {
  try {
    const response = await fetch("data.json");
    const data = await response.json();

    renderCategories(data.categories);
    renderBrands(data.brands);
    populateFooter(data.company);
    handleLogos(data.company.logo);
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
      (cat) => `
        <section class="category-section">
            <h2 class="category-title">${cat.name}</h2>
            <div class="links-grid">
                ${cat.links
                  .map(
                    (link) => `
                    <a href="${link.url}" target="_blank" class="link-card">
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
      (brand) => `
        <a href="${brand.url}" target="_blank" class="brand-item">${brand.name}</a>
    `,
    )
    .join("");
}

function populateFooter(company) {
  document.getElementById("companyName").textContent = company.fullName;
  document.getElementById("fullAddress").textContent =
    `${company.address}, ${company.cap} ${company.city} (${company.province})`;
  document.getElementById("footerPhone").textContent = `Tel: ${company.phone}`;
  document.getElementById("footerEmail").textContent =
    `Email: ${company.email}`;
  document.getElementById("footerPiva").textContent = `P.IVA: ${company.piva}`;
}
