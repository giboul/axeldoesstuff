# Photo blog

A Markdown blog with a gallery that builds itself from the pictures used in the posts. Eleventy 3, no CSS framework, no client-side framework.

```
npm install
npm start        # local preview at http://localhost:8080, rebuilds on save
npm run build    # production build into _site/
```

## How it fits together

```
src/
  blog/                     ← the only folder the author touches
    2026-06-14-some-walk/
      index.md              ← title, date, tags + Markdown
      lake.jpg              ← pictures sit next to the text
    2026-11-01-text-only.md ← a post can also be a single file
    blog.11tydata.js        ← layout + URL for every post (/blog/some-walk/)
  pages/                    ← home, blog index, gallery, one page per photo
  _data/site.js             ← site title, author, comments settings
  _includes/                ← layouts and the comments partial
  assets/style.css          ← all the styling (colours at the top)
eleventy.config.js          ← the gallery logic
HOW-TO-WRITE-A-POST.md      ← plain-language guide for the author
```

**The blog is the source, the gallery is derived.** `eleventy.config.js` reads every post, finds each `![caption](file.jpg)` (and `<img>`), and builds a `photos` collection:

- A photo's id is a hash of the file *contents*, so the same picture copied into two folders, or referenced from another post with `../other-post/x.jpg`, is one gallery photo that lists every post it appears in.
- A photo is dated by the first post that used it. Its tags are the union of those posts' tags.
- The caption is the image's title (`"…"`) if given, otherwise its alt text.
- `gallery: false` in a post's front matter keeps its pictures out of the gallery; `draft: true` hides the post entirely.

**Images**: originals are never copied to the output. Eleventy Image makes WebP + JPEG versions at several widths (`_site/img/`). Pictures in posts go through the image transform plugin; gallery thumbnails and photo pages use the `galleryThumb` / `photoLarge` shortcodes.

**Posts link to the gallery**: a picture in a post becomes a `<figure>` with its caption, linking to the photo's page (`/gallery/<id>/`), which links back to every post that uses it, with previous/next arrows (keyboard ← → and Esc work too).

**Search**: the gallery search is instant and runs in the browser. Each thumbnail carries its caption, the titles and full text of the posts it appears in, tags, year and month, and the box matches all typed words. The topic buttons toggle a tag in the box, and the query is kept in the URL (`/gallery/?q=lake`), so tags on posts link straight to a filtered gallery.

## Comments

Set `comments.provider` in `src/_data/site.js`:

| provider | Who can comment | What you need |
|---|---|---|
| `cusdis` | Anyone, no account. You approve each comment first. | A free account on cusdis.com (or self-host), then paste the app id. |
| `giscus` | People with a GitHub account. | A public GitHub repo with Discussions on; fill in the ids from giscus.app. |
| `isso` | Anyone, no account. | A small Isso server you run yourself. |
| `none` | Nobody (default). | — |

For a family audience, `cusdis` is the easiest: no accounts for readers, and nothing gets published without your approval. Add `comments: false` to a post to turn them off just there.

## Deploying

`npm run build` and publish `_site/`. Netlify, Cloudflare Pages and GitHub Pages all work with build command `npm run build` and output folder `_site`. Set `site.url` in `src/_data/site.js` to the real address.
