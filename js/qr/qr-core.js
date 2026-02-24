// ══════════════════════════════════════════════
//  QR-CORE.JS — Logica del tipo di contenuto QR
//              e costruzione della stringa dati
// ══════════════════════════════════════════════

const QRCore = (() => {
  let _inputs = null;
  let _typeSelect = null;
  let _sizeSelect = null;

  function init(inputs, typeSelect, sizeSelect) {
    _inputs = inputs;
    _typeSelect = typeSelect;
    _sizeSelect = sizeSelect;
  }

  /** Mostra solo il pannello di input corrispondente al tipo selezionato */
  function handleTypeChange(inputContainers, onClear) {
    const selectedType = _typeSelect.value;
    Object.values(inputContainers).forEach((c) => c.classList.add("hidden"));
    if (inputContainers[selectedType])
      inputContainers[selectedType].classList.remove("hidden");
    onClear();
  }

  /** Costruisce la stringa dati per il QR in base al tipo */
  function getQRData() {
    const type = _typeSelect.value;
    switch (type) {
      case "text":
        return _inputs.text.value.trim();

      case "url": {
        let url = _inputs.url.value.trim();
        if (!url.startsWith("http://") && !url.startsWith("https://"))
          url = "https://" + url;
        return url;
      }

      case "email": {
        const email = _inputs.email.value.trim();
        const subject = _inputs.emailSubject.value.trim();
        const body = _inputs.emailBody.value.trim();
        let emailUrl = `mailto:${email}`;
        const params = [];
        if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
        if (body) params.push(`body=${encodeURIComponent(body)}`);
        if (params.length) emailUrl += "?" + params.join("&");
        return emailUrl;
      }

      case "phone":
        return `tel:${_inputs.phone.value.trim()}`;

      case "whatsapp": {
        const waNumber = _inputs.whatsapp.value.trim().replace(/\D/g, "");
        const waMessage = _inputs.whatsappMessage.value.trim();
        let waUrl = `https://wa.me/${waNumber}`;
        if (waMessage) waUrl += `?text=${encodeURIComponent(waMessage)}`;
        return waUrl;
      }

      case "wifi": {
        const ssid = _inputs.wifiSsid.value.trim();
        const password = _inputs.wifiPassword.value.trim();
        const security = _inputs.wifiSecurity.value;
        return `WIFI:T:${security};S:${ssid};P:${password};;`;
      }

      default:
        return "";
    }
  }

  /** Verifica se c'è almeno un input valido nel form corrente */
  function hasValidInput() {
    const type = _typeSelect.value;
    switch (type) {
      case "email":
        return _inputs.email?.value?.trim();
      case "whatsapp":
        return _inputs.whatsapp?.value?.trim();
      case "wifi":
        return _inputs.wifiSsid?.value?.trim();
      default:
        return _inputs[type]?.value?.trim();
    }
  }

  function getType() {
    return _typeSelect.value;
  }

  function getSize() {
    return parseInt(_sizeSelect.value, 10);
  }

  return { init, handleTypeChange, getQRData, hasValidInput, getType, getSize };
})();
