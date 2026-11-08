import fs from "node:fs";

// The first Markdown heading of a post ("## Yveline et Daniel"), used as its title
// when the front matter has none (the imported posts only have a heading).
function headingTitle(inputPath) {
  try {
    const body = fs.readFileSync(inputPath, "utf8").replace(/^---[\s\S]*?\n---/, "");
    return /^\s*#{1,6}\s+(.+?)\s*#*\s*$/m.exec(body)?.[1] ?? null;
  } catch {
    return null;
  }
}

// Settings shared by every post in this folder, so posts only need a title and a date.
export default {
  layout: "layouts/post.njk",
  // A post with `draft: true` is not published at all.
  permalink: (data) => (data.draft ? false : `/blog/${data.page.fileSlug}/`),
  eleventyExcludeFromCollections: (data) => !!data.draft,
  eleventyComputed: {
    title: (data) => data.title || headingTitle(data.page.inputPath) || data.page.fileSlug,
  },
};
