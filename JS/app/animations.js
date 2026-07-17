// ══════════════════════════════════════════════
//  ANIMATIONS — Orchestrazione micro-interazioni
//  Layer additivo: osserva il DOM, non tocca i render
// ══════════════════════════════════════════════

(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Stagger automatico su contenuti iniettati ──
  function staggerChildren(container, selector) {
    const items = container.querySelectorAll(selector);
    items.forEach((el, i) => {
      if (el.classList.contains("stagger-in")) return;
      el.style.setProperty("--stagger-i", Math.min(i, 14));
      el.classList.add("stagger-in");
      el.addEventListener(
        "animationend",
        () => el.classList.remove("stagger-in"),
        { once: true },
      );
    });
  }

  const observedTargets = [
    { id: "areaGrid", selector: ".area-card" },
    { id: "detailMain", selector: ".detail-link-card, .brand-item" },
    { id: "brandContainer", selector: ".brand-item" },
  ];

  function observeContainers() {
    if (reduced) return;
    observedTargets.forEach(({ id, selector }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new MutationObserver(() => staggerChildren(el, selector));
      obs.observe(el, { childList: true, subtree: true });
      // Contenuto già presente al momento dell'attach
      staggerChildren(el, selector);
    });
  }

  // ── Transizione pagina: wrappa enterArea / goHome ──
  function wrapNavigation() {
    if (reduced) return;
    const origEnter = window.enterArea;
    const origHome = window.goHome;

    if (typeof origEnter === "function") {
      window.enterArea = function (index) {
        origEnter(index);
        const detail = document.getElementById("screenDetail");
        if (detail) {
          detail.classList.remove("page-enter");
          void detail.offsetWidth; // restart animation
          detail.classList.add("page-enter");
        }
      };
    }

    if (typeof origHome === "function") {
      window.goHome = function () {
        origHome();
        const home = document.getElementById("screenHome");
        if (home) {
          home.classList.remove("page-enter");
          void home.offsetWidth;
          home.classList.add("page-enter");
        }
      };
    }
  }

  // ── Ripple su tocco/click (delegato) ──
  function initRipple() {
    if (reduced) return;
    document.addEventListener("pointerdown", (e) => {
      const target = e.target.closest(".area-card, .detail-link-card");
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const wave = document.createElement("span");
      wave.className = "ripple-wave";
      wave.style.width = wave.style.height = size + "px";
      wave.style.left = e.clientX - rect.left - size / 2 + "px";
      wave.style.top = e.clientY - rect.top - size / 2 + "px";
      target.appendChild(wave);
      wave.addEventListener("animationend", () => wave.remove(), {
        once: true,
      });
    });
  }

  // ── Footer reveal on scroll ──
  function initFooterReveal() {
    const footer = document.getElementById("siteFooter");
    if (!footer) return;
    if (reduced || !("IntersectionObserver" in window)) {
      footer.classList.add("revealed");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            footer.classList.add("revealed");
            io.disconnect();
          }
        });
      },
      { threshold: 0.1 },
    );
    io.observe(footer);
  }

  document.addEventListener("DOMContentLoaded", () => {
    observeContainers();
    wrapNavigation();
    initRipple();
    initFooterReveal();
  });
})();
