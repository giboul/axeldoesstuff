.PHONY: all

FILE ?= test
OUT ?= $(FILE)

MD_FLAGS += --toc
MD_FLAGS += -i $(FILE).md
MD_FLAGS += -o $(FILE).html
MD_FLAGS += --template template/_template.html
MD_FLAGS += --css style.css
MD_FLAGS += -A template/_footer.html
MD_FLAGS += -B template/_nav.html
MD_FLAGS += -V toc-title:"Table des matières"

FLAGS ?= 

md:
	pandoc $(FLAGS) $(MD_FLAGS)

index:
	python treemaker.py

html:
	python update_template_elements.py

all:
	make md
	make index
	make html