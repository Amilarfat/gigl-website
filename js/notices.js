/* ==========================================================================
   GIGL International School — notice engine
   Reads data/notices.json (GitHub Pages) with a safe inline fallback.
   Renders: top marquee, home notice board, notices.html list.
   ========================================================================== */
(function () {
  "use strict";

  var FALLBACK = [
    {
      id: "N-2026-001",
      title: "Admissions Open for Session 2026-27 & 2027-28",
      body: "Limited seats from Nursery to Class 6th. Visit the campus between 9:00 AM and 3:00 PM.",
      date: "2026-11-10",
      category: "Admission",
      pinned: true,
      active: true,
      link: "#admission"
    },
    {
      id: "N-2026-002",
      title: "Parent-Teacher Meeting — Saturday, 22 November 2026",
      body: "Parents are requested to meet the class teacher between 9:00 AM and 12:30 PM.",
      date: "2026-11-08",
      category: "Event",
      pinned: false,
      active: true,
      link: ""
    },
    {
      id: "N-2026-003",
      title: "Winter Uniform from 1 December",
      body: "Complete winter uniform is compulsory from 1 December 2026.",
      date: "2026-11-05",
      category: "General",
      pinned: false,
      active: true,
      link: ""
    }
  ];

  var state = { all: [], shown: [], category: "all", query: "" };

  /* ---------- helpers ---------- */
  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function parseDate(d) {
    var t = Date.parse(d);
    return isNaN(t) ? 0 : t;
  }

  function fmtDate(d) {
    var t = parseDate(d);
    if (!t) return "";
    return new Date(t).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }

  function isNew(d) {
    var t = parseDate(d);
    if (!t) return false;
    return Date.now() - t < 7 * 24 * 60 * 60 * 1000;
  }

  function sortNotices(list) {
    return list.slice().sort(function (a, b) {
      if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
      return parseDate(b.date) - parseDate(a.date);
    });
  }

  function activeOnly(list) {
    return (Array.isArray(list) ? list : []).filter(function (n) {
      return n && n.active !== false && n.title;
    });
  }

  function tagClass(cat) {
    var map = { Admission: "tag--Admission", Exam: "tag--Exam", Holiday: "tag--Holiday", Event: "tag--Event" };
    return map[cat] || "";
  }

  function newBadge(n) {
    return isNew(n.date) ? ' <span class="tag tag--new">New</span>' : "";
  }

  /* ---------- rendering ---------- */
  function renderTicker(list) {
    var track = document.querySelector("[data-notice-ticker]");
    if (!track) return;
    var base = list.slice(0, 5).map(function (n) {
      return '<span class="ticker__item"><b>' + esc(n.category || "Notice") + ':</b> ' + esc(n.title) + "</span>";
    });
    if (!base.length) return;
    var fixed = '<span class="ticker__item"><b>Admissions Open 2026-27:</b> Nursery to Class 6th (CBSE Pattern) — Call +91 8434459262</span>';
    var row = fixed + base.join("");
    track.innerHTML = row + row; /* duplicated for a seamless loop */
  }

  function renderBoard(list) {
    var feature = document.querySelector("[data-notice-feature]");
    var listEl = document.querySelector("[data-notice-list]");
    if (!feature && !listEl) return;

    if (!list.length) {
      if (listEl) listEl.innerHTML = '<div class="empty">No notices published yet.</div>';
      return;
    }

    if (feature) {
      var top = list[0];
      feature.innerHTML =
        (top.pinned ? '<span class="pin"><i class="fa-solid fa-thumbtack"></i> Pinned notice</span>' : '<span class="pin"><i class="fa-regular fa-bell"></i> Latest</span>') +
        "<h3>" + esc(top.title) + "</h3>" +
        (top.image ? '<img class="notice-img" src="' + esc(top.image) + '" alt="' + esc(top.title) + '" loading="lazy">' : "") +
        "<p>" + esc(top.body) + "</p>" +
        '<div class="meta"><span><i class="fa-regular fa-calendar"></i> ' + fmtDate(top.date) + "</span>" +
        '<span class="tag ' + tagClass(top.category) + '">' + esc(top.category || "Notice") + "</span>" +
        newBadge(top) + "</div>" +
        (top.link ? '<p style="margin:18px 0 0"><a class="btn btn-gold btn-sm" href="' + esc(top.link) + '">Read more <i class="fa-solid fa-arrow-right"></i></a></p>' : "");
    }

    if (listEl) {
      listEl.innerHTML = list.slice(1, 6).map(function (n) {
        return '<a class="notice-item" href="' + esc(n.link || "#") + '">' +
          '<span class="top"><span class="tag ' + tagClass(n.category) + '">' + esc(n.category || "Notice") + "</span>" +
          newBadge(n) + '<span class="date">' + fmtDate(n.date) + "</span></span>" +
          "<b>" + esc(n.title) + "</b>" +
          "</a>";
      }).join("");
    }
  }

  function renderPage() {
    var listEl = document.querySelector("[data-notices-page]");
    if (!listEl) return;

    var filtered = state.all.filter(function (n) {
      var catOk = state.category === "all" || n.category === state.category;
      var q = state.query.toLowerCase();
      var textOk = !q || (n.title + " " + (n.body || "")).toLowerCase().indexOf(q) > -1;
      return catOk && textOk;
    });

    if (!filtered.length) {
      listEl.innerHTML = '<div class="empty"><i class="fa-regular fa-folder-open"></i><br>No notices match this filter.</div>';
      return;
    }

    listEl.innerHTML = filtered.map(function (n) {
      return '<article class="notice-item" id="' + esc(n.id) + '">' +
        '<span class="top"><span class="tag ' + tagClass(n.category) + '">' + esc(n.category || "Notice") + "</span>" +
        newBadge(n) + '<span class="date">' + fmtDate(n.date) + "</span></span>" +
        "<b>" + esc(n.title) + "</b>" +
        (n.image ? '<img class="notice-img notice-img--sm" src="' + esc(n.image) + '" alt="' + esc(n.title) + '" loading="lazy">' : "") +
        '<p style="font-size:13.5px;color:#94a3b8;margin:8px 0 0">' + esc(n.body) + "</p>" +
        (n.link ? '<p style="margin:12px 0 0"><a href="' + esc(n.link) + '">Read more →</a></p>' : "") +
        "</article>";
    }).join("");
  }

  function renderUpdated() {
    var el = document.querySelector("[data-notices-updated]");
    if (!el) return;
    el.textContent = "Last updated " + new Date().toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric"
    });
  }

  /* ---------- filters ---------- */
  function bindFilters() {
    var btns = document.querySelectorAll("[data-notice-filter]");
    Array.prototype.forEach.call(btns, function (btn) {
      btn.addEventListener("click", function () {
        Array.prototype.forEach.call(btns, function (b) {
          b.classList.remove("is-active"); b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
        state.category = btn.getAttribute("data-notice-filter");
        renderPage();
      });
    });

    var search = document.querySelector("[data-notice-search]");
    if (search) {
      search.addEventListener("input", function () {
        state.query = search.value.trim();
        renderPage();
      });
    }
  }

  /* ---------- public API ---------- */
  function renderAll(list) {
    state.all = sortNotices(activeOnly(list));
    renderTicker(state.all);
    renderBoard(state.all);
    renderPage();
    renderUpdated();
    return state.all;
  }

  window.GIGLNotices = { render: renderAll, all: function () { return state.all; } };

  /* ---------- boot ---------- */
  function boot() {
    bindFilters();
    fetch("data/notices.json?t=" + Date.now(), { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (json) { renderAll(json); })
      .catch(function (err) {
        console.warn("[GIGL] notices.json not reachable, using built-in fallback.", err.message);
        renderAll(FALLBACK);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
