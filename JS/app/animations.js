// ══════════════════════════════════════════════
//  ANIMATIONS — Orchestrazione moderna condivisa
//  Usato da index.html E da qr/index.html
//  Layer additivo: osserva il DOM, non tocca i render
// ══════════════════════════════════════════════

(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (id) => document.getElementById(id);

  // ═══════════════════════════════════════════
  //  BOOT INTRO — logo grande SOLO all'avvio
  //  (la SPA non ricarica: tornare alla home
  //   da una sezione non ritriggera nulla)
  // ═══════════════════════════════════════════
  function runBootIntro() {
    const splash = $("introSplash");

    // Intro SOLO al primo avvio della sessione:
    // tornando da qr/ (o da altre pagine) non si ripete
    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem("pm_intro_done") === "1";
    } catch (e) {
      alreadySeen = false;
    }
    if (alreadySeen) {
      if (splash) splash.remove();
      document.body.classList.add("booted");
      return;
    }
    try {
      sessionStorage.setItem("pm_intro_done", "1");
    } catch (e) {}

    document.body.classList.add("boot");

    const endBoot = () => {
      document.body.classList.remove("boot");
      document.body.classList.add("booted");
    };

    if (!splash || reduced) {
      if (splash) splash.remove();
      // lascia comunque girare le animazioni hero al primo paint
      setTimeout(endBoot, reduced ? 0 : 1400);
      return;
    }

    // Sequenza: logo grande → shrink+fade → rivela la pagina
    requestAnimationFrame(() => splash.classList.add("intro-in"));
    setTimeout(() => {
      splash.classList.add("intro-out");
      splash.addEventListener(
        "transitionend",
        () => {
          splash.remove();
          endBoot();
        },
        { once: true },
      );
      // fallback di sicurezza
      setTimeout(() => {
        if (document.body.contains(splash)) splash.remove();
        endBoot();
      }, 1200);
    }, 950);
  }

  // ═══════════════════════════════════════════
  //  SCROLL FX — header, orbs parallax,
  //  logo hero che si riduce scrollando
  // ═══════════════════════════════════════════
  function initScrollFX() {
    const header =
      $("hubHeader") || document.querySelector(".qr-header") || null;
    const orbs = document.querySelectorAll(".ambient-orbs .orb");
    const hero = $("homeLogoHero");
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;

        // Header più marcato quando scrolli
        if (header) header.classList.toggle("scrolled", y > 24);

        if (!reduced) {
          // Parallax leggero degli orbs
          orbs.forEach((orb, i) => {
            const speed = [0.08, 0.14, 0.05][i % 3];
            orb.style.setProperty("--scrollY", `${-(y * speed)}px`);
          });

          // Logo hero: si riduce dolcemente scrollando
          if (hero) {
            const scale = Math.max(0.6, 1 - y / 600);
            const fade = Math.max(0.25, 1 - y / 480);
            hero.style.transform = `scale(${scale})`;
            hero.style.opacity = fade;
          }
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ═══════════════════════════════════════════
  //  SCROLL REVEAL — elementi che appaiono
  //  in cascata mentre scrolli tra i dati
  // ═══════════════════════════════════════════
  let io = null;
  function ensureIO() {
    if (io || reduced || !("IntersectionObserver" in window)) return io;
    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          io.unobserve(el);
          el.classList.add("stagger-in");
          el.addEventListener(
            "animationend",
            () => {
              el.classList.remove("stagger-in", "pre-reveal");
              el.style.removeProperty("--stagger-i");
            },
            { once: true },
          );
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );
    return io;
  }

  function prepareReveal(container, selector) {
    if (reduced) return;
    const obs = ensureIO();
    if (!obs) return;
    const items = container.querySelectorAll(selector);
    items.forEach((el, i) => {
      if (el.classList.contains("pre-reveal") || el.dataset.revealed) return;
      el.dataset.revealed = "1";
      el.style.setProperty("--stagger-i", i % 12);
      el.classList.add("pre-reveal");
      obs.observe(el);
    });
  }

  // Contenuti iniettati dinamicamente (hub)
  const dynamicTargets = [
    { id: "areaGrid", selector: ".area-card" },
    { id: "detailMain", selector: ".detail-link-card, .brand-item" },
    { id: "brandContainer", selector: ".brand-item" },
  ];

  function observeDynamic() {
    dynamicTargets.forEach(({ id, selector }) => {
      const el = $(id);
      if (!el) return;
      const mo = new MutationObserver(() => prepareReveal(el, selector));
      mo.observe(el, { childList: true, subtree: true });
      prepareReveal(el, selector);
    });
  }

  // Contenuti statici (footer, pagina QR)
  function observeStatic() {
    const staticSelectors = [
      ".footer-col",
      ".footer-logo-section",
      ".panel", // QR: pannelli
      ".qr-layout .form-group", // QR: campi form
    ];
    staticSelectors.forEach((sel) => prepareReveal(document, sel));
  }

  // ═══════════════════════════════════════════
  //  TRANSIZIONE PAGINA home ⇄ detail (hub)
  // ═══════════════════════════════════════════
  function wrapNavigation() {
    if (reduced) return;
    const origEnter = window.enterArea;
    const origHome = window.goHome;

    const replay = (el) => {
      if (!el) return;
      el.classList.remove("page-enter");
      void el.offsetWidth;
      el.classList.add("page-enter");
    };

    if (typeof origEnter === "function") {
      window.enterArea = function (index) {
        origEnter(index);
        replay($("screenDetail"));
      };
    }
    if (typeof origHome === "function") {
      window.goHome = function () {
        origHome();
        replay($("screenHome"));
      };
    }
  }

  // ═══════════════════════════════════════════
  //  RIPPLE su tocco/click
  // ═══════════════════════════════════════════
  function initRipple() {
    if (reduced) return;
    document.addEventListener("pointerdown", (e) => {
      const target = e.target.closest(
        ".area-card, .detail-link-card, .btn-primary, .btn-secondary",
      );
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

  // ═══════════════════════════════════════════
  //  FOOTER reveal
  // ═══════════════════════════════════════════
  function initFooterReveal() {
    const footer = $("siteFooter") || document.querySelector(".site-footer");
    if (!footer) return;
    if (reduced || !("IntersectionObserver" in window)) {
      footer.classList.add("revealed");
      return;
    }
    const fio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            footer.classList.add("revealed");
            fio.disconnect();
          }
        });
      },
      { threshold: 0.08 },
    );
    fio.observe(footer);
  }

  document.addEventListener("DOMContentLoaded", () => {
    runBootIntro();
    initScrollFX();
    observeDynamic();
    observeStatic();
    wrapNavigation();
    initRipple();
    initFooterReveal();
  });
})();
