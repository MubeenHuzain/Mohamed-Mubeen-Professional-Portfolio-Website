/* ==========================================================================
   Mohamed Mubeen PT — Portfolio Interactive Engine
   1. Theme toggle (Monochrome: default Dark, toggleable to White Light)
   2. Copy-to-clipboard buttons (with selection fallback)
   3. Scroll-spy for the section navigation
   4. Category Filtering for Projects
   5. Interactive Contact Form handler
   ========================================================================== */
(function () {
  "use strict";

  var STORAGE_KEY = "mm-theme-bw";
  var root = document.documentElement;

  /* 1. Theme Controller --------------------------------------------------- */
  var themeBtn = document.getElementById("theme");

  function readSaved() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function save(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* storage blocked */ }
  }

  function currentTheme() {
    var t = root.getAttribute("data-theme");
    if (t) return t;
    var saved = readSaved();
    if (saved) return saved;
    return "dark"; // Default to dark for high-contrast luxury aesthetic
  }

  function renderThemeButton() {
    if (!themeBtn) return;
    var dark = currentTheme() === "dark";
    themeBtn.setAttribute("aria-pressed", dark ? "true" : "false");
    themeBtn.innerHTML = dark
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> Light'
      : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> Dark';
  }

  var initialTheme = readSaved() || "dark";
  root.setAttribute("data-theme", initialTheme);
  renderThemeButton();

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      save(next);
      renderThemeButton();
    });
  }

  /* 2. Copy to Clipboard -------------------------------------------------- */
  var status = document.getElementById("copy-status");

  function announce(button, message) {
    var original = button.getAttribute("data-label") || button.textContent;
    button.setAttribute("data-label", original);
    button.textContent = message;
    if (status) status.textContent = message;
    window.setTimeout(function () {
      button.textContent = original;
      if (status) status.textContent = "";
    }, 1800);
  }

  function selectText(button) {
    var target = button.parentNode && button.parentNode.querySelector(".val");
    if (target && window.getSelection) {
      var range = document.createRange();
      range.selectNodeContents(target);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
    announce(button, "Selected");
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-copy]"), function (button) {
    button.addEventListener("click", function () {
      var text = button.getAttribute("data-copy");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () { announce(button, "Copied!"); },
          function () { selectText(button); }
        );
      } else {
        selectText(button);
      }
    });
  });

  /* 3. Scroll-spy Navigation ---------------------------------------------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-links a[href^='#']"));
  var sections = links
    .map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); })
    .filter(Boolean);

  function setActive(id) {
    links.forEach(function (a) {
      if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
    /* Scroll only the nav-links container horizontally — never touch the main viewport */
    var active = links.filter(function (a) { return a.getAttribute("aria-current") === "true"; })[0];
    if (active) {
      var container = active.closest(".nav-links");
      if (container) {
        var scrollLeft = active.offsetLeft - container.offsetLeft - (container.clientWidth / 2) + (active.offsetWidth / 2);
        container.scrollTo({ left: scrollLeft, behavior: "smooth" });
      }
    }
  }

  if ("IntersectionObserver" in window && sections.length) {
    var visible = {};
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) { visible[entry.target.id] = entry.isIntersecting; });
        for (var i = 0; i < sections.length; i++) {
          if (visible[sections[i].id]) { setActive(sections[i].id); return; }
        }
      },
      { rootMargin: "-80px 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { observer.observe(s); });
  }

  /* 4. Projects Filter ---------------------------------------------------- */
  var projectFilterButtons = document.querySelectorAll(".projects-filter .filter-btn");
  var projectCards = document.querySelectorAll(".projects-grid .project-card");

  projectFilterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      projectFilterButtons.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var filter = btn.getAttribute("data-filter");

      projectCards.forEach(function (card) {
        if (filter === "all") {
          card.style.display = "flex";
        } else {
          var categories = (card.getAttribute("data-category") || "").split(" ");
          if (categories.indexOf(filter) !== -1) {
            card.style.display = "flex";
          } else {
            card.style.display = "none";
          }
        }
      });
    });
  });

  /* 5. Contact Form Handler ----------------------------------------------- */
  var contactForm = document.getElementById("contact-form");
  var formStatus = document.getElementById("form-status");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (document.getElementById("name") || {}).value || "";
      var email = (document.getElementById("email") || {}).value || "";
      var service = (document.getElementById("service") || {}).value || "General Inquiry";
      var subject = (document.getElementById("subject") || {}).value || "Portfolio Inquiry";
      var message = (document.getElementById("message") || {}).value || "";

      if (!name.trim() || !email.trim() || !message.trim()) {
        if (formStatus) {
          formStatus.className = "form-status error";
          formStatus.textContent = "Please fill in all required fields (Name, Email, Message).";
        }
        return;
      }

      var mailSubject = encodeURIComponent(subject + " - " + service + " (" + name + ")");
      var mailBody = encodeURIComponent(
        "Hello Mohamed Mubeen,\n\n" +
        "Name: " + name + "\n" +
        "Email: " + email + "\n" +
        "Service Needed: " + service + "\n\n" +
        "Message:\n" + message + "\n\n" +
        "— Sent from portfolio contact form"
      );

      var mailtoLink = "mailto:ptmubeen97@gmail.com?subject=" + mailSubject + "&body=" + mailBody;

      if (formStatus) {
        formStatus.className = "form-status success";
        formStatus.textContent = "Launching email client to send message to ptmubeen97@gmail.com...";
      }

      window.setTimeout(function () {
        window.location.href = mailtoLink;
      }, 400);
    });
  }
})();
