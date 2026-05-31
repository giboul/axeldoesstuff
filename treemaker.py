#!/usr/bin/env python
from pathlib import Path

start = Path(__file__)

template = Path("_index_template.html").read_text()

table_row = """
    <tr>
    <th><a class="icon {kind}" href="{path}">{txt}</a></th>
    </tr>
"""

def directory_repr(p: Path) -> str:
    print(f"{p = }")
    paths = list(p.glob("*"))
    directories = sorted([p for p in paths if p.is_dir() if p.stem[0] not in ["_", "."]])
    files = sorted([p for p in paths if p.is_file() if p.stem[0] not in ["_", "."]])
    txt = []
    for d in directories:
        print(f"\t{d = }")
        txt.append(table_row.format(kind="dir", txt=d.name, path=str(Path(d.stem)/"index.html")))
    for f in files:
        txt.append(table_row.format(kind="file", txt=f.name, path=f.name))
    return "\n".join(txt)

def write_index(rows, dir: Path):
    base = Path()
    for _ in dir.parents:
        base = base / ".."
    Path(dir/"index.html").write_text(template.format(
        style=str(base / "style.css"),
        title=str(Path().absolute()),
        headers="",
        rows=rows
    ))

def explore(path=Path()):
    rows = directory_repr(path)
    write_index(rows, path)
    for d in path.glob("*"):
        if d.is_dir() and d.stem[0] != ".":
            explore(d)


if __name__ == "__main__":
    explore()
