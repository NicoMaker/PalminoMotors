// ══════════════════════════════════════════════
//  QR DATA — Costruzione stringa dati per il QR
// ══════════════════════════════════════════════

function getQRData(inputs, typeSelect) {
  const type = typeSelect.value;

  switch (type) {
    case "text":
      return inputs.text.value.trim();

    case "url":
      let url = inputs.url.value.trim();
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }
      return url;

    case "email": {
      const email = inputs.email.value.trim();
      const subject = inputs.emailSubject.value.trim();
      const body = inputs.emailBody.value.trim();
      let emailUrl = `mailto:${email}`;
      const params = [];
      if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
      if (body) params.push(`body=${encodeURIComponent(body)}`);
      if (params.length) emailUrl += "?" + params.join("&");
      return emailUrl;
    }

    case "phone":
      return `tel:${inputs.phone.value.trim()}`;

    case "whatsapp": {
      const waNumber = inputs.whatsapp.value.trim().replace(/\D/g, "");
      const waMessage = inputs.whatsappMessage.value.trim();
      let waUrl = `https://wa.me/${waNumber}`;
      if (waMessage) waUrl += `?text=${encodeURIComponent(waMessage)}`;
      return waUrl;
    }

    case "wifi": {
      const ssid = inputs.wifiSsid.value.trim();
      const password = inputs.wifiPassword.value.trim();
      const security = inputs.wifiSecurity.value;
      return `WIFI:T:${security};S:${ssid};P:${password};;`;
    }

    default:
      return "";
  }
}
