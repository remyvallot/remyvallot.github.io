import { readFile, writeFile } from "node:fs/promises";

const pages = [
  {
    slug: "home",
    file: "index.html",
    title: "Rémy Vallot",
    description:
      "Official website of Rémy Vallot, PhD Candidate in Applied Mathematics & Scientific Computing.",
  },
  {
    slug: "highlights",
    file: "highlights.html",
    title: "Highlights - Rémy Vallot",
    description: "Talks, posters, workshops, and research highlights from Rémy Vallot.",
  },
  {
    slug: "curriculum",
    file: "curriculum.html",
    title: "Curriculum - Rémy Vallot",
    description: "Education, teaching, and work experience of Rémy Vallot.",
  },
];

const pageBySlug = new Map(pages.map((page) => [page.slug, page]));

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function preserveHtml(value) {
  const placeholders = [];
  const placeholder = (match) => {
    const key = `@@HTML_${placeholders.length}@@`;
    placeholders.push([key, match]);
    return key;
  };

  let text = value
    .replace(/<a\b[^>]*>.*?<\/a>/gis, placeholder)
    .replace(/<\/?br\s*\/?>/gi, placeholder)
    .replace(/<!--[\s\S]*?-->/g, placeholder);

  text = escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");

  for (const [key, html] of placeholders) {
    text = text.replaceAll(key, html);
  }

  return text;
}

function convertHighlight(html) {
  return html.replace(/<div class="highlight">\s*([\s\S]*?)\s*<\/div>/g, (_, raw) => {
    const [date, title, desc, img = "", link = "", ...externalParts] = raw
      .trim()
      .split("|")
      .map((part) => part.trim());

    if (!title || !desc) {
      return `<div class="highlight">${raw}</div>`;
    }

    const hasPreview = img && link;
    const { resourcesList, abstract } = parseHighlightExtras([
      ...(!hasPreview && link ? [link] : []),
      ...externalParts,
    ]);

    const preview = hasPreview
      ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener">
          <img src="${escapeHtml(img)}" alt="${escapeHtml(title)} Preview" class="highlight-thumb">
        </a>`
      : "";

    const resources = resourcesList.length
      ? `<div class="highlight-resources">
          ${resourcesList
            .map((resource) => {
              const parsed = parseResource(resource);
              const logo = `https://www.google.com/s2/favicons?domain=${parsed.url}&sz=64`;
              return `<a href="${escapeHtml(parsed.url)}" class="glass-btn" title="${escapeHtml(parsed.label)}" target="_blank" rel="noopener"><img src="${logo}" alt=""> ${escapeHtml(parsed.text)}</a>`;
            })
            .join("")}
        </div>`
      : "";

    const abstractHtml = abstract
      ? `<details class="highlight-abstract">
          <summary>Abstract</summary>
          <p>${preserveHtml(abstract)}</p>
        </details>`
      : "";

    return `<div class="highlight-entry">
      <div class="highlight-text">
        <strong>${preserveHtml(title)}</strong>${date ? ` ${preserveHtml(date)}` : ""}<br>${preserveHtml(desc)}
        ${abstractHtml}
        ${resources}
      </div>
      ${preview}
    </div>`;
  });
}

function parseHighlightExtras(parts) {
  const resourcesList = [];
  let abstract = "";

  for (const part of parts) {
    const value = part.trim();
    if (!value) continue;

    const abstractMatch = value.match(/^abstract\s*:\s*(.+)$/is);
    if (abstractMatch) {
      abstract = abstractMatch[1].trim();
      continue;
    }

    for (const item of value.split(",")) {
      const resource = item.trim();
      if (resource) resourcesList.push(resource);
    }
  }

  return { resourcesList, abstract };
}

function parseResource(resource) {
  const explicit = resource.match(/^([a-z0-9-]+)\s*:\s*(https?:\/\/.+)$/i);
  const type = explicit?.[1]?.toLowerCase() || "";
  const url = explicit?.[2] || resource;

  if (type === "arxiv" || /(^|\.)arxiv\.org$/i.test(hostname(url))) {
    return {
      url,
      label: "arXiv",
      text: "Available on arXiv!",
    };
  }

  if (type === "hal" || /(^|\.)hal\.science$/i.test(hostname(url))) {
    return {
      url,
      label: "HAL",
      text: "Available on HAL!",
    };
  }

  return {
    url,
    label: "External resource",
    text: "Available online",
  };
}

function hostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let paragraph = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(`<p>${preserveHtml(paragraph.join("<br>"))}</p>`);
    paragraph = [];
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    if (trimmed.startsWith("<!--")) {
      flushParagraph();
      const html = [line];
      while (!lines[i].includes("-->") && i < lines.length - 1) {
        i += 1;
        html.push(lines[i]);
      }
      blocks.push(html.join("\n"));
      continue;
    }

    if (/^<([a-z][\w-]*)(\s|>|$)/i.test(trimmed)) {
      flushParagraph();
      const html = [line];
      while (i < lines.length - 1 && lines[i + 1].trim()) {
        i += 1;
        html.push(lines[i]);
      }
      blocks.push(html.join("\n"));
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      const level = heading[1].length;
      blocks.push(`<h${level}>${preserveHtml(heading[2])}</h${level}>`);
      continue;
    }

    if (trimmed.startsWith(">")) {
      flushParagraph();
      const quote = [];
      while (lines[i]?.trim().startsWith(">")) {
        quote.push(lines[i].trim().replace(/^>\s?/, ""));
        i += 1;
      }
      i -= 1;
      blocks.push(`<blockquote>${quote.map((item) => `<p>${preserveHtml(item)}</p>`).join("")}</blockquote>`);
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  return convertHighlight(blocks.join("\n\n"));
}

function pageUrl(slug) {
  return pageBySlug.get(slug)?.file ?? "index.html";
}

function renderPage(page, content) {
  const nav = pages
    .map((item) => {
      const active = item.slug === page.slug ? " active" : "";
      const label = item.slug[0].toUpperCase() + item.slug.slice(1);
      return `<a href="${pageUrl(item.slug)}" class="nav-link${active}" data-page="${item.slug}">${label}</a>`;
    })
    .join("\n      ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${page.title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="google-site-verification" content="YaX1ODyLa3V0D36u9aIgvQXBG_idBO4bus8o-eaboDo">
  <meta name="description" content="${page.description}">
  <meta name="author" content="Rémy Vallot">
  <link rel="canonical" href="https://remyvallot.github.io/${page.file === "index.html" ? "" : page.file}">
  <link rel="stylesheet" href="style.css">
  <link rel="icon" type="image/png" href="avatar_tab.png">
</head>
<body data-page="${page.slug}">
  <div class="global-wrapper" id="main-header">
    <div class="header-horizontal">
      <a href="index.html" data-page="home">
        <img src="avatar.png" alt="Profile Picture" class="avatar">
      </a>
      <div class="title-block">
        <div class="title-line">
          <h1>
            <a href="index.html" data-page="home" class="title-link">Rémy Vallot</a>
          </h1>
          <div class="social-buttons">
            <a href="mailto:remy.vallot@ens-paris-saclay.fr" class="glass-btn" title="Email">
              <img src="img/email.svg" alt="Mail">
            </a>
            <a href="https://www.linkedin.com/in/remy-vallot/" class="glass-btn" title="LinkedIn" target="_blank" rel="noopener">
              <img src="img/linkedin.svg" alt="LinkedIn">
            </a>
            <a href="https://scholar.google.com/citations?user=RF2oOKoAAAAJ&hl=fr&oi=ao" class="glass-btn" title="Google Scholar" target="_blank" rel="noopener">
              <img src="img/google-scholar.svg" alt="Google Scholar">
            </a>
            <a href="https://github.com/remyvallot" class="glass-btn" title="GitHub" target="_blank" rel="noopener">
              <img src="img/github.svg" alt="GitHub">
            </a>
          </div>
        </div>
        <p class="subtitle">
          Ph.D. candidate in Applied Mathematics<br>
          Trying to accelerate the convergence of nonlinear solvers.
        </p>
        <p class="location">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#666" viewBox="0 0 24 24" class="map-icon" aria-hidden="true">
            <path d="M12 2a7.008 7.008 0 0 0-7 7c0 5.353 6.036 11.45 6.293 11.707l.707.707.707-.707C12.964 20.45 19 14.353 19 9a7.008 7.008 0 0 0-7-7zm0 16.533C10.471 16.825 7 12.553 7 9a5 5 0 0 1 10 0c0 3.546-3.473 7.823-5 9.533z"/>
            <path d="M12 6a3 3 0 1 0 3 3 3 3 0 0 0-3-3zm0 4a1 1 0 1 1 1-1 1 1 0 0 1-1 1z"/>
          </svg>
          École Normale Supérieure Paris-Saclay & Michelin
        </p>
      </div>
    </div>

    <nav>
      ${nav}
    </nav>

    <main id="content">
${content}
    </main>
  </div>

  <script src="site.js" defer></script>
</body>
</html>
`;
}

for (const page of pages) {
  const markdown = await readFile(`${page.slug}.md`, "utf8");
  const content = markdownToHtml(markdown)
    .split("\n")
    .map((line) => `      ${line}`)
    .join("\n");
  await writeFile(page.file, renderPage(page, content));
}

const baseUrl = "https://remyvallot.github.io/";
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map((page) => {
    const loc = page.file === "index.html" ? baseUrl : `${baseUrl}${page.file}`;
    return `  <url>
    <loc>${loc}</loc>
  </url>`;
  })
  .join("\n")}
</urlset>
`;

await writeFile("sitemap.xml", sitemap);
await writeFile(
  "robots.txt",
  `User-agent: *
Allow: /

Sitemap: ${baseUrl}sitemap.xml
`,
);
