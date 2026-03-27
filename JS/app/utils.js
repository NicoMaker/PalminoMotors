// ══════════════════════════════════════════════
//  UTILS — Funzioni di utilità (logica in js/common.js)
// ══════════════════════════════════════════════

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function highlightText(text, term) {
  if (!term) return text;
  return text.replace(
    new RegExp(`(${escapeRegExp(term)})`, "gi"),
    '<mark class="highlight">$1</mark>',
  );
}
