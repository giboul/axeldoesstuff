from pathlib import Path

from unidecode import unidecode

old = Path("old")
out = Path("src") / "blog"

SRC = old / "gibbluss.md"
md = SRC.read_text().split("##")

direcs = []

for post in md[2:]:
    directory = out / Path("".join(
        i for i in unidecode(post.split("\n")[0])
        if i not in "\\/:*?<>|' -,() \"."
    ))
    i1 = post.find("](")
    i2 = i1 + post[i1:].find(")")
    img_path = post[i1+2:i2]
    post = post.replace(post[i1+2:i2], Path(img_path).name)
    img_path = img_path[img_path.find("/")+1:]
    img_filename = img_path[img_path.find("/")+1:]
    print(f"{old / img_path} => {directory / img_filename}")
    if False:
        if directory.stem in direcs:
            raise ValueError(
                f"{post.split("\n")[0]} : {direcs[direcs.index(directory.stem)]}"
            )
        direcs.append(directory.stem)
    else:
        directory.mkdir(exist_ok=True)
        # directory.mkdir(exist_ok=False)
        (directory / "index.md").write_text("##" + post)
        (directory / img_filename).write_bytes((old / img_path).read_bytes())
