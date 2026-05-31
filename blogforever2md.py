from pathlib import Path

template = (
"""
### {title}

![]({path})

{description}

"""
)

images = list(sorted((Path("gibblus") / "images").glob("*.jpeg")))
descriptions = list(sorted((Path("gibblus") / "descriptions").glob("*.txt")))

txt = ""

for im, dr in zip(images, descriptions):
    title, *dr = dr.read_text().split(":")
    txt += template.format(path=im, title=title.strip(), description=" : ".join(dr).replace("\n", " ").strip())


txt = "# Receuil du blog de Rolland Giboulot" + txt

Path("gibbluss.md").write_text(txt)
