// Settings shared by every post in this folder, so posts only need a title and a date.
export default {
  layout: "layouts/post.njk",
  // A post with `draft: true` is not published at all.
  permalink: (data) => (data.draft ? false : `/blog/${data.page.fileSlug}/`),
  eleventyExcludeFromCollections: (data) => !!data.draft,
};
