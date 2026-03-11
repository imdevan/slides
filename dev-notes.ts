import { watch } from "fs";
import { join } from "path";
import { parseNotes, buildInjection } from "./parse-notes.ts";

const ROOT = process.cwd();

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

// Start the notes gulp serve (has livereload built in)
const proc = Bun.spawn(["./node_modules/.bin/gulp", "serve", "--port", "8080"], {
  cwd: join(ROOT, "notes"),
  stdout: "inherit",
  stderr: "inherit",
});

console.log("Watching index.html for changes...");

process.on("exit", () => proc.kill());
process.on("SIGINT", () => { proc.kill(); process.exit(); });
