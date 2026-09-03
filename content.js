// bc2pdf — adds a "PDF" button to the Basecamp doc toolbar that opens a
// dropdown with output options (title alignment, full-width images, live
// preview) and a Download button. Hides Basecamp UI chrome, keeps native
// doc styling, and prints to PDF.

(() => {
  const STYLE_ID = "bc2pdf-css";
  const MENU_ID = "bc2pdf-menu";

  const state = {
    titleAlign: "left",
    imageFullWidth: false,
    preview: false,
  };

  // Content rules shared by print and preview: chrome hiding + doc styling.
  function contentRules() {
    return `
  /* App + doc header chrome — always hidden: top nav, toolbar, breadcrumbs,
     byline, avatar, footer trays. */
  nav.nav { visibility: hidden !important; }
  .perma-toolbar { display: none !important; }
  .perma-toolbar__breadcrumbs { display: none !important; }
  .perma-header__content { visibility: hidden !important; }
  .avatar-button { display: none !important; }
  footer.footer-trays { display: none !important; }
  .help { display: none !important; }
  .sidebar-badge { display: none !important; }

  /* Title alignment */
  .perma-header__title { text-align: ${state.titleAlign} !important; }

  /* Comments */
  .recordable-discussion { display: none !important; }

  /* Images: drop the tint background and preview frame border. */
  figure.attachment { background: transparent !important; }
  figure.attachment--preview::before { display: none !important; }
  ${state.imageFullWidth ? `
  figure.attachment,
  figure.attachment .inline_media_box,
  figure.attachment .attachment__frame,
  figure.attachment .attachment__link {
    width: 100% !important;
    max-width: 100% !important;
  }
  figure.attachment img {
    width: 100% !important;
    max-width: none !important;
    height: auto !important;
  }` : ""}

  /* Caption styling — strip the frame, keep Basecamp's native look. */
  figure.attachment .attachment__caption,
  figure.attachment figcaption {
    border: 0 !important;
    outline: 0 !important;
    box-shadow: none !important;
  }
`;
  }

  function buildCss() {
    const rules = contentRules() + `
  /* Print layout — page setup and centering, only relevant when printing. */
  @page { size: letter; margin: 2cm; }
  body { margin: 0 !important; background: white !important; }
  .main-content { margin: 0 auto !important; max-width: 50em !important; padding: 0 !important; }
`;
    return `@media print {\n${rules}\n}`;
  }

  // Live preview shows the chrome-hiding + doc styling on screen, but NOT
  // the print layout rules (page size, margins, white background) — those
  // would narrow the page and whiten the screen for no reason.
  function buildPreviewCss() {
    const rules = contentRules() + `
  /* When the avatar column is hidden, the grid still reserves its 56px
     column + 16px gap, but the h1 (above the grid) doesn't. Push it right
     so it aligns with the content column. */
  .perma-header__title { margin-left: calc(var(--perma-avatar-size, 56px) + var(--perma-column-gap, 16px)) !important; }
`;
    return `@media screen {\n${rules}\n}`;
  }

  function applyCss(css, id) {
    let style = document.getElementById(id);
    if (!style) {
      style = document.createElement("style");
      style.id = id;
      document.head.appendChild(style);
    }
    style.textContent = css;
  }

  function removeCss(id) {
    const style = document.getElementById(id);
    if (style) style.remove();
  }

  function updateStyles() {
    // Preview uses a separate style id so it can be removed independently.
    applyCss(buildCss(), STYLE_ID);
    if (state.preview) {
      applyCss(buildPreviewCss(), "bc2pdf-preview");
    } else {
      removeCss("bc2pdf-preview");
    }
  }

  function makeSeg(options, value, onChange) {
    const seg = document.createElement("div");
    seg.className = "bc2pdf-seg";
    for (const opt of options) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.val = opt.val;
      btn.title = opt.title;
      btn.innerHTML = opt.icon;
      if (opt.val === value) btn.classList.add("active");
      btn.addEventListener("click", () => {
        seg.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        onChange(opt.val);
      });
      seg.appendChild(btn);
    }
    return seg;
  }

  function makeToggle(checked, onChange) {
    const label = document.createElement("label");
    label.className = "bc2pdf-toggle";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = checked;
    input.addEventListener("change", () => onChange(input.checked));
    label.appendChild(input);
    return label;
  }

  function buildMenu() {
    const menu = document.createElement("div");
    menu.id = MENU_ID;
    menu.className = "bc2pdf-menu";

    // Title alignment
    const alignRow = document.createElement("div");
    alignRow.className = "bc2pdf-row";
    const alignLabel = document.createElement("span");
    alignLabel.textContent = "Title alignment";
    alignRow.appendChild(alignLabel);
    const seg = makeSeg(
      [
        { val: "left", title: "Left align", icon: `<svg viewBox="0 0 16 16"><rect x="1" y="1" width="14" height="2.4" rx="1"/><rect x="1" y="6.8" width="10" height="2.4" rx="1"/><rect x="1" y="12.6" width="12" height="2.4" rx="1"/></svg>` },
        { val: "center", title: "Center align", icon: `<svg viewBox="0 0 16 16"><rect x="1" y="1" width="14" height="2.4" rx="1"/><rect x="3" y="6.8" width="10" height="2.4" rx="1"/><rect x="2" y="12.6" width="12" height="2.4" rx="1"/></svg>` },
      ],
      state.titleAlign,
      (v) => {
        state.titleAlign = v;
        updateStyles();
      }
    );
    alignRow.appendChild(seg);
    menu.appendChild(alignRow);

    // Full-width images
    const imgRow = document.createElement("div");
    imgRow.className = "bc2pdf-row";
    const imgLabel = document.createElement("span");
    imgLabel.textContent = "Full-width images";
    imgRow.appendChild(imgLabel);
    imgRow.appendChild(makeToggle(state.imageFullWidth, (on) => {
      state.imageFullWidth = on;
      updateStyles();
    }));
    menu.appendChild(imgRow);

    // Live preview
    const prevRow = document.createElement("div");
    prevRow.className = "bc2pdf-row";
    const prevLabel = document.createElement("span");
    prevLabel.textContent = "Live preview";
    prevRow.appendChild(prevLabel);
    prevRow.appendChild(makeToggle(state.preview, (on) => {
      state.preview = on;
      updateStyles();
      // Entering focus mode closes the menu; the floating PDF button stays
      // reachable top-right so preview can be toggled back off.
      if (on) menu.remove();
    }));
    menu.appendChild(prevRow);

    // Download
    const download = document.createElement("button");
    download.type = "button";
    download.className = "bc2pdf-download";
    download.textContent = "Download PDF";
    download.addEventListener("click", () => {
      menu.remove();
      applyCss(buildCss(), STYLE_ID);
      removeCss("bc2pdf-preview");
      setTimeout(() => window.print(), 50);
    });
    menu.appendChild(download);

    return menu;
  }

  const MENU_CSS = `
    .bc2pdf-menu {
      position: fixed;
      width: 240px;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      padding: 10px;
      z-index: 100000;
      font-family: -apple-system, "Helvetica Neue", sans-serif;
      font-size: 12px;
      color: #29353c;
    }
    .bc2pdf-row {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 10px; gap: 8px;
    }
    .bc2pdf-row span { font-weight: 600; }
    .bc2pdf-seg { display: flex; border: 1px solid #d1d5db; border-radius: 4px; overflow: hidden; }
    .bc2pdf-seg button {
      display: flex; align-items: center; justify-content: center;
      width: 26px; height: 24px; border: 0; background: #fff; cursor: pointer;
    }
    .bc2pdf-seg button + button { border-left: 1px solid #e5e7eb; }
    .bc2pdf-seg button svg { width: 13px; height: 13px; fill: #6b7280; }
    .bc2pdf-seg button.active { background: #111; }
    .bc2pdf-seg button.active svg { fill: #fff; }
    .bc2pdf-toggle input {
      position: relative; width: 34px; height: 20px; margin: 0;
      -webkit-appearance: none; appearance: none;
      background: #d1d5db; border-radius: 10px; cursor: pointer; transition: background 0.15s;
    }
    .bc2pdf-toggle input::after {
      content: ""; position: absolute; top: 2px; left: 2px;
      width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform 0.15s;
    }
    .bc2pdf-toggle input:checked { background: #111; }
    .bc2pdf-toggle input:checked::after { transform: translateX(14px); }
    .bc2pdf-download {
      width: 100%; padding: 8px 0; border: 0; border-radius: 4px;
      background: #111; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer;
    }
    .bc2pdf-download:hover { background: #29353c; }
    .bc2pdf-float-btn {
      position: fixed;
      top: 20px;
      right: 24px;
      z-index: 100001;
      padding: 6px 14px;
      border: 0;
      border-radius: 50rem;
      background: #4a3d2d;
      color: #fff;
      font-family: -apple-system, "Helvetica Neue", sans-serif;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .bc2pdf-float-btn:hover { background: #3a2f22; }
  `;

  function openMenu(anchor) {
    const existing = document.getElementById(MENU_ID);
    if (existing) {
      existing.remove();
      return;
    }
    const menu = buildMenu();
    document.body.appendChild(menu);
    // Position it directly under the anchor, right-aligned to it.
    const rect = anchor.getBoundingClientRect();
    menu.style.top = rect.bottom + 6 + "px";
    menu.style.right = Math.round(window.innerWidth - rect.right) + "px";
    // Close on outside click or Esc.
    setTimeout(() => {
      document.addEventListener("click", (e) => {
        if (!menu.contains(e.target) && e.target !== anchor) menu.remove();
      }, { once: true });
    }, 0);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") menu.remove();
    }, { once: true });
  }

  function inject() {
    const style = document.createElement("style");
    style.textContent = MENU_CSS;
    document.head.appendChild(style);

    const toolbar = document.querySelector(".perma-toolbar__actions");
    if (!toolbar || toolbar.querySelector("[data-bc2pdf]")) return;

    // Toolbar button — opens the menu, positioned first in the actions.
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.bc2pdf = "1";
    btn.className = "perma-toolbar__btn btn btn--sm btn--ghost";
    btn.style.marginLeft = "4px";
    btn.textContent = "PDF";
    btn.addEventListener("click", () => openMenu(btn));
    toolbar.prepend(btn);

    // Floating button — only visible while live preview is on, so the menu
    // (and the preview off-switch) stays reachable even though the toolbar is
    // hidden. Sits in the top-right corner of the page.
    const floatBtn = document.createElement("button");
    floatBtn.type = "button";
    floatBtn.dataset.bc2pdfFloat = "1";
    floatBtn.className = "bc2pdf-float-btn";
    floatBtn.textContent = "PDF";
    floatBtn.style.display = "none";
    floatBtn.addEventListener("click", () => openMenu(floatBtn));
    document.body.appendChild(floatBtn);

    // Show/hide the floating button as preview toggles.
    const observer = new MutationObserver(() => {
      const on = document.getElementById("bc2pdf-preview") !== null;
      floatBtn.style.display = on ? "block" : "none";
      // Toggle the toolbar button too — it's inside the hidden toolbar while
      // preview is on, so the floating one takes over.
    });
    observer.observe(document.head, { childList: true, subtree: true });
  }

  // Toolbar may render after the content script runs; poll until it exists.
  const poll = setInterval(() => {
    if (document.querySelector(".perma-toolbar__actions")) {
      clearInterval(poll);
      inject();
    }
  }, 500);
})();