document.getElementById("year").textContent = new Date().getFullYear();

let DB_CONFIG = [];

// Funzione per caricare il JSON e generare l'interfaccia
async function initApp() {
  const container = document.getElementById('db-container');
  
  try {
    const response = await fetch('../JSON/Database.json');
    if (!response.ok) throw new Error("Impossibile caricare data.json");
    
    const data = await response.json();
    DB_CONFIG = data.databases;
    
    // Genera l'HTML per ogni database nel JSON
    container.innerHTML = DB_CONFIG.map(db => `
      <article class="db-card">
        <div class="db-main">
          <div class="db-icon db-icon-${db.type}">
            <span>${db.icon}</span>
          </div>
          <div class="db-info">
            <div class="db-title-row">
              <h3 class="db-name">${db.name}</h3>
              <span class="db-tag ${db.type === 'green' ? 'db-tag-green' : ''}">${db.tag}</span>
            </div>
            <p class="db-url">${db.url}</p>
            <p class="status idle" id="status-${db.id}">In attesa…</p>
          </div>
        </div>
        <button class="btn ${db.type === 'green' ? 'btn-success' : 'btn-primary'}" onclick="downloadFile('${db.id}')">
          <span class="btn-label">Scarica</span>
        </button>
      </article>
    `).join('');

  } catch (err) {
    container.innerHTML = `<p class="status error">❌ Errore configurazione: ${err.message}</p>`;
    console.error(err);
  }
}

// Funzione di download singola
async function downloadFile(id) {
  const db = DB_CONFIG.find(item => item.id === id);
  const statusEl = document.getElementById(`status-${id}`);

  if (!db) return;

  statusEl.className = "status loading";
  statusEl.textContent = "⏳ Download in corso…";

  try {
    const response = await fetch(db.url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = db.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);

    const size = (blob.size / 1024).toFixed(1);
    statusEl.className = "status ok";
    statusEl.textContent = `✅ Scaricato con successo (${size} KB)`;
  } catch (err) {
    statusEl.className = "status error";
    statusEl.textContent = `❌ Errore: ${err.message}`;
    console.error(`Errore download ${db.name}:`, err);
  }
}

// Funzione per scaricare tutti i file
async function downloadAll() {
  for (const db of DB_CONFIG) {
    await downloadFile(db.id);
    // Piccolo delay per non intasare il browser
    await new Promise((r) => setTimeout(r, 600));
  }
}

// Avvio applicazione
initApp();