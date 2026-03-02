.PHONY: all

FILE ?= test

html:
	python update_template_elements.py

MD_FLAGS += --toc
MD_FLAGS += -i $(FILE).md
MD_FLAGS += -o $(FILE).html
MD_FLAGS += --template _template.html
MD_FLAGS += --css style.css
MD_FLAGS += -A _footer.html
MD_FLAGS += -B _nav.html
MD_FLAGS += -V toc-title:"Table des matières"

md:
	pandoc $(MD_FLAGS)
