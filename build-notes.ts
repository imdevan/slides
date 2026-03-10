import { readFileSync, writeFileSync } from "fs";

const src = readFileSync("index.html", "utf-8");

// Extract all <aside class="notes">...</aside> blocks (multiline)
const asideRegex = /<aside\s+class="notes"[^>]*>([\s\S]*?)<\/aside\s*>/g;
const slides: string[] = [];

let match;
while ((match = asideRegex.exec(src)) !== null) {
  const content = match[1].trim();
  if (content) {
    slides.push(`        <section>\n          ${content}\n        </section>`);
  }
}

if (slides.length === 0) {
  console.error("No <aside class=\"notes\"> blocks found in index.html");
  process.exit(1);
}

const slidesHtml = slides.join("\n\n");
const revealContent = `    <div class="reveal">\n      <div class="slides">\n${slidesHtml}\n      </div>\n    </div>`;

const notesHtml = readFileSync("notes/index.html", "utf-8");
const updated = notesHtml.replace(
  /<div class="reveal">[\s\S]*?<\/div>\s*(?=\n\s*<script)/,
  revealContent + "\n"
);

writeFileSync("notes/index.html", updated);
console.log(`Built ${slides.length} note slides into notes/index.html`);
