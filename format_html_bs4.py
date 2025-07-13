from pathlib import Path
import bs4

parser = "html.parser"
root = Path(__file__).parent

html_files = root.glob("**/[!_]*.html")
head = (root / "_header.html").read_text()
footer = (root / "_footer.html").read_text()
navigator = (root / "_nav.html").read_text()
print(head)
print(footer)
print(navigator)

def replace_tag_content(bs: bs4.BeautifulSoup,
                        content: str,
                        tag_name: str,
                        attrs: dict = None) -> None:
    bs_nav = bs.find(tag_name, attrs=attrs)
    if bs_nav is not None:
        bs_nav.replace_with(content)


for file_path in html_files:
    print(f"### {file_path.stem}")
    txt = file_path.read_text()
    bs = bs4.BeautifulSoup(txt, parser)
    replace_tag_content(bs, head, "head")
    replace_tag_content(bs, navigator, "nav", attrs={"class":"header"})
    replace_tag_content(bs, footer, "footer")
    print(bs.prettify())
