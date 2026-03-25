/* ===================================================
   PALMINO MOTORS · Database Backup Console
   database.js — v3.0
   =================================================== */

"use strict";

// ── Year ──────────────────────────────────────────
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── State ─────────────────────────────────────────
let DB_CONFIG = [];

// ── SVG icons by type ──────────────────────────────
const ICONS = {
  blue: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
    <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
  </svg>`,
  green: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M3 9h18M9 21V9"/>
  </svg>`,
};

// ── Bootstrap ─────────────────────────────────────
async function initApp() {
  const container = document.getElementById("db-container");
  if (!container) return;

  try {
    const response = await fetch("../JSON/Database.json");
    if (!response.ok) throw new Error(`HTTP ${response.status} — impossibile caricare Database.json`);

    const data = await response.json();
    DB_CONFIG = data.databases;

    // Small visual delay to let the skeleton breathe
    await delay(300);

    container.innerHTML = DB_CONFIG.map((db) => renderCard(db)).join("");
    container.removeAttribute("aria-busy");
  } catch (err) {
    container.innerHTML = `
      <div class="db-card" role="alert" aria-live="assertive">
        <div class="db-main">
          <div class="db-icon db-icon-blue" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div class="db-info">
            <p class="db-name">Errore configurazione</p>
            <p class="status error" style="margin-top:4px">${sanitize(err.message)}</p>
          </div>
        </div>
      </div>`;
    console.error("[DB Console]", err);
  }
}

// ── Render a single DB card ────────────────────────
function renderCard(db) {
  const tagClass = db.type === "green" ? "db-tag db-tag-green" : "db-tag";
  const iconClass = `db-icon db-icon-${db.type}`;
  const btnClass = db.type === "green" ? "btn btn-success" : "btn btn-primary";
  const icon = ICONS[db.type] ?? ICONS.blue;

  return `
    <article class="db-card" role="listitem">
      <div class="db-main">
        <div class="${iconClass}">${icon}</div>
        <div class="db-info">
          <div class="db-title-row">
            <h2 class="db-name">${sanitize(db.name)}</h2>
            <span class="${tagClass}">${sanitize(db.tag)}</span>
          </div>
          <p class="db-url">${sanitize(db.url)}</p>
          <p class="status idle" id="status-${sanitize(db.id)}" aria-live="polite" aria-atomic="true">In attesa</p>
        </div>
      </div>
      <button
        class="${btnClass}"
        onclick="downloadFile('${sanitize(db.id)}')"
        aria-label="Scarica ${sanitize(db.name)}"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <span>Scarica</span>
      </button>
    </article>`;
}

// ── Download single file ───────────────────────────
async function downloadFile(id) {
  const db = DB_CONFIG.find((item) => item.id === id);
  const statusEl = document.getElementById(`status-${id}`);

  if (!db || !statusEl) return;

  setStatus(statusEl, "loading", "Download in corso…");

  try {
    const response = await fetch(db.url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const blob = await response.blob();
    triggerDownload(blob, db.name);

    const sizeKb = (blob.size / 1024).toFixed(1);
    setStatus(statusEl, "ok", `Scaricato con successo (${sizeKb} KB)`);
  } catch (err) {
    setStatus(statusEl, "error", `Errore: ${err.message}`);
    console.error(`[DB Console] Download ${db.name}:`, err);
  }
}

// ── Download all ───────────────────────────────────
async function downloadAll() {
  for (const db of DB_CONFIG) {
    await downloadFile(db.id);
    await delay(700);
  }
}

// ── Helpers ───────────────────────────────────────
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function setStatus(el, className, text) {
  el.className = `status ${className}`;
  el.textContent = text;
}

function sanitize(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ── Start ─────────────────────────────────────────
initApp();
