#!/usr/bin/env python
from pathlib import Path
from bs4 import BeautifulSoup
from urllib import request


parges_url_template = "https://gibblus.blog4ever.com/photos?page=%i"

def get_image_description(url):
    req = request.Request(url)
    req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:106.0) Gecko/20100101 Firefox/106.0')
    req.add_header('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8')
    req.add_header('Accept-Language', 'en-US,en;q=0.5')
    soup = BeautifulSoup(request.urlopen(req).read().decode('UTF-8'), "html.parser")
    picture_element = [e for e in soup.find_all("img")if e.has_attr("data-src")][0]
    description_element = soup.find(attrs={"class": "centre photos_index_photo_desc"})
    return picture_element.attrs["data-src"], description_element.text if hasattr(description_element, "text") else ""

n = 287
data = []
for i in range(1, n+1):
    print(f"\rReading page {i}/{n} ({i/n:.0%})", end="")
    data.append(get_image_description(parges_url_template % i))
print()

save_dir = Path("gibblus")
for i, (pic_url, descr) in enumerate(data):
    print(f"\rReading page {i}/{n} ({i/n:.0%})", end="")
    (save_dir / "images" / f"img{i:0>5}.jpeg").write_bytes(request.urlopen(pic_url).read())
    (save_dir / "descriptions" / f"descr{i:0>5}.txt").write_text(descr)
