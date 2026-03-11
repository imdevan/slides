import { parseNotes, buildInjection } from "./parse-notes.ts";

const sourceHtml = await Bun.file("index.html").text();
const template = await Bun.file("notes/index.html").text();

const { slides, totalSlides } = parseNotes(sourceHtml);

if (slides.length === 0) {
  console.error('No <aside class="notes"> blocks found in index.html');
  process.exit(1);
}

const output = template.replace(
  /<!-- NOTES_START -->[\s\S]*?<!-- NOTES_END -->/,
  buildInjection(slides, totalSlides)
);

await Bun.write("notes/index.html", output);
console.log(`Built ${slides.length} / ${totalSlides} note slides into notes/index.html`);
