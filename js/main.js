/* Nutrimo Agri Science — site scripts (no dependencies) */
(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("open", open);
    };
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
  }

  /* ---------- Header shadow + back-to-top ---------- */
  var header = document.querySelector(".site-header");
  var toTop = document.querySelector(".back-to-top");
  var onScroll = function () {
    var y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 8);
    if (toTop) toTop.classList.toggle("show", y > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Filterable lists (products, resources) ---------- */
  document.querySelectorAll("[data-filter-group]").forEach(function (group) {
    var target = document.querySelector(group.getAttribute("data-filter-group"));
    if (!target) return;
    var items = target.querySelectorAll("[data-category]");
    var search = document.querySelector(group.getAttribute("data-search") || "#__none");
    var empty = target.parentElement.querySelector(".no-results");
    var active = "all";

    var apply = function () {
      var q = search ? search.value.trim().toLowerCase() : "";
      var shown = 0;
      items.forEach(function (item) {
        var okCat = active === "all" || item.getAttribute("data-category") === active;
        var okText = !q || item.textContent.toLowerCase().indexOf(q) !== -1;
        item.hidden = !(okCat && okText);
        if (!item.hidden) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
    };

    group.querySelectorAll(".filter-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        group.querySelectorAll(".filter-btn").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
        btn.setAttribute("aria-pressed", "true");
        active = btn.getAttribute("data-filter");
        apply();
      });
    });
    if (search) search.addEventListener("input", apply);

    // Allow deep links such as products.html#pesticides
    var hash = location.hash.replace("#", "");
    var preset = hash && group.querySelector('.filter-btn[data-filter="' + hash + '"]');
    if (preset) preset.click();
  });

  /* ---------- Prefill inquiry form from query string ---------- */
  var params = new URLSearchParams(location.search);
  ["product", "type", "position"].forEach(function (key) {
    var value = params.get(key);
    var field = value && document.querySelector('[data-prefill="' + key + '"]');
    if (!field) return;
    if (field.tagName === "SELECT") {
      var match = Array.prototype.find.call(field.options, function (o) { return o.value === value || o.text === value; });
      if (match) field.value = match.value;
    } else {
      field.value = value;
    }
  });

  /* ---------- Forms ----------
     Each form with [data-form] is validated client-side. If it has a
     data-endpoint (e.g. a Formspree/Getform URL or your own API), the data is
     POSTed there. Otherwise the visitor's email app opens with the message
     pre-filled and addressed to data-mailto. */
  document.querySelectorAll("form[data-form]").forEach(function (form) {
    var status = form.querySelector(".form-status");

    var showStatus = function (type, msg) {
      if (!status) return;
      status.className = "form-status " + type;
      status.textContent = msg;
      status.setAttribute("role", type === "error" ? "alert" : "status");
    };

    var validateField = function (input) {
      var wrap = input.closest(".field");
      if (!wrap) return true;
      var ok = input.checkValidity();
      wrap.classList.toggle("invalid", !ok);
      input.setAttribute("aria-invalid", String(!ok));
      return ok;
    };

    form.querySelectorAll("input, select, textarea").forEach(function (input) {
      input.addEventListener("blur", function () { if (input.value) validateField(input); });
      input.addEventListener("input", function () {
        if (input.closest(".field.invalid")) validateField(input);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var honeypot = form.querySelector(".hp input");
      if (honeypot && honeypot.value) return; // bot
      var firstBad = null;
      form.querySelectorAll("input, select, textarea").forEach(function (f) {
        if (f.closest(".hp")) return;
        if (!validateField(f) && !firstBad) firstBad = f;
      });
      if (firstBad) {
        firstBad.focus();
        showStatus("error", "Please check the highlighted fields and try again.");
        return;
      }

      var data = new FormData(form);
      var endpoint = form.getAttribute("data-endpoint");
      var btn = form.querySelector('[type="submit"]');
      var success = form.getAttribute("data-success") || "Thank you! Our team will get back to you within one business day.";

      if (endpoint) {
        if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = "Sending…"; }
        fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
          .then(function (res) {
            if (!res.ok) throw new Error(res.status);
            form.reset();
            showStatus("success", success);
          })
          .catch(function () {
            showStatus("error", "Sorry, something went wrong. Please email us directly at " + (form.getAttribute("data-mailto") || "our office") + ".");
          })
          .finally(function () {
            if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label; }
          });
        return;
      }

      // Fallback: compose an email
      var lines = [];
      data.forEach(function (value, key) {
        if (key === "website" || value instanceof File) return;
        lines.push(key.replace(/_/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); }) + ": " + value);
      });
      var hasFile = Array.prototype.some.call(form.querySelectorAll('input[type="file"]'), function (f) { return f.files.length; });
      if (hasFile) lines.push("", "(Please attach your resume to this email before sending.)");
      var subject = form.getAttribute("data-subject") || "Website inquiry";
      var mailto = "mailto:" + (form.getAttribute("data-mailto") || "") +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(lines.join("\n"));
      window.location.href = mailto;
      showStatus("success", "Your email app should now open with your message ready to send. " + (hasFile ? "Remember to attach your resume. " : "") + "Thank you!");
    });
  });
})();
