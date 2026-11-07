# How to write a post

Everything lives in the folder **`src/blog`**. Each post is one folder.

## 1. Make a folder

Name it with the date, then a few words, using small letters and dashes:

```
src/blog/2026-12-24-christmas-eve/
```

## 2. Put your photos in it

Copy the pictures straight from the camera or phone into that folder.
Give them simple names: small letters, no spaces.

```
src/blog/2026-12-24-christmas-eve/tree.jpg
src/blog/2026-12-24-christmas-eve/table.jpg
```

They can be big. The website makes smaller copies by itself.

## 3. Write the text

In the same folder, make a text file called **`index.md`** and start it like this:

```
---
title: Christmas Eve
date: 2026-12-24
tags: [family, winter]
---

We decorated the tree in the afternoon.

![The tree, finished at last](tree.jpg)

Dinner was ready at seven.

![The table before everyone arrived](table.jpg)
```

- The part between the two `---` lines is the title, the date and some topic words (tags). Keep the lines exactly like this.
- Write normally underneath. Leave an empty line between paragraphs.
- To show a photo: `![what is in the picture](file-name.jpg)`. The words in the square brackets become the caption under the photo. The gallery search looks at the caption and at all the text of the post, so a name written in the paragraph under a photo is found too.

That's all. Every photo you show in a post also appears in the **Gallery**.

## A few handy extras

| You want…                              | Write this                                  |
|----------------------------------------|---------------------------------------------|
| **bold** words                          | `**bold**`                                  |
| *slanted* words                         | `*slanted*`                                 |
| a link                                  | `[the shop](https://example.com)`           |
| a photo from an older post              | `![Caption](../2026-06-14-a-walk-along-the-lake/lake.jpg)` |
| to keep a post's photos out of the gallery | add `gallery: false` under the date      |
| to hide a post while writing it        | add `draft: true` under the date            |

A photo used in two posts (or even copied into two folders) only appears once in the gallery, with links to both posts.
