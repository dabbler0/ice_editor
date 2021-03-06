// Generated by CoffeeScript 1.6.3
(function() {
  var fitsAwait, op, sub;

  sub = ICE.sub;

  op = function(order, template) {
    return ICE.op(order, template, (function() {
      var first, last;
      first = new ICE.IceStaticSegment('(');
      last = new ICE.IceStaticSegment(')');
      this.children.unshift(first);
      return this.children.push(last);
    }), (function() {
      this.children.shift();
      return this.children.pop();
    }), function(block) {
      console.log('I was called...');
      if (block.children().first().data('ice_tree') !== this.children[0]) {
        if (this.parenWrapped) {
          return block.prepend(this.children[0].blockify()).append(this.children[this.children.length - 1].blockify());
        } else {
          block.children().first().remove();
          return block.children().last().remove();
        }
      }
    });
  };

  fitsAwait = function(node) {
    return node.variable.base.value === 'await' && node.args.length === 1 && node.args[0].constructor.name === 'Call' && node.args[0].args.length === 1 && node.args[0].args[0].constructor.name === 'Call' && node.args[0].args[0].variable.base.constructor.name === 'Literal' && node.args[0].args[0].variable.base.value === 'defer';
  };

  $.ajax({
    url: 'coffee.frost',
    success: function(frosting) {
      var argIf, blockify, coffee, i, operator, operator_block, operator_order, operator_preorder, operators, reserved, special_functions, _i, _j, _len, _len1;
      coffee = ICE.frosting(frosting);
      window.coffee = coffee.categories;
      coffee = coffee.all;
      argIf = function(template, name) {
        return function(args) {
          if (args.length === 1) {
            return sub(template, args[0]);
          } else {
            return sub(coffee.CALL, name, args);
          }
        };
      };
      operators = {
        '+': coffee.ADD,
        '-': coffee.SUB,
        '*': coffee.MUL,
        '/': coffee.DIV,
        '&&': coffee.AND,
        '||': coffee.OR,
        '===': coffee.IS,
        '!==': coffee.ISNT,
        '!': coffee.NOT,
        '>': coffee.GREATER,
        '<': coffee.LESSER
      };
      operator_preorder = [['!'], ['*', '/'], ['+', '-'], ['>', '<'], ['===', '!==='], ['&&', '||']];
      operator_order = {};
      for (i = _i = 0, _len = operator_preorder.length; _i < _len; i = ++_i) {
        operator_block = operator_preorder[i];
        for (_j = 0, _len1 = operator_block.length; _j < _len1; _j++) {
          operator = operator_block[_j];
          operator_order[operator] = i;
        }
      }
      reserved = {
        'return': coffee.RETURN_VOID,
        'break': coffee.BREAK,
        'lastmousemove': coffee.LASTMOUSEMOVE
      };
      special_functions = {
        'write': argIf(coffee.WRITE, 'write'),
        'random': argIf(coffee.RANDOM, 'random'),
        'fd': argIf(coffee.FD, 'fd'),
        'bk': argIf(coffee.BK, 'bk'),
        'sin': argIf(coffee.SIN, 'sin'),
        'cos': argIf(coffee.COS, 'cos'),
        'speed': argIf(coffee.SPEED, 'speed'),
        'tick': function(args) {
          if (args.length === 2) {
            return sub(coffee.TICK, args[0], args[1]);
          } else {
            return sub(coffee.CALL, 'tick', args[0]);
          }
        },
        'moveto': function(args) {
          switch (args.length) {
            case 1:
              return sub(coffee.MOVETO_ONEARG, args[0]);
            case 2:
              return sub(coffee.MOVETO, args[0], args[1]);
            default:
              return sub(coffee.CALL, 'moveto', args);
          }
        },
        'rt': function(args) {
          switch (args.length) {
            case 1:
              return sub(coffee.RT, args[0]);
            case 2:
              return sub(coffee.RT_ARC, args[0], args[1]);
            default:
              return sub(coffee.CALL, 'rt', args);
          }
        },
        'lt': function(args) {
          switch (args.length) {
            case 1:
              return sub(coffee.LT, args[0]);
            case 2:
              return sub(coffee.LT_ARC, args[0], args[1]);
            default:
              return sub(coffee.CALL, 'lt', args);
          }
        },
        'pen': function(args) {
          switch (args.length) {
            case 1:
              return sub(coffee.PEN, args[0]);
            case 2:
              return sub(coffee.PEN_THICK, args[0], args[1]);
            default:
              return sub(coffee.CALL, 'pen', args);
          }
        },
        'dot': function(args) {
          switch (args.length) {
            case 1:
              return sub(coffee.DOT, args[0]);
            case 2:
              return sub(coffee.DOT_SIZE, args[0], args[1]);
            default:
              return sub(coffee.CALL, 'dot', args);
          }
        }
      };
      blockify = function(node) {
        var arg, child, expr, new_block, object, param, property, variable, _k, _l, _len2, _len3, _ref, _ref1;
        switch (node.constructor.name) {
          case 'Block':
            new_block = new ICE.IceBlockSegment();
            _ref = node.expressions;
            for (_k = 0, _len2 = _ref.length; _k < _len2; _k++) {
              expr = _ref[_k];
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
                var _l, _len3, _ref1, _results;
                _ref1 = node.args;
                _results = [];
                for (_l = 0, _len3 = _ref1.length; _l < _len3; _l++) {
                  arg = _ref1[_l];
                  _results.push(blockify(arg));
                }
                return _results;
              })());
            } else if (fitsAwait(node)) {
              if (node.args[0].args[0].args.length > 0) {
                return sub(coffee.AWAIT_DEFER_VAR, blockify(node.args[0].variable), blockify(node.args[0].args[0].args[0]));
              } else {
                return sub(coffee.AWAIT_DEFER, blockify(node.args[0].variable));
              }
            } else {
              return sub(coffee.CALL, blockify(node.variable), (function() {
                var _l, _len3, _ref1, _results;
                _ref1 = node.args;
                _results = [];
                for (_l = 0, _len3 = _ref1.length; _l < _len3; _l++) {
                  arg = _ref1[_l];
                  _results.push(blockify(arg));
                }
                return _results;
              })());
            }
            break;
          case 'Code':
            return sub(coffee.DEFUN, (function() {
              var _l, _len3, _ref1, _results;
              _ref1 = node.params;
              _results = [];
              for (_l = 0, _len3 = _ref1.length; _l < _len3; _l++) {
                param = _ref1[_l];
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
                return sub(coffee.REPEAT, blockify(node.source.to), blockify(node.body));
            }
            break;
          case 'While':
            return sub(coffee.WHILE, blockify(node.condition), blockify(node.body));
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
            if ((node.second == null) && node.operator === '-') {
              return op(0, sub(coffee.NEGATIVE, blockify(node.first)));
            } else if (node.second != null) {
              return op(operator_order[node.operator], sub(operators[node.operator], blockify(node.first), blockify(node.second)));
            } else {
              return op(operator_order[node.operator], sub(operators[node.operator], blockify(node.first)));
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
              var _l, _len3, _ref1, _results;
              _ref1 = node.objects;
              _results = [];
              for (_l = 0, _len3 = _ref1.length; _l < _len3; _l++) {
                object = _ref1[_l];
                _results.push(blockify(object));
              }
              return _results;
            })());
          case 'Obj':
            new_block = new ICE.IceBlockSegment();
            _ref1 = node.properties;
            for (_l = 0, _len3 = _ref1.length; _l < _len3; _l++) {
              property = _ref1[_l];
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
