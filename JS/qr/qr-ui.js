// ══════════════════════════════════════════════
//  QR UI — Toast, info section, clear, type change
// ══════════════════════════════════════════════

function showToast(toastEl, toastMessage, msg, type = "success") {
  toastMessage.textContent = msg;
  const icon = toastEl.querySelector("svg");

  if (type === "error") {
    toastEl.style.borderColor = "rgba(220,38,38,0.4)";
  } else {
    toastEl.style.borderColor = "rgba(34,197,94,0.4)";
  }

  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 3000);
}

function updateInfoSection(currentQR, infoType, infoSize, infoLogo, infoContent) {
  if (!currentQR) return;
  const typeMap = {
    text: "Testo",
    url: "URL/Link",
    email: "Email",
    phone: "Telefono",
    whatsapp: "WhatsApp",
    wifi: "WiFi",
  };
  infoType.textContent = typeMap[currentQR.type] || currentQR.type;
  infoSize.textContent = `${currentQR.size}px`;
  infoLogo.textContent = "Logo + Info";
  const contentText =
    currentQR.data.length > 60
      ? currentQR.data.slice(0, 60) + "..."
      : currentQR.data;
  infoContent.textContent = contentText;
}

function clearQR(qrContainer, downloadSection, infoType, infoSize, infoContent) {
  qrContainer.innerHTML = `
    <div class="placeholder">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>
      <p>Il tuo QR Code apparirà qui</p>
      <span class="hint">Compila i campi e premi Genera</span>
    </div>
  `;
  qrContainer.classList.remove("has-qr");
  downloadSection.classList.add("hidden");
  infoType.textContent = "-";
  infoSize.textContent = "-";
  infoContent.textContent = "-";
}

function handleTypeChange(typeSelect, inputContainers, clearFn) {
  const selectedType = typeSelect.value;
  Object.values(inputContainers).forEach((container) =>
    container.classList.add("hidden"),
  );
  if (inputContainers[selectedType]) {
    inputContainers[selectedType].classList.remove("hidden");
  }
  clearFn();
}
