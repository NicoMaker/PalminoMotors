// ══════════════════════════════════════════════
//  UTILS — Funzioni di supporto generali
// ══════════════════════════════════════════════

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r
    ? `${parseInt(r[1], 16)}, ${parseInt(r[2], 16)}, ${parseInt(r[3], 16)}`
    : "255,255,255";
}

function formatPhoneNumber(phone) {
  if (!phone) return phone;
  let c = phone.replace(/\s+/g, "");
  if (c.startsWith("+39"))
    return c.replace(/(\+39)(\d{3})(\d{3})(\d{4})/, "$1 $2 $3 $4");
  return phone;
}

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function highlightText(text, term) {
  if (!term) return text;
  return text.replace(
    new RegExp(`(${escapeRegExp(term)})`, "gi"),
    '<mark class="highlight">$1</mark>',
  );
}
