.PHONY: all

FILE ?= test

html:
	python update_template_elements.py

md:
	pandoc -i $(FILE).md -o $(FILE).html --toc --template _template.html --css style.css -A _footer.html -B _nav.html
