// ══════════════════════════════════════════════
//  QR ACTIONS — Download, Copia, Stampa
// ══════════════════════════════════════════════

function downloadQR(currentQR) {
  if (!currentQR) return;
  const link = document.createElement("a");
  link.href = currentQR.canvas.toDataURL("image/png");
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace(/:/g, "-").replace("T", "_");
  link.download = `PalminoMotors_QR_${currentQR.type}_${timestamp}.png`;
  link.click();
}

async function copyToClipboard(currentQR, showToast) {
  if (!currentQR) return;
  try {
    const blob = await new Promise((resolve) =>
      currentQR.canvas.toBlob(resolve, "image/png"),
    );
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    showToast("QR Code copiato negli appunti!", "success");
  } catch (error) {
    console.error("❌ Errore copia negli appunti:", error);
    showToast("Impossibile copiare l'immagine", "error");
  }
}

function printQR(currentQR, showToast) {
  if (!currentQR) return;
  try {
    const imageUrl = currentQR.canvas.toDataURL("image/png");
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showToast("Abilita i popup per stampare", "error");
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Stampa QR Code - Palmino Motors</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: white; padding: 20px; }
            img { max-width: 100%; height: auto; display: block; }
            @media print { body { padding: 0; } img { max-width: 100%; page-break-inside: avoid; } }
          </style>
        </head>
        <body>
          <img src="${imageUrl}" alt="QR Code Palmino Motors" onload="window.print(); setTimeout(() => window.close(), 100);" />
        </body>
      </html>
    `);
  } catch (error) {
    console.error("❌ Errore stampa:", error);
    showToast("Errore durante la stampa", "error");
  }
}
