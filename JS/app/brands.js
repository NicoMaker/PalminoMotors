// ══════════════════════════════════════════════
//  BRANDS — Pagina brand e sezione referenti
// ══════════════════════════════════════════════

function buildReferenteHTML(brand) {
  let referenti = brand.referenti || (brand.referente ? [brand.referente] : []);
  const referentiConDati = referenti.filter(
    (r) => r && (r.phone || r.whatsapp || r.email),
  );

  const bc = brand.color || "#dc2626";
  const bcl = brand.colorLight || bc;
  const brgb = hexToRgb(bc);

  const shimmerLine = `<div class="brand-ref-line" style="width:100%;height:3px;border-radius:2px;background:linear-gradient(90deg,transparent,rgba(${brgb},0.4) 15%,${bc} 35%,${bcl} 50%,${bc} 65%,rgba(${brgb},0.4) 85%,transparent);margin-top:12px;"></div>`;

  if (!referentiConDati.length) {
    return `<div class="brand-ref-empty" style="--bc:${bc};--bcl:${bcl};">
      <span class="brand-ref-empty-text">Nessun referente</span>
    </div>`;
  }

  const refBlocks = referentiConDati
    .map((r, idx) => {
      const items = [];
      if (r.phone)
        items.push(
          `<a href="tel:${r.phone}" class="brand-pill" title="Chiama: ${formatPhoneNumber(r.phone)}">${svgPhone()}</a>`,
        );
      if (r.phone)
        items.push(
          `<a href="sms:${r.phone}" class="brand-pill" title="SMS: ${formatPhoneNumber(r.phone)}">${svgSms()}</a>`,
        );
      if (r.whatsapp) {
        const n = r.whatsapp.replace(/\+/g, "").replace(/\s/g, "");
        items.push(
          `<a href="https://wa.me/${n}" target="_blank" rel="noopener noreferrer" class="brand-pill" title="WhatsApp: ${formatPhoneNumber(r.whatsapp)}" onclick="openWhatsApp(event)">${svgWhatsApp()}</a>`,
        );
      }
      if (r.email)
        items.push(
          `<a href="mailto:${r.email}" class="brand-pill" title="Email: ${r.email}">${svgEmail()}</a>`,
        );
      if (!items.length) return "";

      let nameLabel = "";
      if (r.name) {
        const desc = r.description || "";
        nameLabel =
          '<div class="brand-ref-name-label">' +
          r.name +
          (desc ? '<span class="brand-ref-name-desc">' + desc + "</span>" : "") +
          "</div>";
      } else if (referentiConDati.length > 1) {
        nameLabel = `<div class="brand-ref-name-label brand-ref-name-num">#${idx + 1}</div>`;
      }

      return `
    <div class="brand-ref-block">
      ${nameLabel}
      <div class="brand-ref-contacts">${items.join("")}</div>
    </div>`;
    })
    .join("");

  const sectionLabel = referentiConDati.length > 1 ? "REFERENTI" : "REFERENTE";
  const sectionHeader = `
    <div class="brand-ref-separator" style="margin-top:28px;">
      <span class="brand-ref-sep-label">${sectionLabel}</span>
    </div>`;

  return `<div class="brand-ref-wrap">${sectionHeader}${shimmerLine}<div class="brand-ref-blocks-wrap">${refBlocks}</div></div>`;
}

function buildBrandItemHTML(brand) {
  const bc = brand.color || "#dc2626";
  const bcl = brand.colorLight || "#f97316";
  const brgb = hexToRgb(bc);
  const gradBg = `linear-gradient(90deg,transparent,rgba(${brgb},0.3) 15%,${bc} 35%,${bcl} 50%,${bc} 65%,rgba(${brgb},0.3) 85%,transparent)`;
  return `
  <div class="brand-item" style="--bc:${bc};--bcl:${bcl};--bcr:${brgb};">
    <div class="brand-item-glow"></div>
    <span class="brand-name" style="background:linear-gradient(135deg,#fafafa,${bc});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${brand.name}</span>
    <div class="brand-gradient" style="background:${gradBg}"></div>
    <div class="brand-socials">
      ${brand.url ? `<a href="${brand.url}" target="_blank" rel="noopener noreferrer" class="brand-pill" title="Sito Web">${svgGlobe()}</a>` : ""}
      ${brand.facebook ? `<a href="${brand.facebook}" target="_blank" rel="noopener noreferrer" class="brand-pill" title="Facebook">${svgFacebook()}</a>` : ""}
      ${brand.instagram ? `<a href="${brand.instagram}" target="_blank" rel="noopener noreferrer" class="brand-pill" title="Instagram">${svgInstagram()}</a>` : ""}
    </div>
    ${buildReferenteHTML(brand, bc)}
  </div>`;
}

function renderBrandPage() {
  const main = document.getElementById("detailMain");
  const brands = _data.brands;

  main.innerHTML = `
    <br>
    <div class="brand-links brand-links-2col">
      ${brands.map(buildBrandItemHTML).join("")}
    </div>`;

  main.querySelectorAll(".brand-item").forEach((item, idx) => {
    const brand = brands[idx];
    const bc = brand.color || "#dc2626";
    const brgb = hexToRgb(bc);
    item.addEventListener("mouseenter", () => {
      item.style.borderColor = bc;
      item.style.boxShadow = `0 8px 32px rgba(${brgb},0.2)`;
      item.style.transform = "translateY(-4px)";
    });
    item.addEventListener("mouseleave", () => {
      item.style.borderColor = `rgba(${brgb},0.5)`;
      item.style.boxShadow = "";
      item.style.transform = "";
    });
  });
}

function renderBrands(brands) {
  const container = document.getElementById("brandContainer");
  const badge = document.getElementById("brandCount");
  if (!container) return;
  if (badge) badge.textContent = brands?.length || "";
  if (!brands?.length) return;

  container.innerHTML = brands.map(buildBrandItemHTML).join("");

  container.querySelectorAll(".brand-item").forEach((item, idx) => {
    const brand = brands[idx];
    const bc = brand.color || "#dc2626";
    const brgb = hexToRgb(bc);
    item.style.borderColor = `rgba(${brgb},0.5)`;
    item.addEventListener("mouseenter", () => {
      item.style.borderColor = bc;
      item.style.boxShadow = `0 8px 32px rgba(${brgb},0.2)`;
      item.style.transform = "translateY(-4px)";
    });
    item.addEventListener("mouseleave", () => {
      item.style.borderColor = `rgba(${brgb},0.5)`;
      item.style.boxShadow = "";
      item.style.transform = "";
    });
  });
}
