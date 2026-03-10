// ══════════════════════════════════════════════
//  UTILS — Alias locali (logica in js/common.js)
// ══════════════════════════════════════════════

const hexToRgb = (hex) => PM.hexToRgb(hex);
const formatPhoneNumber = (phone) => PM.formatPhoneNumber(phone);
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function highlightText(text, term) {
  if (!term) return text;
  return text.replace(
    new RegExp(`(${escapeRegExp(term)})`, "gi"),
    '<mark class="highlight">$1</mark>',
  );
}