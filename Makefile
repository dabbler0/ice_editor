all: ice example doc

ice:
	coffee -c ice/ice.coffee
example:
	coffee -c example.coffee
doc:
	markdown README.md > README.html
