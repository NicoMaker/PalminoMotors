// ══════════════════════════════════════════════
//  HOME.JS — Schermata home: logo hero e griglia aree
// ══════════════════════════════════════════════

function handleHeaderLogo(logoPath) {
  if (!logoPath) return;
  const wrap = document.getElementById("headerLogoWrap");
  if (!wrap) return;

  const img = document.createElement("img");
  img.src = logoPath;
  img.className = "header-logo-img";
  img.alt = "Logo";
  img.style.cursor = "pointer";
  img.onclick = goHome;
  img.onerror = () => img.remove();
  wrap.innerHTML = "";
  wrap.className = "header-logo-img-wrap";
  wrap.appendChild(img);
}

function buildHomeScreen(data) {
  // Hero logo grande
  const hero = document.getElementById("homeLogoHero");
  if (hero && data.company?.logo) {
    const img = document.createElement("img");
    img.src = data.company.logo;
    img.className = "home-logo-img-big";
    img.alt = data.company.fullName || "Logo";
    img.style.cursor = "pointer";
    img.onclick = goHome;
    img.onerror = () => {
      hero.innerHTML = '<div class="home-logo-circle-big">PM</div>';
    };
    hero.innerHTML = "";
    hero.appendChild(img);
  }

  // Nome azienda
  const nameEl = document.getElementById("homeCompanyName");
  if (nameEl && data.company?.fullName)
    nameEl.textContent = data.company.fullName;

  const grid = document.getElementById("areaGrid");
  if (!grid) return;

  // Carte categorie
  const catCards = data.categories.map((cat, i) => {
    const rgb = hexToRgb(cat.color);
    const cl = cat.colorLight || cat.color;
    return `
      <button class="area-card" onclick="enterArea(${i})"
        style="--ac:${cat.color}; --acl:${cl}; --acr:${rgb};">
        <div class="area-card-shine"></div>
        <div class="area-card-icon" style="background:rgba(${rgb},0.15); border:2.5px solid ${cat.color};">
          ${cat.icon || cat.links[0]?.icon || "📂"}
        </div>
        <span class="area-card-label">${cat.name}</span>
        <span class="area-card-badge">${cat.links.length} link</span>
      </button>`;
  });

  // Carta speciale Brand Ufficiali
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
