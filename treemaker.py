from pathlib import Path

start = Path(__file__)

template = Path("_index_template.html").read_text()

table_row = """
    <tr>
    <th><a class="icon {kind}" href="{path}">{txt}</a></th>
    </tr>
"""

def directory_repr(p: Path) -> str:
    paths = list(p.glob("*"))
    directories = [p for p in paths if p.is_dir()]
    files = [p for p in paths if p.is_file()]
    txt = []
    for d in directories:
        txt.append(table_row.format(kind="dir", txt=d.name, path=str(d/"index.html")))
    for f in files:
        txt.append(table_row.format(kind="file", txt=f.name, path=str(d)))
    return "\n".join(txt)

rows = directory_repr(Path())

def write_index(dir: Path, base=None):
    base = base or dir
    Path(dir/"index.html").write_text(template.format(
        base=str(base),
        title=str(Path().absolute()),
        headers="",
        rows=rows
    ))
    # # Recursive
    # for d in [d for d in dir.glob("*") if d.is_dir()]:
    #     write_index(d, base=base/"..")

write_index(Path("."))