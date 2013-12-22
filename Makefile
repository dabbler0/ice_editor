all:
	coffee -cm ice/coffee.coffee
	coffee -cm ice/ice.coffee 
	coffee -cm example.coffee
	cat ice/coffee.js ice/ice.js example.js > ex.js
	uglifyjs ex.js > ex.min.js
	git checkout gh-pages
	git checkout master ex.min.js
	git checkout master
