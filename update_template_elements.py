#!/usr/bin/env python
from pathlib import Path
import bs4

root = Path(__file__).parent
parser = "html.parser"

html_files = root.glob("**/[!_]*.html")
head = (root / "_header.html").read_text()
footer = (root / "_footer.html").read_text()
nav = (root / "_nav.html").read_text()

def replace_tag_content(string: str, substring: str, full_tag: str) -> str:
    tag_name = full_tag.split(" ")[0]
    start = string.find(f"<{full_tag}>")
    if start != -1:
        end = string.find(f"</{tag_name}>", start)
        return string[:start] + substring + string[end+len(f"</{tag_name}>"):]
    return string

for file_path in html_files:
    # print(f"### {file_path.stem}")
    txt = file_path.read_text()
    txt = replace_tag_content(txt, head, "head")
    txt = replace_tag_content(txt, footer, "footer")
    txt = replace_tag_content(txt, nav, 'nav class="header"')
    # print(f"#### {file_path.stem} ###")
    # print(txt)
    # file_path.write_text(txt)
    file_path.write_text(bs4.BeautifulSoup(txt, parser).prettify())
