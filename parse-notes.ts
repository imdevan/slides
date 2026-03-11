const PREVIEW_WORDS = 3;

function slidePreview(sectionHtml: string): string {
  // Remove the notes aside, then strip all tags and collapse whitespace
  const withoutNotes = sectionHtml.replace(/<aside class="notes">[\s\S]*?<\/aside>/g, "");
  const text = withoutNotes.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.split(" ").filter(Boolean).slice(0, PREVIEW_WORDS).join(" ");
}

export function parseNotes(sourceHtml: string) {
  const sectionRegex = /<section(?:\s[^>]*)?>[\s\S]*?<\/section>/g;
  const slides: { content: string; slideIndex: number; preview: string }[] = [];
  let totalSlides = 0;

  for (const match of sourceHtml.matchAll(sectionRegex)) {
    totalSlides++;
    const notesMatch = /<aside class="notes">([\s\S]*?)<\/aside>/.exec(match[0]);
    if (notesMatch) {
      const content = notesMatch[1].trim();
      if (content) {
        slides.push({
          content,
          slideIndex: totalSlides,
          preview: slidePreview(match[0]),
        });
      }
    }
  }

  return { slides, totalSlides };
}

export function buildInjection(
  slides: { content: string; slideIndex: number; preview: string }[],
  totalSlides: number
) {
  const sections = slides
    .map(
      (slide, i) =>
        `        <section data-index="${i + 1}">` +
        `<div class="slide-ref">${slide.slideIndex} / ${totalSlides}` +
        (slide.preview ? ` &mdash; ${slide.preview}&hellip;` : "") +
        `</div>${slide.content}</section>`
    )
    .join("\n");

  return `<!-- NOTES_START -->\n${sections}\n        <!-- NOTES_END -->`;
}
