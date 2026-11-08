import re
from pathlib import Path

from unidecode import unidecode

old = Path("old")
out = Path("src") / "blog"

SRC = old / "gibbluss.md"
md = SRC.read_text().split("##")

direcs = []

IMG_RE = re.compile(r"!\[([^\]]*)\]\(([^)\s]+)\)")

for post in md[2:]:
    directory = out / Path("".join(
        i for i in unidecode(post.split("\n")[0])
        if i not in "\\/:*?<>|' -,() \"."
    ))
    # (source path relative to `old`, filename in the post directory)
    images = []

    def relink(match):
        alt, img_path = match.group(1), match.group(2)
        img_path = img_path[img_path.find("/")+1:]  # drop leading "gibblus/"
        img_filename = Path(img_path).name
        images.append((img_path, img_filename))
        print(f"{old / img_path} => {directory / img_filename}")
        return f"![{alt}]({img_filename})"

    post = IMG_RE.sub(relink, post)
    if False:
        if directory.stem in direcs:
            newline = '\n'
            raise ValueError(
                f"{post.split(newline)[0]} : {direcs[direcs.index(directory.stem)]}"
            )
        direcs.append(directory.stem)
    else:
        directory.mkdir(exist_ok=True)
        # directory.mkdir(exist_ok=False)
        (directory / "index.md").write_text("##" + post)
        for img_path, img_filename in images:
            (directory / img_filename).write_bytes((old / img_path).read_bytes())
