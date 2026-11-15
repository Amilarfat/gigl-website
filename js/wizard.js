/* ==========================================================================
   GIGL International School — 5-step admission wizard
   Client-side only. Generates a printable acknowledgement slip.
   ========================================================================== */
(function () {
  "use strict";

  var form = document.getElementById("admissionWizard");
  if (!form) return;

  var steps = Array.prototype.slice.call(form.querySelectorAll(".wiz-step"));
  var bars = Array.prototype.slice.call(form.querySelectorAll(".progress span"));
  var btnPrev = form.querySelector("[data-wiz-prev]");
  var btnNext = form.querySelector("[data-wiz-next]");
  var btnSubmit = form.querySelector("[data-wiz-submit]");
  var stepLabel = form.querySelector("[data-wiz-label]");
  var slipBox = document.getElementById("slipBox");
  var slipWrap = document.getElementById("slipWrap");
  var index = 0;

  function show(i) {
    index = Math.max(0, Math.min(i, steps.length - 1));
    steps.forEach(function (s, n) { s.classList.toggle("is-active", n === index); });
    bars.forEach(function (b, n) { b.classList.toggle("is-done", n <= index); });
    if (btnPrev) btnPrev.style.visibility = index === 0 ? "hidden" : "visible";
    if (btnNext) btnNext.style.display = index === steps.length - 1 ? "none" : "inline-flex";
    if (btnSubmit) btnSubmit.style.display = index === steps.length - 1 ? "inline-flex" : "none";
    if (stepLabel) stepLabel.textContent = "Step " + (index + 1) + " of " + steps.length;
    if (index === steps.length - 1) buildReview();
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------- validation ---------- */
  function validateStep(i) {
    var step = steps[i];
    var ok = true;
    var fields = step.querySelectorAll("[data-required]");
    Array.prototype.forEach.call(fields, function (f) {
      var val = (f.value || "").trim();
      var bad = !val;
      if (f.type === "tel" && val) bad = !/^[0-9+\-\s]{10,15}$/.test(val);
      if (f.type === "email" && val) bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      f.classList.toggle("is-invalid", bad);
      if (bad) ok = false;
    });
    if (!ok) {
      var first = step.querySelector(".is-invalid");
      if (first) {
        first.focus();
        first.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
    return ok;
  }

  /* ---------- review ---------- */
  var LABELS = {
    sName: "Student name", sClass: "Class applied for", sDob: "Date of birth",
    sGender: "Gender", sBlood: "Blood group", sType: "Day scholar / Boarder",
    fName: "Father's name", fOcc: "Father's occupation", mName: "Mother's name",
    mOcc: "Mother's occupation", pPhone: "WhatsApp number", pEmail: "Email",
    pAddress: "Address", tRoute: "Transport route", tGuardian: "Local guardian",
    tEmergency: "Emergency contact", aPrev: "Previous school", aSibling: "Sibling in school"
  };

  function val(id) {
    var f = document.getElementById(id);
    if (!f) return "";
    if (f.type === "radio") {
      var checked = form.querySelector('input[name="' + id + '"]:checked');
      return checked ? checked.value : "";
    }
    return (f.value || "").trim();
  }

  function buildReview() {
    var box = document.getElementById("wizReview");
    if (!box) return;
    var rows = Object.keys(LABELS).map(function (id) {
      var v = val(id);
      if (!v) return "";
      return "<div><span>" + LABELS[id] + '</span><span>' + v.replace(/</g, "&lt;") + "</span></div>";
    }).join("");
    box.innerHTML = rows || '<div><span>No details entered yet</span><span>—</span></div>';
  }

  /* ---------- submit ---------- */
  function makeId() {
    var n = Math.floor(100000 + Math.random() * 899999);
    return "GIGL-2026-ADM-" + n;
  }

  function buildSlip(appId) {
    if (!slipBox) return;
    var row = function (k, v) {
      return v ? "<tr><td>" + k + "</td><td>" + v.replace(/</g, "&lt;") + "</td></tr>" : "";
    };
    slipBox.innerHTML =
      '<div class="slip__head">' +
        '<img src="assets/images/gigl/logo.png" alt="GIGL crest">' +
        "<div><h4>GIGL International School</h4>" +
        "<p>Maharajganj Pokhar, Imambari, Laheriasarai, Darbhanga – 846001, Bihar<br>" +
        "giglschool2026@gmail.com · +91 8434459262</p></div>" +
      "</div>" +
      '<div class="slip__id"><span>Application ID</span><strong>' + appId + "</strong></div>" +
      '<table>' +
        row("Student name", val("sName")) +
        row("Class applied for", val("sClass")) +
        row("Date of birth", val("sDob")) +
        row("Gender", val("sGender")) +
        row("Blood group", val("sBlood")) +
        row("Day scholar / Boarder", val("sType")) +
        row("Father's name", val("fName")) +
        row("Mother's name", val("mName")) +
        row("WhatsApp number", val("pPhone")) +
        row("Email", val("pEmail")) +
        row("Transport route", val("tRoute")) +
        row("Local guardian", val("tGuardian")) +
        row("Emergency contact", val("tEmergency")) +
        row("Previous school", val("aPrev")) +
        row("Sibling in school", val("aSibling")) +
        row("Submitted on", new Date().toLocaleString("en-IN")) +
      "</table>" +
      '<div class="slip__foot"><div>This is a computer-generated acknowledgement.<br>' +
      "Please carry a printed copy for the campus visit.</div>" +
      '<div class="slip__seal">School<br>Seal</div></div>';
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateStep(index)) return;
    var appId = makeId();
    buildSlip(appId);

    if (slipWrap) {
      slipWrap.hidden = false;
      slipWrap.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    var wa = document.getElementById("slipWhatsapp");
    if (wa) {
      var msg = "Admission enquiry — " + appId + "\nStudent: " + val("sName") +
        "\nClass: " + val("sClass") + "\nParent: " + val("fName") +
        "\nPhone: " + val("pPhone");
      var num = (window.GIGL && window.GIGL.whatsapp) || "918434459262";
      wa.href = "https://wa.me/" + num + "?text=" + encodeURIComponent(msg);
    }

    /* optional email copy — FormSubmit needs a one-time activation click */
    try {
      var body = new FormData();
      body.append("Application ID", appId);
      body.append("Student", val("sName"));
      body.append("Class", val("sClass"));
      body.append("Parent", val("fName"));
      body.append("Phone", val("pPhone"));
      body.append("_subject", "New admission enquiry — " + appId);
      fetch("https://formsubmit.co/ajax/giglschool2026@gmail.com", {
        method: "POST", body: body, headers: { Accept: "application/json" }
      }).catch(function () { /* offline / blocked — slip still works */ });
    } catch (err) { /* ignore */ }
  });

  if (btnNext) btnNext.addEventListener("click", function () { if (validateStep(index)) show(index + 1); });
  if (btnPrev) btnPrev.addEventListener("click", function () { show(index - 1); });

  /* clear error as soon as the user types */
  form.addEventListener("input", function (e) {
    if (e.target.classList && e.target.classList.contains("is-invalid")) {
      e.target.classList.remove("is-invalid");
    }
  });

  show(0);
})();
