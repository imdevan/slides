import { parseNotes, buildInjection } from "./parse-notes.ts";

const sourceHtml = await Bun.file("index.html").text();
const template = await Bun.file("notes/index.html").text();

const { slides, totalSlides } = parseNotes(sourceHtml);
const output = template.replace(
  /<!-- NOTES_START -->[\s\S]*?<!-- NOTES_END -->/,
  buildInjection(slides, totalSlides)
);

await Bun.write("notes/index.html", output);
console.log(`Generated notes/index.html with ${slides.length} / ${totalSlides} slides`);
