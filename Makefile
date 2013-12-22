all:
	coffee -cm ice/coffee.coffee
	coffee -cm ice/ice.coffee 
	coffee -cm example.coffee
	cat ice/coffee.js ice/ice.js example.js > ex.js
	uglifyjs ex.js > ex.min.js
	git checkout ex.min.js gh-pages
