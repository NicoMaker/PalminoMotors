// ══════════════════════════════════════════════
//  DATA — Caricamento dati e risoluzione referenti
// ══════════════════════════════════════════════

let _data = null;

function resolveSharedReferenti(data) {
  const shared = data.sharedReferenti || {};
  if (!data.brands) return;

  data.brands.forEach((brand) => {
    brand.referenti = [];
  });

  Object.values(shared).forEach((group) => {
    const brandNames = group.brands || [];
    const referenti = group.referenti || [];
    brandNames.forEach((brandName) => {
      const brand = data.brands.find(
        (b) => b.name.toLowerCase() === brandName.toLowerCase(),
      );
      if (brand) {
        brand.referenti.push(...JSON.parse(JSON.stringify(referenti)));
      }
    });
  });
}

async function loadData() {
  try {
    const res = await fetch("data.json");
    _data = await res.json();
    resolveSharedReferenti(_data);
    populateFooter(_data.company);
    handleHeaderLogo(_data.company.logo);
    renderBrands(_data.brands);
    buildHomeScreen(_data);
  } catch (e) {
    console.error("Errore:", e);
  }
}
