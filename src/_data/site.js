// ---------------------------------------------------------------------------
// Site settings. This is the only file you need to edit to personalise the site.
// ---------------------------------------------------------------------------
export default {
  title: "Blog de la famille Giboulot",
  author: "Roland Giboulot",
  description: `Tout le contenu de ce blog est tiré du blog de Roland Giboulot.

https://gibblus.blog4ever.com/photos

Ce site est maintenu par Axel Giboulot.

+41 78 347 27 87

axelgibtt@gmail.com

Site construit avec 11ty et calqué sur https://twcarty.netlify.app/photos/.`,
  url: "https://giboul.github.io/axeldoesstuff", // the address of the site online
  language: "fr",

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
