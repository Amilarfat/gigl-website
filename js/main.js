/* ==========================================================================
   GIGL International School — main.js
   UI behaviour only. No frameworks, no build step, works on file:// too.
   ========================================================================== */
(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Sticky header ---------- */
  var navbar = $("#navbar");
  if (navbar) {
    var onScroll = function () {
      navbar.classList.toggle("is-stuck", window.scrollY > 40);
      var top = $("#toTop");
      if (top) top.classList.toggle("is-visible", window.scrollY > 500);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 2. Mobile drawer ---------- */
  var drawer = $("#drawer");
  var openBtn = $("#openMenu");
  var closeBtn = $("#closeMenu");
  var setDrawer = function (open) {
    if (!drawer) return;
    drawer.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.style.overflow = open ? "hidden" : "";
    if (open && closeBtn) closeBtn.focus();
  };
  if (openBtn) openBtn.addEventListener("click", function () { setDrawer(true); });
  if (closeBtn) closeBtn.addEventListener("click", function () { setDrawer(false); });
  if (drawer) $$("a", drawer).forEach(function (a) { a.addEventListener("click", function () { setDrawer(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setDrawer(false); });

  /* ---------- 3. Scroll reveal ---------- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window && reveals.length && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- 4. Counters ---------- */
  var counters = $$("[data-count]");
  if (counters.length) {
    var runCount = function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      var prefix = el.getAttribute("data-prefix") || "";
      var decimals = (String(target).split(".")[1] || "").length;
      if (reduceMotion) { el.textContent = prefix + target + suffix; return; }
      var start = performance.now(), dur = 1400;
      var tick = function (now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if ("IntersectionObserver" in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    } else {
      counters.forEach(runCount);
    }
  }

  /* ---------- 5. Back to top ---------- */
  var toTop = $("#toTop");
  if (toTop) toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* ---------- 6. Modal helper ---------- */
  var openModal = function (id) {
    var m = document.getElementById(id);
    if (!m) return;
    m.classList.add("is-open");
    m.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    var focusable = m.querySelector("button, a[href], input");
    if (focusable) focusable.focus();
  };
  var closeModal = function (m) {
    m.classList.remove("is-open");
    m.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };
  $$("[data-modal-open]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      openModal(btn.getAttribute("data-modal-open"));
    });
  });
  $$("[data-modal-close]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var m = btn.closest(".modal");
      if (m) closeModal(m);
    });
  });
  $$(".modal").forEach(function (m) {
    m.addEventListener("click", function (e) { if (e.target === m) closeModal(m); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") $$(".modal.is-open").forEach(closeModal);
  });

  /* ---------- 7. Tabs (prospectus) ---------- */
  $$("[data-tabs]").forEach(function (group) {
    var tabs = $$(".tab", group);
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var paneId = tab.getAttribute("data-tab");
        tabs.forEach(function (t) { t.classList.remove("is-active"); t.setAttribute("aria-selected", "false"); });
        tab.classList.add("is-active");
        tab.setAttribute("aria-selected", "true");
        $$(".tabpane", group.parentElement).forEach(function (p) { p.classList.toggle("is-active", p.id === paneId); });
      });
    });
  });

  /* ---------- 8. Gallery filter + lightbox ---------- */
  var gallery = $("#galleryGrid");
  if (gallery) {
    var items = $$(".g-item", gallery);
    var filterBtns = $$(".filter");
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) { b.classList.remove("is-active"); b.setAttribute("aria-pressed", "false"); });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
        var cat = btn.getAttribute("data-filter");
        items.forEach(function (it) {
          var show = cat === "all" || it.getAttribute("data-cat") === cat;
          it.style.display = show ? "" : "none";
        });
      });
    });

    var lb = $("#lightbox");
    var lbImg = $("#lbImg");
    var lbCap = $("#lbCap");
    var visible = function () { return items.filter(function (i) { return i.style.display !== "none"; }); };
    var current = 0;

    var showAt = function (list, idx) {
      if (!list.length) return;
      current = (idx + list.length) % list.length;
      var el = list[current];
      var img = el.querySelector("img");
      if (lbImg && img) {
        lbImg.src = img.getAttribute("data-full") || img.src;
        lbImg.alt = img.alt || "";
      }
      if (lbCap) lbCap.textContent = el.getAttribute("data-caption") || (img ? img.alt : "");
      lb.classList.add("is-open");
      lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };
    var closeLb = function () {
      if (!lb) return;
      lb.classList.remove("is-open");
      lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };

    items.forEach(function (el, i) {
      el.addEventListener("click", function () { showAt(visible(), visible().indexOf(el)); });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.click(); }
      });
    });
    var prev = $("#lbPrev"), next = $("#lbNext"), close = $("#lbClose");
    if (prev) prev.addEventListener("click", function () { showAt(visible(), current - 1); });
    if (next) next.addEventListener("click", function () { showAt(visible(), current + 1); });
    if (close) close.addEventListener("click", closeLb);
    if (lb) lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener("keydown", function (e) {
      if (!lb || !lb.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowRight") showAt(visible(), current + 1);
      if (e.key === "ArrowLeft") showAt(visible(), current - 1);
    });
  }

  /* ---------- 9. Emblem tilt (desktop, pointer only) ---------- */
  var emblem = $(".emblem");
  if (emblem && !reduceMotion && window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
    emblem.addEventListener("mousemove", function (e) {
      var r = emblem.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      emblem.style.transform = "perspective(900px) rotateY(" + (x * 8).toFixed(2) + "deg) rotateX(" + (-y * 8).toFixed(2) + "deg) translateY(-4px)";
    });
    emblem.addEventListener("mouseleave", function () { emblem.style.transform = ""; });
  }

  /* ---------- 10. Magnetic buttons ---------- */
  if (!reduceMotion && window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
    $$(".btn-gold").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        btn.style.transform = "translate(" + (x * 5).toFixed(1) + "px," + (y * 5 - 2).toFixed(1) + "px)";
      });
      btn.addEventListener("mouseleave", function () { btn.style.transform = ""; });
    });
  }

  /* ---------- 11. Footer year ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- 12. Enquiry form (no backend) ---------- */
  var enquiry = $("#enquiryForm");
  if (enquiry) {
    enquiry.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("#eqName"), phone = $("#eqPhone");
      var ok = true;
      [name, phone].forEach(function (f) {
        if (!f) return;
        var bad = !f.value.trim();
        f.classList.toggle("is-invalid", bad);
        ok = ok && !bad;
      });
      if (!ok) return;
      var msg = "Enquiry from " + name.value.trim() + " (" + phone.value.trim() + ") — " +
        ($("#eqClass") ? $("#eqClass").value : "") + ". " + ($("#eqMsg") ? $("#eqMsg").value : "");
      var num = (window.GIGL && window.GIGL.whatsapp) || "918434459262";
      window.open("https://wa.me/" + num + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
      if (window.GIGLToast) window.GIGLToast("Opening WhatsApp with your enquiry…");
      enquiry.reset();
    });
  }
})();
