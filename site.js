const PAGE_URLS = {
  home: "index.html",
  highlights: "highlights.html",
  curriculum: "curriculum.html",
};

function pageFromUrl() {
  const filename = window.location.pathname.split("/").pop() || "index.html";
  return Object.entries(PAGE_URLS).find(([, url]) => url === filename)?.[0] || "home";
}

async function loadPage(name, push = true) {
  const url = PAGE_URLS[name];
  if (!url) return;

  if (push && pageFromUrl() === name) return;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Unable to load ${url}`);
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const nextContent = doc.querySelector("#content");
    if (!nextContent) throw new Error(`Missing #content in ${url}`);

    document.title = doc.title;
    document.body.dataset.page = name;
    document.getElementById("content").innerHTML = nextContent.innerHTML;
    updateActiveNav(name);

    if (push) {
      history.pushState({ page: name }, "", url);
    }
  } catch {
    window.location.href = url;
  }
}

function updateActiveNav(page) {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.page === page);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  updateActiveNav(pageFromUrl());

  window.addEventListener("popstate", () => {
    loadPage(pageFromUrl(), false);
  });

  document.querySelectorAll("a[data-page]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const page = link.dataset.page;
      if (!PAGE_URLS[page]) return;
      if (window.location.protocol === "file:") return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      loadPage(page);
    });
  });
});

window.addEventListener("scroll", () => {
  const header = document.getElementById("main-header");
  header.classList.toggle("scrolled", window.scrollY > 100);
});

class TdItem extends HTMLElement {
  static _uid = 0;

  connectedCallback() {
    const title = this.getAttribute("title") || "";
    const desc = this.getAttribute("desc") || "";
    const enonce = this.getAttribute("enonce");
    const correction = this.getAttribute("correction");
    const previewMode = (this.getAttribute("preview") || "inline").toLowerCase();
    const uid = `tdprev-${TdItem._uid++}`;

    const resources = Array.from(this.querySelectorAll("td-resource"))
      .map((node) => ({ title: node.getAttribute("title"), href: node.getAttribute("href") }))
      .filter((resource) => resource.title && resource.href);

    this.innerHTML = `
      <div class="td-row">
        <div>
          <div class="td-title">${title}</div>
          ${desc ? `<div class="td-desc">${desc}</div>` : ""}
        </div>
        <div class="td-actions">
          ${enonce ? `
            <div class="td-btn-wrap">
              <a class="glass-btn ${previewMode === "inline" ? "pdf-btn" : ""}"
                 ${previewMode === "newtab" ? 'target="_blank" rel="noopener"' : ""}
                 ${previewMode === "inline" ? `data-target="${uid}" data-pdf="${enonce}"` : `href="${enonce}"`}
                 title="Énoncé" aria-label="Énoncé">PDF</a>
              <span class="td-btn-label">Énoncé</span>
            </div>` : ""}
          ${correction ? `
            <div class="td-btn-wrap">
              <a class="glass-btn ${previewMode === "inline" ? "pdf-btn" : ""}"
                 ${previewMode === "newtab" ? 'target="_blank" rel="noopener"' : ""}
                 ${previewMode === "inline" ? `data-target="${uid}" data-pdf="${correction}"` : `href="${correction}"`}
                 title="Correction" aria-label="Correction">OK</a>
              <span class="td-btn-label">Correction</span>
            </div>` : ""}
        </div>
        ${resources.length ? `
          <div class="td-resources">
            ${resources.map((resource) => `<span class="td-badge"><a href="${resource.href}">${resource.title}</a></span>`).join("")}
          </div>` : ""}
        ${previewMode === "inline" ? `
          <div class="td-preview" id="${uid}" hidden>
            <iframe src="" width="100%" height="600"
              style="border:1px solid #ddd; border-radius:8px;"></iframe>
          </div>` : ""}
      </div>`;

    if (previewMode !== "inline") return;

    this.addEventListener("click", (event) => {
      const button = event.target.closest(".pdf-btn");
      if (!button) return;
      event.preventDefault();

      const preview = this.querySelector(`#${CSS.escape(button.dataset.target)}`);
      const iframe = preview.querySelector("iframe");
      const pdfUrl = new URL(button.dataset.pdf, window.location.href).href;
      const current = preview.dataset.current || "";
      const isClosed = preview.hasAttribute("hidden");
      const isSameDocument = current === pdfUrl;

      if (isClosed) {
        iframe.src = pdfUrl;
        preview.dataset.current = pdfUrl;
        preview.removeAttribute("hidden");
        button.setAttribute("aria-expanded", "true");
      } else if (isSameDocument) {
        preview.setAttribute("hidden", "");
        iframe.src = "";
        preview.dataset.current = "";
        button.setAttribute("aria-expanded", "false");
      } else {
        iframe.src = pdfUrl;
        preview.dataset.current = pdfUrl;
        button.setAttribute("aria-expanded", "true");
      }
    });
  }
}

customElements.define("td-item", TdItem);
