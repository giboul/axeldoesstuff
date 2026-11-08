import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import Image, { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import { EleventyHtmlBasePlugin } from "@11ty/eleventy";

const INPUT = "src";
const POSTS_GLOB = `${INPUT}/blog/**/*.md`;
const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif|tiff?|heic)$/i;

// ---------------------------------------------------------------------------
// Photo ids
// A photo's id is a short hash of the file's *contents*, not its name.
// So the same picture copied into two post folders is still one gallery photo.
// ---------------------------------------------------------------------------
const idCache = new Map();
function photoId(absPath) {
  if (!idCache.has(absPath)) {
    const hash = crypto.createHash("sha1").update(fs.readFileSync(absPath)).digest("hex");
    idCache.set(absPath, hash.slice(0, 10));
  }
  return idCache.get(absPath);
}

function resolveImage(postInputPath, src) {
  if (!src || /^(https?:)?\/\//.test(src) || src.startsWith("data:")) return null;
  const clean = decodeURI(src.split(/[?#]/)[0]);
  const abs = clean.startsWith("/")
    ? path.resolve(INPUT, "." + clean)
    : path.resolve(path.dirname(postInputPath), clean);
  return IMAGE_EXT.test(abs) && fs.existsSync(abs) ? abs : null;
}

// Find every picture in a Markdown post: ![caption](file.jpg) and <img src="…" alt="…">
function findImages(markdown) {
  const body = markdown.replace(/^---[\s\S]*?\n---/, "").replace(/```[\s\S]*?```/g, "");
  const found = [];
  const mdImage = /!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(?:\s+"([^"]*)")?\s*\)/g;
  const htmlImage = /<img\b[^>]*>/gi;
  let m;
  while ((m = mdImage.exec(body))) found.push({ index: m.index, alt: m[1], src: m[2], title: m[3] });
  while ((m = htmlImage.exec(body))) {
    const src = /\bsrc=["']([^"']+)["']/i.exec(m[0])?.[1];
    const alt = /\balt=["']([^"']*)["']/i.exec(m[0])?.[1] ?? "";
    if (src) found.push({ index: m.index, alt, src });
  }
  return found.sort((a, b) => a.index - b.index);
}

// The words of a post, for the gallery search: no front matter, code, markup or image syntax.
function plainText(markdown) {
  return markdown
    .replace(/^---[\s\S]*?\n---/, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images: their captions are indexed separately
    .replace(/<[^>]+>/g, " ") // html tags
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links: keep the text, drop the url
    .replace(/[#>*_`~|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];

export default function (eleventyConfig) {
  // On GitHub Pages the site lives under /<repo>/ : the build sets PATH_PREFIX and this
  // plugin rewrites every absolute link (/gallery/, /img/…) to include it.
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  // -------------------------------------------------------------------------
  // Images inside posts: every <img> is resized and converted automatically.
  // -------------------------------------------------------------------------
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["webp", "jpeg"],
    widths: [480, 960, 1600],
    urlPath: "/img/",
    outputDir: "_site/img/",
    htmlOptions: {
      imgAttributes: { loading: "lazy", decoding: "async", sizes: "(min-width: 760px) 720px, 100vw" },
    },
  });

  // -------------------------------------------------------------------------
  // Collections
  // -------------------------------------------------------------------------
  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByGlob(POSTS_GLOB).filter((p) => !p.data.draft).sort((a, b) => b.date - a.date)
  );

  // The gallery: built from the pictures found in the blog posts.
  eleventyConfig.addCollection("photos", (api) => {
    const posts = api.getFilteredByGlob(POSTS_GLOB)
      .filter((p) => !p.data.draft && p.data.gallery !== false)
      .sort((a, b) => a.date - b.date); // oldest first: a photo belongs to the first post that used it

    const byId = new Map();
    const textByUrl = new Map(); // post url -> the post's words, searched in the gallery
    let order = 0;
    for (const post of posts) {
      const raw = fs.readFileSync(post.inputPath, "utf8");
      textByUrl.set(post.url, plainText(raw));
      for (const img of findImages(raw)) {
        const abs = resolveImage(post.inputPath, img.src);
        if (!abs) continue;
        const id = photoId(abs);
        const caption = (img.title || img.alt || "").trim();
        if (!byId.has(id)) {
          byId.set(id, {
            id,
            file: abs,
            caption,
            date: post.date,
            order: order++,
            posts: [],
            tags: new Set(),
          });
        }
        const photo = byId.get(id);
        if (!photo.caption && caption) photo.caption = caption;
        if (!photo.posts.some((p) => p.url === post.url)) {
          photo.posts.push({ url: post.url, title: post.data.title, date: post.date });
        }
        (post.data.tags || []).forEach((t) => photo.tags.add(t));
      }
    }

    // Newest first; photos from the same post keep the order they appear in it.
    const photos = [...byId.values()].sort((a, b) => b.date - a.date || a.order - b.order).map((p) => {
      const tags = [...p.tags].filter((t) => !["posts", "all"].includes(t));
      const d = new Date(p.date);
      const search = [
        p.caption,
        ...p.posts.map((x) => x.title),
        ...p.posts.map((x) => textByUrl.get(x.url)),
        ...tags,
        d.getFullYear(),
        MONTHS[d.getMonth()],
      ].join(" ").toLowerCase();
      p.posts.sort((a, b) => a.date - b.date);
      return { ...p, tags, search };
    });
    photos.forEach((p, i) => {
      p.prev = photos[i - 1]?.id ?? null;
      p.next = photos[i + 1]?.id ?? null;
    });
    return photos;
  });

  // -------------------------------------------------------------------------
  // Markdown: an image on its own line becomes a figure with a caption,
  // linking to its page in the gallery.
  // -------------------------------------------------------------------------
  eleventyConfig.amendLibrary("md", (md) => {
    const defaultImage = md.renderer.rules.image;
    md.renderer.rules.image = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      const html = defaultImage(tokens, idx, options, env, self);
      const caption = token.attrGet("title") || token.content;
      const inputPath = env?.page?.inputPath;
      const abs = inputPath && resolveImage(inputPath, token.attrGet("src"));
      const inGallery = abs && env?.gallery !== false && !env?.draft;
      const pic = inGallery ? `<a href="/gallery/${photoId(abs)}/">${html}</a>` : html;
      return `<figure class="post-figure">${pic}${caption ? `<figcaption>${md.utils.escapeHtml(caption)}</figcaption>` : ""}</figure>`;
    };
  });

  // A post that opens with a heading equal to its title (the imported posts do):
  // the layout already shows the title, so drop the heading instead of showing it twice.
  eleventyConfig.addPreprocessor("leading-title-heading", "md", (data, content) => {
    const m = /^\s*#{1,6}\s+(.+?)\s*#*\s*(\r?\n|$)/.exec(content);
    if (m && (!data.title || m[1] === data.title)) return content.slice(m[0].length);
  });

  // A <figure> is not allowed inside a <p>, so unwrap it.
  eleventyConfig.addTransform("unwrap-figures", (content, outputPath) => {
    if (!outputPath?.endsWith(".html")) return content;
    return content.replace(/<p>\s*(<figure class="post-figure">[\s\S]*?<\/figure>)\s*<\/p>/g, "$1");
  });

  // -------------------------------------------------------------------------
  // Gallery thumbnails and the large view on a photo's own page
  // -------------------------------------------------------------------------
  const imgOptions = (widths) => ({
    widths,
    formats: ["webp", "jpeg"],
    urlPath: "/img/",
    outputDir: "_site/img/",
  });

  eleventyConfig.addAsyncShortcode("galleryThumb", async (photo) => {
    const meta = await Image(photo.file, imgOptions([400, 800]));
    const jpg = meta.jpeg[meta.jpeg.length - 1];
    const ratio = (jpg.width / jpg.height).toFixed(4);
    const html = Image.generateHTML(meta, {
      alt: photo.caption || "",
      sizes: "(min-width: 900px) 25vw, 50vw",
      loading: "lazy",
      decoding: "async",
      "eleventy:ignore": "",
    });
    return `<a class="thumb" href="/gallery/${photo.id}/" style="--r:${ratio}" data-search="${photo.search.replace(/"/g, "&quot;")}" data-posts="${photo.posts.map((x) => x.url).join(" ")}" title="${(photo.caption || "").replace(/"/g, "&quot;")}">${html}</a>`;
  });

  // A plain cover picture (no link), used on the post cards of the home page
  eleventyConfig.addAsyncShortcode("coverImage", async (photo) => {
    const meta = await Image(photo.file, imgOptions([400, 800]));
    return Image.generateHTML(meta, {
      alt: "",
      sizes: "(min-width: 900px) 260px, 100vw",
      loading: "lazy",
      decoding: "async",
      "eleventy:ignore": "",
    });
  });

  eleventyConfig.addAsyncShortcode("photoLarge", async (photo) => {
    const meta = await Image(photo.file, imgOptions([960, 1600, 2400]));
    return Image.generateHTML(meta, {
      alt: photo.caption || "",
      sizes: "(min-width: 1100px) 1040px, 100vw",
      decoding: "async",
      "eleventy:ignore": "",
    });
  });

  // URL of the largest JPEG, used for the "full size" link and social previews
  eleventyConfig.addAsyncShortcode("photoFullUrl", async (photo) => {
    const meta = await Image(photo.file, imgOptions([2400]));
    return meta.jpeg[0].url;
  });

  // -------------------------------------------------------------------------
  // Filters
  // -------------------------------------------------------------------------
  eleventyConfig.addFilter("readableDate", (d) =>
    new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
  );
  eleventyConfig.addFilter("shortDate", (d) =>
    new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" })
  );
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));
  eleventyConfig.addFilter("year", (d) => new Date(d).getUTCFullYear());
  eleventyConfig.addFilter("groupByYear", (posts) => {
    const groups = [];
    for (const p of posts) {
      const y = new Date(p.date).getUTCFullYear();
      if (!groups.length || groups[groups.length - 1].year !== y) groups.push({ year: y, posts: [] });
      groups[groups.length - 1].posts.push(p);
    }
    return groups;
  });
  eleventyConfig.addFilter("photosOfPost", (photos, url) => photos.filter((p) => p.posts.some((x) => x.url === url)));
  eleventyConfig.addFilter("findPhoto", (photos, id) => photos.find((p) => p.id === id));
  eleventyConfig.addFilter("head", (arr, n) => (arr || []).slice(0, n));
  // Excerpt read straight from the Markdown file, so it never depends on build order
  eleventyConfig.addFilter("excerpt", (inputPath, words = 30) => {
    const text = fs.readFileSync(inputPath, "utf8")
      .replace(/^---[\s\S]*?\n---/, "")       // front matter
      .replace(/```[\s\S]*?```/g, " ")         // code blocks
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")   // pictures
      .replace(/<[^>]+>/g, " ")                // html
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links → their text
      .replace(/[#>*_`|]/g, " ")               // markdown symbols
      .replace(/\s+/g, " ").trim();
    const parts = text.split(" ");
    return parts.length > words ? parts.slice(0, words).join(" ") + "…" : text;
  });

  eleventyConfig.addGlobalData("currentYear", () => new Date().getFullYear());

  // -------------------------------------------------------------------------
  // Static files
  // -------------------------------------------------------------------------
  eleventyConfig.addPassthroughCopy({ [`${INPUT}/assets`]: "assets" });
  eleventyConfig.addWatchTarget(`${INPUT}/assets/`);

  return {
    dir: { input: INPUT, includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: false, // grandpa's Markdown is plain Markdown, never template code
    htmlTemplateEngine: "njk",
    pathPrefix: process.env.PATH_PREFIX || "/",
  };
}
