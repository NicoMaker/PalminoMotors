// ══════════════════════════════════════════════
//  EXTERNAL LINKS — Apertura WhatsApp e Gmail
// ══════════════════════════════════════════════

function openWhatsApp(event) {
  event.preventDefault();

  const href = event.currentTarget?.href || "";
  const match = href.match(/wa\.me\/(\d+)/);
  const number = match ? match[1] : null;

  const webUrl = number
    ? `https://web.whatsapp.com/send?phone=${number}`
    : "https://web.whatsapp.com/";

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    window.location.href = number
      ? `whatsapp://send?phone=${number}`
      : "whatsapp://";
    return;
  }

  let appOpened = false;
  const start = Date.now();
  const onBlur = () => { appOpened = true; };
  window.addEventListener("blur", onBlur);

  const a = document.createElement("a");
  a.href = number ? `whatsapp://send?phone=${number}` : "whatsapp://";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => {
    window.removeEventListener("blur", onBlur);
    const elapsed = Date.now() - start;
    if (!appOpened && elapsed < 1500) {
      window.open(webUrl, "_blank");
    }
  }, 1200);
}

function openMail(event) {
  event.preventDefault();

  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isAndroid) {
    let appOpened = false;
    const onBlur = () => { appOpened = true; };
    window.addEventListener("blur", onBlur);

    const a = document.createElement("a");
    a.href = "intent://compose#Intent;scheme=googlegmail;package=com.google.android.gm;end";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      window.removeEventListener("blur", onBlur);
      if (!appOpened) window.open("https://mail.google.com", "_blank");
    }, 1200);

  } else if (isIOS) {
    let appOpened = false;
    const onBlur = () => { appOpened = true; };
    window.addEventListener("blur", onBlur);
    window.location.href = "googlegmail://";

    setTimeout(() => {
      window.removeEventListener("blur", onBlur);
      if (!appOpened) window.open("https://mail.google.com", "_blank");
    }, 1200);

  } else {
    window.open("https://mail.google.com", "_blank");
  }
}
