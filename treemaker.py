from pathlib import Path

start = Path(__file__)

"""<!DOCTYPE html>"""

table_template = """
<table><thead><tr>{headers}</tr></thead><tbody>{rows}</tbody></table>
"""[1:-1]

def directory(p: Path) -> str:
    headers = """
    <th>
        <a class="directory" href={p.stem}>
    </th>\n"""
    rows = """
    <tr>
        Hallo
    </tr>\n"""
    return table_template.format(headers=headers, rows=rows)

print(directory(Path()))