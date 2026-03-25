document.getElementById("year").textContent = new Date().getFullYear();

const FILES = {
  magazzino: {
    url: "http://89.36.210.147:3000/Backend/db/magazzino.db",
    filename: "magazzino.db",
  },
  preventivi: {
    url: "http://89.36.210.147:3001/backend/db/preventivi.db",
    filename: "preventivi.db",
  },
};

async function downloadFile(key) {
  const { url, filename } = FILES[key];
  const statusEl = document.getElementById(`status-${key}`);

  statusEl.className = "status loading";
  statusEl.textContent = "⏳ Download in corso…";

  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`HTTP ${response.status} – ${response.statusText}`);

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
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
    console.error(`Errore download ${filename}:`, err);
  }
}

async function downloadAll() {
  await downloadFile("magazzino");
  await new Promise((r) => setTimeout(r, 500));
  await downloadFile("preventivi");
}
