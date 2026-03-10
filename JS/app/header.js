// ══════════════════════════════════════════════
//  HEADER — Gestione logo nell'header
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
