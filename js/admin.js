/* ==========================================================================
   GIGL International School — notice manager (admin.html)
   Passcode gate + local drafts + JSON export + optional GitHub publish.
   NOTE: the passcode is convenience only. Never store secrets in this file.
   ========================================================================== */
(function () {
  "use strict";

  var PASSCODE = "GIGL2026";
  var KEY = "gigl_notices_draft";
  var TOKEN_KEY = "gigl_gh_token";
  var REPO_KEY = "gigl_gh_repo"; /* e.g. "username/gigl-website" */

  var $ = function (s) { return document.querySelector(s); };
  var gate = $("#gate");
  var app = $("#adminApp");
  var table = $("#adminTable tbody");
  var form = $("#noticeForm");
  var editingId = null;

  var notices = [];

  /* ---------- toast ---------- */
  window.GIGLToast = function (msg) {
    var t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("is-open");
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.classList.remove("is-open"); }, 2600);
  };

  /* ---------- gate ---------- */
  function unlock() {
    if (gate) gate.hidden = true;
    if (app) app.hidden = false;
    load();
  }
  var gateForm = $("#gateForm");
  if (gateForm) {
    gateForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = $("#gatePass");
      if (input && input.value.trim() === PASSCODE) {
        sessionStorage.setItem("gigl_admin", "1");
        unlock();
      } else {
        window.GIGLToast("Wrong passcode");
        if (input) { input.value = ""; input.focus(); }
      }
    });
  }

  /* ---------- storage ---------- */
  function load() {
    var saved = localStorage.getItem(KEY);
    if (saved) {
      try { notices = JSON.parse(saved); } catch (e) { notices = []; }
    }
    if (!notices.length) {
      fetch("data/notices.json?t=" + Date.now(), { cache: "no-store" })
        .then(function (r) { return r.json(); })
        .then(function (json) { notices = json; render(); })
        .catch(function () { notices = []; render(); });
    } else {
      render();
    }
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(notices, null, 2));
    render();
  }

  /* ---------- render ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function render() {
    if (!table) return;
    if (!notices.length) {
      table.innerHTML = '<tr><td colspan="6" style="color:#94a3b8">No notices yet. Add your first one above.</td></tr>';
      return;
    }
    table.innerHTML = notices.map(function (n, i) {
      return "<tr>" +
        "<td>" + (n.pinned ? '<i class="fa-solid fa-thumbtack" style="color:#f5b301"></i> ' : "") + esc(n.title) + "</td>" +
        "<td>" + esc(n.category || "General") + "</td>" +
        "<td>" + esc(n.date) + "</td>" +
        '<td><span class="badge ' + (n.active !== false ? "on" : "off") + '">' + (n.active !== false ? "Visible" : "Hidden") + "</span></td>" +
        '<td><button class="icon-btn" data-edit="' + i + '" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
        '<button class="icon-btn" data-dup="' + i + '" title="Duplicate"><i class="fa-regular fa-copy"></i></button>' +
        '<button class="icon-btn" data-del="' + i + '" title="Delete"><i class="fa-solid fa-trash"></i></button></td>' +
        "</tr>";
    }).join("");
  }

  if (table) {
    table.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      var i = btn.hasAttribute("data-edit") ? +btn.getAttribute("data-edit")
        : btn.hasAttribute("data-dup") ? +btn.getAttribute("data-dup")
        : +btn.getAttribute("data-del");

      if (btn.hasAttribute("data-del")) {
        if (confirm("Delete this notice?")) { notices.splice(i, 1); save(); window.GIGLToast("Notice deleted"); }
      } else if (btn.hasAttribute("data-dup")) {
        var copy = JSON.parse(JSON.stringify(notices[i]));
        copy.id = "N-" + Date.now();
        copy.title = copy.title + " (copy)";
        notices.splice(i + 1, 0, copy);
        save(); window.GIGLToast("Duplicated");
      } else {
        fillForm(i);
      }
    });
  }

  /* ---------- form ---------- */
  function fillForm(i) {
    var n = notices[i];
    editingId = n.id;
    $("#nTitle").value = n.title || "";
    $("#nBody").value = n.body || "";
    $("#nDate").value = n.date || "";
    $("#nCategory").value = n.category || "General";
    $("#nLink").value = n.link || "";
    $("#nPinned").checked = !!n.pinned;
    $("#nActive").checked = n.active !== false;
    $("#formTitle").textContent = "Edit notice";
    $("#cancelEdit").hidden = false;
    $("#noticeForm").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetForm() {
    editingId = null;
    if (form) form.reset();
    $("#nDate").value = new Date().toISOString().slice(0, 10);
    $("#nActive").checked = true;
    $("#formTitle").textContent = "Add a notice";
    $("#cancelEdit").hidden = true;
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = {
        id: editingId || "N-" + Date.now(),
        title: $("#nTitle").value.trim(),
        body: $("#nBody").value.trim(),
        date: $("#nDate").value || new Date().toISOString().slice(0, 10),
        category: $("#nCategory").value,
        pinned: $("#nPinned").checked,
        active: $("#nActive").checked,
        link: $("#nLink").value.trim()
      };
      if (!data.title) { window.GIGLToast("Title is required"); return; }

      if (editingId) {
        var idx = notices.findIndex(function (n) { return n.id === editingId; });
        if (idx > -1) notices[idx] = data;
        window.GIGLToast("Notice updated");
      } else {
        notices.unshift(data);
        window.GIGLToast("Notice added");
      }
      save();
      resetForm();
    });
  }

  var cancel = $("#cancelEdit");
  if (cancel) cancel.addEventListener("click", resetForm);

  /* ---------- export ---------- */
  function pretty() {
    return JSON.stringify(notices, null, 2);
  }

  var copyBtn = $("#copyJson");
  if (copyBtn) copyBtn.addEventListener("click", function () {
    navigator.clipboard.writeText(pretty()).then(function () {
      window.GIGLToast("JSON copied — paste into data/notices.json");
    }).catch(function () { window.GIGLToast("Copy blocked — use Download instead"); });
  });

  var dlBtn = $("#downloadJson");
  if (dlBtn) dlBtn.addEventListener("click", function () {
    var blob = new Blob([pretty()], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "notices.json";
    a.click();
    URL.revokeObjectURL(a.href);
    window.GIGLToast("Downloaded notices.json");
  });

  var resetBtn = $("#resetJson");
  if (resetBtn) resetBtn.addEventListener("click", function () {
    if (!confirm("Discard local changes and reload the published file?")) return;
    localStorage.removeItem(KEY);
    notices = [];
    load();
    window.GIGLToast("Reloaded from data/notices.json");
  });

  /* ---------- GitHub publish (optional) ---------- */
  var publishBtn = $("#publishGithub");
  if (publishBtn) publishBtn.addEventListener("click", function () {
    var token = $("#ghToken").value.trim() || localStorage.getItem(TOKEN_KEY) || "";
    var repo = $("#ghRepo").value.trim() || localStorage.getItem(REPO_KEY) || "";
    if (!token || !repo) {
      window.GIGLToast("Enter repo (user/repo) and a fine-grained token");
      return;
    }
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REPO_KEY, repo);

    var api = "https://api.github.com/repos/" + repo + "/contents/data/notices.json";
    publishBtn.disabled = true;
    publishBtn.textContent = "Publishing…";

    var headers = { Authorization: "Bearer " + token, Accept: "application/vnd.github+json" };

    fetch(api + "?ref=main", { headers: headers })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error("Cannot read file (" + r.status + ")")); })
      .then(function (file) {
        var content = btoa(unescape(encodeURIComponent(pretty())));
        return fetch(api, {
          method: "PUT",
          headers: headers,
          body: JSON.stringify({
            message: "Update notices from admin panel",
            content: content,
            sha: file.sha,
            branch: "main"
          })
        });
      })
      .then(function (r) {
        if (!r.ok) return r.json().then(function (j) { throw new Error(j.message || "Publish failed"); });
        window.GIGLToast("Published — live in about a minute");
      })
      .catch(function (err) { window.GIGLToast("Publish failed: " + err.message); })
      .finally(function () {
        publishBtn.disabled = false;
        publishBtn.textContent = "Publish to GitHub";
      });
  });

  /* ---------- boot ---------- */
  if (sessionStorage.getItem("gigl_admin") === "1") unlock();
  if ($("#nDate")) $("#nDate").value = new Date().toISOString().slice(0, 10);
  if ($("#ghRepo")) $("#ghRepo").value = localStorage.getItem(REPO_KEY) || "";
})();
