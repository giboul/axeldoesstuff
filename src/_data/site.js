// ---------------------------------------------------------------------------
// Site settings. This is the only file you need to edit to personalise the site.
// ---------------------------------------------------------------------------
export default {
  title: "The Family Album",
  author: "Grandpa",
  description: "Walks, gardens and the odd adventure, in words and pictures.",
  url: "https://giboul.github.io/axeldoesstuff", // the address of the site online
  language: "en",

  // ---- Comments ---------------------------------------------------------
  // provider: "none" | "cusdis" | "giscus" | "isso"
  //   cusdis : anyone can comment, no account needed; you approve each comment first.
  //            Free hosted plan at cusdis.com, or host it yourself.
  //   giscus : comments are stored in GitHub Discussions; readers need a GitHub account.
  //   isso   : anyone can comment; you run a small Isso server yourself.
  comments: {
    provider: "none",
    cusdis: { host: "https://cusdis.com", appId: "" },
    giscus: { repo: "", repoId: "", category: "Comments", categoryId: "" },
    isso: { server: "" }, // e.g. "https://comments.example.com"
  },
};
