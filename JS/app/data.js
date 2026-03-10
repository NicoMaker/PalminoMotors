// ══════════════════════════════════════════════
//  DATA — Risoluzione referenti condivisi
//  Il caricamento di data.json è gestito da js/common.js
// ══════════════════════════════════════════════

// Alias locale per compatibilità con navigation.js e brands.js
Object.defineProperty(window, "_data", {
  get: () => PM.data,
  configurable: true,
});

function resolveSharedReferenti(data) {
  const shared = data.sharedReferenti || {};
  if (!data.brands) return;

  data.brands.forEach((brand) => { brand.referenti = []; });

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

// Chiamato da common.js dopo il fetch di data.json
PM.onDataLoaded = function (data) {
  resolveSharedReferenti(data);
  handleHeaderLogo(data.company.logo);
  renderBrands(data.brands);
  buildHomeScreen(data);
};