// Generated by CoffeeScript 1.6.3
(function() {
  var fitsAwait, sub;

  sub = ICE.sub;

  fitsAwait = function(node) {
    return node.variable.base.value === 'await' && node.args.length === 1 && node.args[0].constructor.name === 'Call' && node.args[0].args.length === 1 && node.args[0].args[0].constructor.name === 'Call' && node.args[0].args[0].variable.base.value === 'defer';
  };

  $.ajax({
    url: 'coffee.frost',
    success: function(frosting) {
      var blockify, coffee, operators, reserved, special_functions;
      coffee = ICE.frosting(frosting);
      window.coffee = coffee.categories;
      coffee = coffee.all;
      console.log(coffee);
      operators = {
        '+': coffee.ADD,
        '-': coffee.SUB,
        '*': coffee.MUL,
        '/': coffee.DIV,
        '&&': coffee.AND,
        '||': coffee.OR,
        '===': coffee.IS,
        '!==': coffee.ISNT,
        '!': coffee.NOT
      };
      reserved = {
        'return': coffee.RETURN_VOID,
        'break': coffee.BREAK
      };
      special_functions = {
        'write': function(args) {
          if (args.length === 1) {
            return sub(coffee.WRITE, args[0]);
          } else {
            return sub(coffee.CALL, 'write', args);
          }
        },
        'random': function(args) {
          if (args.length === 1) {
            return sub(coffee.RANDOM, args[0]);
          } else {
            return sub(coffee.CALL, 'write', args);
          }
        }
      };
      blockify = function(node) {
        var arg, child, expr, new_block, object, param, property, variable, _i, _j, _len, _len1, _ref, _ref1;
        switch (node.constructor.name) {
          case 'Block':
            new_block = new ICE.IceBlockSegment();
            _ref = node.expressions;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              expr = _ref[_i];
              child = blockify(expr);
              child.parent = new_block;
              new_block.children.push(child);
            }
            return new_block;
          case 'Value':
            if (node.properties.length > 0) {
              switch (node.properties[0].constructor.name) {
                case 'Access':
                  return sub(coffee.ACCESS, blockify(node.base), blockify(node.properties[0].name));
                case 'Index':
                  return sub(coffee.INDEX, blockify(node.base), blockify(node.properties[0].index));
              }
            } else {
              return blockify(node.base);
            }
            break;
          case 'Literal':
            if (node.value in reserved) {
              return sub(reserved[node.value]);
            } else {
              return node.value;
            }
            break;
          case 'Call':
            variable = blockify(node.variable);
            if (variable in special_functions) {
              return special_functions[variable]((function() {
                var _j, _len1, _ref1, _results;
                _ref1 = node.args;
                _results = [];
                for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                  arg = _ref1[_j];
                  _results.push(blockify(arg));
                }
                return _results;
              })());
            } else if (fitsAwait(node)) {
              return sub(coffee.AWAIT, blockify(node.args[0].variable), blockify(node.args[0].args[0].args[0]));
            } else {
              return sub(coffee.CALL, blockify(node.variable), (function() {
                var _j, _len1, _ref1, _results;
                _ref1 = node.args;
                _results = [];
                for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                  arg = _ref1[_j];
                  _results.push(blockify(arg));
                }
                return _results;
              })());
            }
            break;
          case 'Code':
            return sub(coffee.DEFUN, (function() {
              var _j, _len1, _ref1, _results;
              _ref1 = node.params;
              _results = [];
              for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                param = _ref1[_j];
                _results.push(blockify(param));
              }
              return _results;
            })(), blockify(node.body));
          case 'Param':
            return blockify(node.name);
          case 'Assign':
            switch (node.context) {
              case 'object':
                return sub(coffee.DEF_PROPERTY, blockify(node.variable), blockify(node.value));
              case '+=':
                return sub(coffee.VAR_ADD, blockify(node.variable), blockify(node.value));
              case '-=':
                return sub(coffee.VAR_SUB, blockify(node.variable), blockify(node.value));
              case '*=':
                return sub(coffee.VAR_MUL, blockify(node.variable), blockify(node.value));
              case '/=':
                return sub(coffee.VAR_DIV, blockify(node.variable), blockify(node.value));
              default:
                return sub(coffee.DEF_VARIABLE, blockify(node.variable), blockify(node.value));
            }
            break;
          case 'For':
            switch (false) {
              case !node.object:
                return sub(coffee.FOR_OF, blockify(node.index), blockify(node.source), blockify(node.body));
              case !node.index:
                return sub(coffee.FOR_IN_INDEX, blockify(node.name), blockify(node.index), blockify(node.source), blockify(node.body));
              case !node.name:
                return sub(coffee.FOR_IN, blockify(node.name), blockify(node.source), blockify(node.body));
              default:
                return sub(coffee.REPEAT, blockify(node.index), blockify(node.source), blockify(node.body));
            }
            break;
          case 'Range':
            if (node.exclusive) {
              return sub(coffee.EXCLUSIVE_RANGE, blockify(node.from), blockify(node.to));
            } else {
              return sub(coffee.INCLUSIVE_RANGE, blockify(node.from), blockify(node.to));
            }
            break;
          case 'Parens':
            return sub(coffee.PARENS, blockify(node.body.unwrap()));
          case 'Op':
            if (node.second != null) {
              return sub(operators[node.operator], blockify(node.first), blockify(node.second));
            } else {
              return sub(operators[node.operator], blockify(node.first));
            }
            break;
          case 'If':
            if (node.elseBody != null) {
              return sub(coffee.IF_ELSE, blockify(node.condition), blockify(node.body), blockify(node.elseBody));
            } else {
              return sub(coffee.IF, blockify(node.condition), blockify(node.body));
            }
            break;
          case 'Arr':
            return sub(coffee.ARRAY, (function() {
              var _j, _len1, _ref1, _results;
              _ref1 = node.objects;
              _results = [];
              for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                object = _ref1[_j];
                _results.push(blockify(object));
              }
              return _results;
            })());
          case 'Obj':
            new_block = new ICE.IceBlockSegment();
            _ref1 = node.properties;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              property = _ref1[_j];
              new_block.children.push(blockify(property));
            }
            return sub(coffee.OBJECT, new_block);
          case 'Return':
            return sub(coffee.RETURN, blockify(node.expression));
          case 'Bool':
            return node.val;
          case 'Existence':
            return sub(coffee.EXISTENCE, blockify(node.expression));
          default:
            console.log('dunno', node);
            return new ICE.IceStaticSegment('unknown construct');
        }
      };
      return window.coffee_blockify = function(string) {
        return blockify(CoffeeScript.nodes(string));
      };
    }
  });

}).call(this);

/*
//@ sourceMappingURL=coffee.map
*/
