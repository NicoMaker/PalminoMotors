// ══════════════════════════════════════════════
//  DATA-LOADER.JS — Lettura centralizzata data.json
//  Usato sia da app.js che da qr.js
// ══════════════════════════════════════════════

const DataLoader = (() => {
  let _cache = null;
  let _promise = null;

  /**
   * Carica data.json una sola volta e lo mette in cache.
   * Chiamate successive restituiscono la cache.
   * @returns {Promise<Object>} Dati completi del JSON
   */
  async function load() {
    if (_cache) return _cache;
    if (_promise) return _promise;

    _promise = fetch("data.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        _cache = data;
        _promise = null;
        return data;
      })
      .catch((err) => {
        _promise = null;
        console.error("❌ Errore caricamento data.json:", err);
        throw err;
      });

    return _promise;
  }

  /** Restituisce la cache sincrona (null se non ancora caricata) */
  function getCache() {
    return _cache;
  }

  return { load, getCache };
})();
