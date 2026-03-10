// ══════════════════════════════════════════════
//  NAVIGATION — Navigazione tra home e dettaglio
// ══════════════════════════════════════════════

function enterArea(index) {
  document.getElementById("screenHome").style.display = "none";
  document.getElementById("screenDetail").style.display = "";
  document.getElementById("backBtn").style.display = "";
  document.getElementById("brandSection").style.display = "none";
  window.scrollTo({ top: 0 });

  const tag = document.getElementById("headerAreaTag");
  const dot = document.getElementById("headerAreaDot");
  const namEl = document.getElementById("headerAreaName");
  const header = document.getElementById("hubHeader");
  tag.style.display = "";

  const stickyBar = document.getElementById("headerSectionTitleRow");
  const stickyTitle = document.getElementById("headerSectionTitleText");
  stickyBar.style.display = "";
  document.body.classList.add("header-expanded");

  if (index === "brands") {
    dot.style.background = "linear-gradient(135deg,#dc2626,#f97316)";
    namEl.textContent = "Brand Ufficiali";
    header.style.setProperty("--hc", "#dc2626");
    header.style.setProperty("--hr", hexToRgb("#dc2626"));
    stickyTitle.textContent = "Brand Ufficiali";
    stickyBar.style.setProperty("--hc", "#dc2626");
    renderBrandPage();
  } else {
    const cat = _data.categories[index];
    const rgb = hexToRgb(cat.color);
    dot.style.background = `linear-gradient(135deg,${cat.color},${cat.colorLight || cat.color})`;
    namEl.textContent = cat.name;
    header.style.setProperty("--hc", cat.color);
    header.style.setProperty("--hr", rgb);
    stickyTitle.textContent = cat.name;
    stickyBar.style.setProperty("--hc", cat.color);
    renderCategoryDetail(cat, rgb, cat.color, cat.colorLight || cat.color);
  }
}

function goHome() {
  document.getElementById("screenDetail").style.display = "none";
  document.getElementById("screenHome").style.display = "";

  document.body.classList.remove("header-expanded");
  const sb = document.getElementById("headerSectionTitleRow");
  if (sb) sb.style.display = "none";

  document.getElementById("backBtn").style.display = "none";
  document.getElementById("headerAreaTag").style.display = "none";

  const header = document.getElementById("hubHeader");
  header.style.removeProperty("--hc");
  header.style.removeProperty("--hr");

  const s = document.getElementById("detailSearch");
  if (s) s.value = "";
  const clearBtn = document.getElementById("detailSearchClear");
  if (clearBtn) clearBtn.classList.remove("visible");

  window.scrollTo({ top: 0, behavior: "instant" });
}
