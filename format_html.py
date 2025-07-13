from pathlib import Path

root = Path(__file__).parent

html_files = root.glob("**/[!_]*.html")
footer = (root / "_footer.html").read_text()
header = (root / "_header.html").read_text()

def replace_tag_content(string: str, substring: str, tag_name: str) -> str:
    start = string.find(f"<{tag_name}>")
    if start != -1:
        end = string.find(f"</{tag_name}>", start)
        return string[:start] + substring + string[end+len(f"</{tag_name}>"):]
    return string

for file_path in html_files:
    txt = file_path.read_text()
    txt = replace_tag_content(txt, header, "head")
    txt = replace_tag_content(txt, footer, "footer")
    print(f"#### {file_path.stem} ###")
    print(txt)
    file_path.write_text(txt)
