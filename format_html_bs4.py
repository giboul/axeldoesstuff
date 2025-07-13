from pathlib import Path
import bs4

parser = "html.parser"
root = Path(__file__).parent

html_files = root.glob("**/[!_]*.html")
header = bs4.BeautifulSoup((root / "_header.html").read_text(), parser)
footer = bs4.BeautifulSoup((root / "_footer.html").read_text(), parser)

for file_path in html_files:
    txt = file_path.read_text()
    bs = bs4.BeautifulSoup(txt)
    head = bs.find("meta")
    print(head)
    print(bs.prettify())
