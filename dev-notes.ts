import { watch } from "fs";
import { join, extname } from "path";
import { parseNotes, buildInjection } from "./parse-notes.ts";

const PORT = 8001;
const ROOT = process.cwd();

const MIME: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

async function generate() {
  const sourceHtml = await Bun.file("index.html").text();
  const template = await Bun.file("notes/index.html").text();

  const { slides, totalSlides } = parseNotes(sourceHtml);
  const output = template.replace(
    /<!-- NOTES_START -->[\s\S]*?<!-- NOTES_END -->/,
    buildInjection(slides, totalSlides)
  );

  await Bun.write("notes/index.html", output);
  console.log(`[${new Date().toLocaleTimeString()}] Generated notes/index.html (${slides.length} / ${totalSlides} slides)`);
}

await generate();

watch("index.html", async () => {
  await generate();
});

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    let pathname = url.pathname;
    if (pathname === "/" || pathname === "") pathname = "/notes/index.html";

    const filepath = join(ROOT, pathname);
    const file = Bun.file(filepath);

    if (await file.exists()) {
      const ext = extname(filepath);
      return new Response(file, {
        headers: { "Content-Type": MIME[ext] ?? "application/octet-stream" },
      });
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Notes server: http://localhost:${PORT}/notes/`);
console.log("Watching index.html for changes...");
