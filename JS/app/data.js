// ══════════════════════════════════════════════
//  DATA — Risoluzione referenti condivisi
//  Il caricamento di dati.json è gestito da js/common.js
// ══════════════════════════════════════════════

// Alias globale per compatibilità con navigation.js e brands.js
Object.defineProperty(window, "_data", {
  get: () => window.appData,
  configurable: true,
});

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

window.onDataLoaded = function (data) {
  resolveSharedReferenti(data);
  handleHeaderLogo(data.company.logo);
  renderBrands(data.brands);
  buildHomeScreen(data);
};