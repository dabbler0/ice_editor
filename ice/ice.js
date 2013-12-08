// Generated by CoffeeScript 1.6.3
/*
Copyright (c) 2013 Anthony Bau

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/


(function() {
  var IceBlockSegment, IceEditor, IceHandwrittenSegment, IceInlineSegment, IceSegment, IceStatement, IceStaticSegment, blockify, coffee_operators, coffee_reserved, corners, defrost, genPosData, moveSegment, overlap,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  moveSegment = function(mobile, target) {
    var child, last_child, _i, _len, _ref;
    if ((mobile.is_selected_wrapper != null) && mobile.is_selected_wrapper) {
      last_child = target;
      _ref = mobile.elements;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        moveSegment(child, last_child);
        last_child = child;
      }
      return;
    }
    if (mobile.parent != null) {
      if (mobile.parent.type === 'block') {
        mobile.parent.children.splice(mobile.parent.children.indexOf(mobile), 1);
        mobile.parent.droppable = true;
      } else {
        mobile.parent.children.length = 0;
        mobile.parent.droppable = true;
      }
    }
    if (target != null) {
      if (target.type === 'block') {
        target.children.unshift(mobile);
        target.droppable = mobile.droppable = true;
        return mobile.parent = target;
      } else if (target.type === 'statement' && (target.parent != null)) {
        target.parent.children.splice(target.parent.children.indexOf(target) + 1, 0, mobile);
        target.droppable = mobile.droppable = true;
        return mobile.parent = target.parent;
      } else if (target.type === 'inline') {
        target.children = [mobile];
        target.droppable = mobile.droppable = false;
        return mobile.parent = target;
      }
    }
  };

  IceSegment = (function() {
    function IceSegment() {
      this.parent = null;
      this.index = 0;
      this.children = [];
      this.type = null;
    }

    IceSegment.prototype._reconstruct = function() {
      return new IceSegment();
    };

    IceSegment.prototype.stringify = function() {
      var child, string, _i, _len, _ref;
      string = '';
      _ref = this.children;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        if (typeof child === 'string') {
          string += child;
        } else {
          string += child.stringify();
        }
      }
      return string;
    };

    IceSegment.prototype.clone = function() {
      var child, child_clone, copy, _i, _len, _ref;
      copy = this._reconstruct();
      copy.type = this.type;
      copy.children = [];
      _ref = this.children;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        if (typeof child === 'string' || child.constructor.name === 'String') {
          copy.children.push(child);
        } else {
          child_clone = child.clone();
          child_clone.parent = copy;
          copy.children.push(child_clone);
        }
      }
      if (this.droppable != null) {
        copy.droppable = this.droppable;
      }
      return copy;
    };

    IceSegment.prototype.templateify = function() {
      var block, new_block, segment;
      block = this.blockify();
      segment = this;
      new_block = null;
      block.on('dragstart', function() {
        var clone;
        clone = segment.clone();
        new_block = clone.templateify();
        new_block.hide();
        block.after(new_block);
        return block.unbind('dragstart');
      });
      return block.on('dragstop', function() {
        if ((segment.parent != null) || block.parent().length === 0) {
          new_block.show();
          return block.unbind('dragstop');
        }
      });
    };

    return IceSegment;

  })();

  IceStaticSegment = (function(_super) {
    __extends(IceStaticSegment, _super);

    function IceStaticSegment(text) {
      this.parent = null;
      this.index = 0;
      this.children = [text];
      this.type = 'static';
    }

    IceStaticSegment.prototype._reconstruct = function() {
      return new IceStaticSegment();
    };

    IceStaticSegment.prototype.blockify = function() {
      var block, child, _i, _len, _ref;
      block = $('<span>');
      block.addClass('ice_segment');
      block.addClass('ice_' + this.type);
      _ref = this.children;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        if (typeof child === 'string' || child.constructor.name === 'String') {
          block.append(child);
        } else {
          block.append(child.blockify());
        }
      }
      return block;
    };

    return IceStaticSegment;

  })(IceSegment);

  IceInlineSegment = (function(_super) {
    __extends(IceInlineSegment, _super);

    function IceInlineSegment(accept) {
      this.parent = null;
      this.index = 0;
      this.children = [];
      this.type = 'inline';
      this.accept = accept;
      this.droppable = true;
    }

    IceInlineSegment.prototype._reconstruct = function() {
      return new IceInlineSegment(this.accept);
    };

    IceInlineSegment.prototype.blockify = function() {
      var big_wrapper, block, checkHeight, child, input, segment, _i, _len, _ref;
      segment = this;
      block = $('<span>');
      block.addClass('ice_segment');
      block.addClass('ice_' + this.type);
      _ref = this.children;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        if (typeof child !== 'string' && child.constructor.name !== 'String') {
          block.append(child.blockify());
        }
      }
      block.data('ice_tree', segment);
      input = $("<input>");
      input.addClass("ice_input");
      if (typeof this.children[0] === 'string') {
        input.val(this.children[0]);
      }
      input.keyup(function() {
        if (segment.droppable) {
          return segment.children[0] = this.value;
        }
      });
      block.append(input);
      big_wrapper = false;
      checkHeight = function() {
        return setTimeout((function() {
          var ghost_element, wrapper_div;
          if (block.height() > 100 && !big_wrapper) {
            ghost_element = $('<div>');
            block.after(ghost_element);
            wrapper_div = $('<div>').addClass('ice_big_inline_wrapper');
            wrapper_div.append(block);
            ghost_element.replaceWith(wrapper_div);
            return big_wrapper = true;
          } else if (block.height() < 100 && big_wrapper) {
            block.parent().replaceWith(block);
            return big_wrapper = false;
          }
        }), 0);
      };
      $(document.body).mouseup(checkHeight).keydown(checkHeight);
      setTimeout(checkHeight, 0);
      input.autoGrowInput({
        comfortZone: 0,
        minWidth: 20,
        maxWidth: Infinity
      });
      block.droppable({
        greedy: true,
        tolerance: 'pointer',
        hoverClass: 'highlight',
        accept: function(drop) {
          return segment.droppable && segment.accept(drop.data('ice_tree'));
        },
        drop: function(event, ui) {
          if (event.target === this) {
            input.val("");
            moveSegment(ui.draggable.data('ice_tree'), segment);
            return $(this).prepend(ui.draggable);
          }
        }
      });
      return block;
    };

    return IceInlineSegment;

  })(IceSegment);

  IceBlockSegment = (function(_super) {
    __extends(IceBlockSegment, _super);

    function IceBlockSegment() {
      this.parent = null;
      this.index = 0;
      this.children = [];
      this.type = 'block';
      this.droppable = true;
    }

    IceBlockSegment.prototype._reconstruct = function() {
      return new IceBlockSegment();
    };

    IceBlockSegment.prototype.stringify = function() {
      var child;
      return '\n  ' + ((function() {
        var _i, _len, _ref, _results;
        _ref = this.children;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          _results.push(child.stringify());
        }
        return _results;
      }).call(this)).join('\n').replace(/\n/g, '\n  ');
    };

    IceBlockSegment.prototype.blockify = function() {
      var block, child, drop_target, segment, _i, _len, _ref;
      segment = this;
      block = $('<div>');
      block.addClass('ice_segment');
      block.addClass('ice_' + this.type);
      _ref = this.children;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        if (typeof child === 'string') {
          block.append(child);
        } else {
          block.append($('<div>').addClass('ice_block_command_wrapper').append(child.blockify()));
        }
      }
      block.mousedown(function(origin_event) {
        var existentWrapper, selecting, selector, target, _this;
        target = $(origin_event.target);
        if (target.is(this) || (target.parent().is(this) && target.hasClass('ice_block_command_wrapper')) || target.parent().hasClass('ice_selected_element_wrapper') || target.hasClass('ice_root_bottom_div')) {
          existentWrapper = $('.ice_selected_element_wrapper');
          if (existentWrapper.parent().hasClass('ice_block_command_wrapper')) {
            existentWrapper.parent().replaceWith(existentWrapper.children());
          } else {
            existentWrapper.replaceWith(existentWrapper.children());
          }
          console.log('Reenabling draggable');
          $('.ice_statement').css('outline', '').data('overlapPos', null).draggable('enable');
          selector = $('<div>');
          selector.addClass('ice_selector');
          selector.data('overlapRerender', true);
          $(document.body).append(selector);
          corners(selector, origin_event, origin_event);
          selecting = true;
          $(document.body).mouseup(function(origin_event) {
            var children, first, last, last_child, selected_elements, selected_parents, wrapper_div;
            if (selecting) {
              children = _this.children();
              selected_elements = [];
              selected_parents = $('');
              last_child = null;
              children.each(function() {
                var true_block;
                true_block = $(this).children();
                if (true_block.hasClass('ice_statement')) {
                  if (overlap(selector, true_block)) {
                    last_child = true_block;
                    return selected_parents = selected_parents.add(this);
                  } else {
                    return true_block.css('outline', '');
                  }
                }
              });
              if (selected_parents.size() === 1) {
                selector.remove();
                last_child.draggable('enable');
                selecting = false;
                return;
              }
              first = selected_parents.first();
              last = selected_parents.last();
              selected_parents = first.nextUntil(last).andSelf().add(last);
              selected_parents.each(function() {
                var true_block;
                true_block = $(this).children();
                if (true_block.hasClass('ice_statement')) {
                  true_block.css('outline', '2px solid #FF0').draggable('disable');
                  return selected_elements.push(true_block.data('ice_tree'));
                }
              });
              selected_parents.wrapAll('<div>');
              wrapper_div = selected_parents.parent();
              wrapper_div.addClass('ice_selected_element_wrapper');
              wrapper_div.draggable({
                appendTo: 'body',
                helper: 'clone',
                revert: 'invalid',
                handle: '.ice_statement',
                start: function(event, ui) {
                  console.log('dragging wrapper div');
                  return ui.helper.addClass('ui-helper');
                },
                end: function(event, ui) {
                  return ui.helper.removeClass('ui-helper');
                }
              });
              wrapper_div.data('ice_tree', {
                syntax_type: 's',
                is_selected_wrapper: true,
                elements: selected_elements
              });
              console.log(wrapper_div, wrapper_div.data('ice_tree'));
              selector.remove();
              return selecting = false;
            }
          });
          _this = $(this);
          $(document.body).mousemove(function(event) {
            var children;
            if (selecting) {
              corners(selector, origin_event, event);
              children = _this.children();
              return children.each(function() {
                var true_block;
                true_block = $(this).children();
                if (true_block.hasClass('ice_statement')) {
                  if (overlap(selector, true_block)) {
                    return true_block.css('outline', '2px solid #FF0');
                  } else {
                    return true_block.css('outline', '');
                  }
                }
              });
            }
          });
          return false;
        }
      });
      drop_target = $('<div>');
      drop_target.addClass('ice_block_drop_target');
      drop_target.droppable({
        greedy: true,
        tolerance: 'pointer',
        hoverClass: 'highlight',
        accept: function() {
          return segment.droppable;
        },
        drop: function(event, ui) {
          var tree;
          if (event.target === this) {
            tree = ui.draggable.data('ice_tree');
            if ((tree.parent != null) && tree.parent.type === 'block') {
              ui.draggable.parent().detach();
            }
            block.prepend($('<div>').addClass('ice_block_command_wrapper').append(ui.draggable));
            return moveSegment(tree, segment);
          }
        }
      });
      drop_target.click(function() {
        var new_block, new_block_el;
        if (segment.droppable) {
          new_block = new IceHandwrittenSegment();
          segment.children.unshift(new_block);
          new_block.parent = segment;
          new_block_el = new_block.blockify();
          block.prepend($('<div>').addClass('ice_block_command_wrapper').append(new_block_el));
          return new_block_el.find('.ice_input').focus();
        }
      });
      block.append(drop_target);
      return block;
    };

    return IceBlockSegment;

  })(IceSegment);

  IceStatement = (function(_super) {
    __extends(IceStatement, _super);

    function IceStatement(template, type) {
      var child, _i, _len;
      this.parent = null;
      this.children = [];
      for (_i = 0, _len = template.length; _i < _len; _i++) {
        child = template[_i];
        this.children.push(child.clone());
        child.parent = this;
      }
      this.type = 'statement';
      this.syntax_type = type;
      this.droppable = true;
    }

    IceStatement.prototype._reconstruct = function() {
      return new IceStatement([], this.syntax_type);
    };

    IceStatement.prototype.blockify = function() {
      var block, child, drop_target, segment, _i, _len, _ref;
      segment = this;
      block = $('<div>');
      block.addClass('ice_segment');
      block.addClass('ice_' + this.type);
      block.addClass('ice_syntax_type_' + (this.syntax_type != null ? this.syntax_type : 'cv'));
      _ref = this.children;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        if (typeof child === 'string') {
          block.append(child);
        } else {
          block.append(child.blockify());
        }
      }
      block.data('ice_tree', segment);
      drop_target = $('<div>');
      drop_target.addClass('ice_drop_target');
      drop_target.droppable({
        greedy: true,
        tolerance: 'pointer',
        hoverClass: 'highlight',
        accept: function() {
          return segment.droppable;
        },
        drop: function(event, ui) {
          var tree;
          if (event.target === this) {
            tree = ui.draggable.data('ice_tree');
            if ((tree.parent != null) && tree.parent.type === 'block') {
              ui.draggable.parent().detach();
            }
            block.parent().after($('<div>').addClass('ice_block_command_wrapper').append(ui.draggable));
            return moveSegment(tree, segment);
          }
        }
      });
      drop_target.click(function() {
        var new_block, new_block_el;
        if (segment.droppable) {
          new_block = new IceHandwrittenSegment();
          segment.parent.children.splice(segment.parent.children.indexOf(segment) + 1, 0, new_block);
          new_block.parent = segment.parent;
          new_block_el = new_block.blockify();
          block.parent().after($('<div>').addClass('ice_block_command_wrapper').append(new_block_el));
          return new_block_el.find('.ice_input').focus();
        }
      });
      block.append(drop_target);
      block.draggable({
        appendTo: 'body',
        helper: 'clone',
        revert: 'invalid',
        start: function(event, ui) {
          return ui.helper.addClass('ui-helper');
        },
        end: function(event, ui) {
          return ui.helper.removeClass('ui-helper');
        }
      });
      return block;
    };

    return IceStatement;

  })(IceSegment);

  IceHandwrittenSegment = (function(_super) {
    __extends(IceHandwrittenSegment, _super);

    function IceHandwrittenSegment() {
      IceHandwrittenSegment.__super__.constructor.call(this, []);
    }

    IceHandwrittenSegment.prototype.blockify = function() {
      var block, drop_target, input, segment;
      segment = this;
      block = $('<div>');
      block.addClass('ice_segment');
      block.addClass('ice_statement');
      block.addClass('ice_handwritten');
      block.data('ice_tree', segment);
      drop_target = $('<div>');
      drop_target.addClass('ice_drop_target');
      drop_target.droppable({
        greedy: true,
        tolerance: 'pointer',
        hoverClass: 'highlight',
        accept: function() {
          return segment.droppable;
        },
        drop: function(event, ui) {
          if (event.target === this) {
            moveSegment(ui.draggable.data('ice_tree'), segment);
            return block.parent().after($('<div>').addClass('ice_block_command_wrapper').append(ui.draggable));
          }
        }
      });
      drop_target.click(function() {
        var new_block, new_block_el;
        if (segment.droppable) {
          new_block = new IceHandwrittenSegment();
          segment.parent.children.splice(segment.parent.children.indexOf(segment) + 1, 0, new_block);
          new_block.parent = segment.parent;
          new_block_el = new_block.blockify();
          block.parent().after($('<div>').addClass('ice_block_command_wrapper').append(new_block_el));
          return new_block_el.find('.ice_input').focus();
        }
      });
      block.append(drop_target);
      block.draggable({
        appendTo: 'body',
        helper: 'clone',
        revert: 'invalid'
      });
      input = $("<input>");
      input.addClass("ice_input");
      input.keyup(function() {
        return segment.children[0] = this.value;
      });
      input.keydown(function(event) {
        var focal, new_block, new_parent, new_segment, p_prev, prev;
        if (event.keyCode === 13 && segment.parent.type === 'block') {
          new_segment = new IceHandwrittenSegment(segment.accepts);
          segment.parent.children.splice(segment.parent.children.indexOf(segment) + 1, 0, new_segment);
          new_segment.parent = segment.parent;
          new_block = new_segment.blockify();
          block.parent().after($('<div>').addClass('ice_block_command_wrapper').append(new_block));
          return new_block.find('.ice_input').focus();
        } else if (event.keyCode === 8 && this.value.length === 0) {
          prev = block.parent().prev().find('.ice_input');
          focal = prev.length > 0 ? prev : block.parent().parent().siblings().filter('.ice_handwritten .ice_input').first();
          segment.parent.children.splice(segment.parent.children.indexOf(segment), 1);
          if (segment.parent._trembling && segment.parent.children.length === 0) {
            segment.parent.parent.children.pop();
            block.parent().parent().remove();
          }
          focal.focus();
          block.parent().remove();
          return false;
        } else if (event.keyCode === 9 && segment.parent.type === 'block') {
          prev = block.parent().prev().find('.ice_segment').data('ice_tree');
          if (prev == null) {
            return false;
          }
          segment.parent.children.splice(segment.parent.children.indexOf(segment), 1);
          p_prev = block.parent().prev();
          if (prev.children[prev.children.length - 1].type === 'block') {
            prev.children[prev.children.length - 1].children.push(segment);
            segment.parent = prev.children[prev.children.length - 1];
            block.parent().detach();
            p_prev.children().first().find('.ice_block').last().append($('<div>').addClass('ice_block_command_wrapper').append(block));
          } else {
            new_parent = new IceBlockSegment();
            new_parent._trembling = true;
            new_parent.parent = prev;
            new_block = new_parent.blockify();
            block.parent().detach();
            p_prev.children().first().append(new_block);
            new_block.append($('<div>').addClass('ice_block_command_wrapper').append(block));
            new_block.data('trembling', true);
            prev.children.push(new_parent);
            new_parent.children.push(segment);
            segment.parent = new_parent;
          }
          input.focus();
          return false;
        }
      });
      block.append(input);
      input.autoGrowInput({
        comfortZone: 0,
        minWidth: 20,
        maxWidth: Infinity
      });
      return block;
    };

    return IceHandwrittenSegment;

  })(IceStatement);

  corners = function(element, a, b) {
    var x, y;
    x = [a.pageX, b.pageX];
    y = [a.pageY, b.pageY];
    x.sort(function(a, b) {
      return a - b;
    });
    y.sort(function(a, b) {
      return a - b;
    });
    return element.css({
      left: x[0],
      top: y[0],
      width: x[1] - x[0],
      height: y[1] - y[0]
    });
  };

  genPosData = function(el) {
    var pos;
    pos = el.data('overlapPos');
    if ((el.data('overlapRerender') == null) && (el.data('overlapPos') != null)) {
      return pos;
    } else {
      pos = {};
      pos.head = el.offset();
      pos.tail = {
        left: pos.head.left + el.width(),
        top: pos.head.top + el.height()
      };
      el.data('overlapPos', pos);
      return pos;
    }
  };

  overlap = function(a, b) {
    var a_pos, b_pos;
    a_pos = genPosData(a);
    b_pos = genPosData(b);
    return a_pos.head.left < b_pos.tail.left && b_pos.head.left < a_pos.tail.left && a_pos.head.top < b_pos.tail.top && b_pos.head.top < a_pos.tail.top;
  };

  IceEditor = (function() {
    function IceEditor(element, templates, blockifier) {
      var block, blocks, bottom_div, checkHeight, details, root_element, section, template, title, _i, _len, _this;
      this.element = $(element);
      this.palette = $('<div>');
      this.palette.addClass('ice_palette blockish');
      for (title in templates) {
        section = templates[title];
        details = $('<details>').addClass('ice_palette_detail');
        details.append($('<summary>').text(title));
        blocks = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = section.length; _i < _len; _i++) {
            template = section[_i];
            _results.push(defrost(template, []));
          }
          return _results;
        })();
        for (_i = 0, _len = blocks.length; _i < _len; _i++) {
          block = blocks[_i];
          details.append($('<div>').addClass('ice_palette_template_wrapper').append(block.templateify()));
        }
        this.palette.append(details);
      }
      this.palette.droppable({
        greedy: true,
        tolerance: 'pointer',
        hoverClass: 'highlight',
        accept: function(drop) {
          return true;
        },
        drop: function(event, ui) {
          moveSegment(ui.draggable.data('ice_tree'), null);
          ui.draggable.detach();
          ui.draggable.trigger('dragstop');
          return ui.draggable.remove();
        }
      });
      this.workspace = $('<div>');
      this.workspace.addClass('ice_workspace blockish');
      this.root = new IceBlockSegment();
      root_element = this.root.blockify();
      this.workspace.append(root_element);
      bottom_div = this.bottom_div = $('<div>');
      bottom_div.addClass('ice_root_bottom_div');
      root_element.append(bottom_div);
      _this = this;
      bottom_div.droppable({
        greedy: true,
        tolerance: 'pointer',
        hoverClass: 'highlight',
        accept: function(drop) {
          return true;
        },
        drop: function(event, ui) {
          moveSegment(ui.draggable.data('ice_tree'), _this.root.children.length > 0 ? _this.root.children[_this.root.children.length - 1] : _this.root);
          return bottom_div.before($('<div>').addClass('ice_block_command_wrapper').append(ui.draggable));
        }
      });
      checkHeight = function() {
        return setTimeout((function() {
          var last_element, last_element_bottom_edge;
          last_element = root_element.children().filter('.ice_block_command_wrapper, .ice_selected_element_wrapper').last();
          last_element_bottom_edge = last_element.length > 0 ? last_element.offset().top + last_element.height() : 0;
          return bottom_div.height(root_element.height() - last_element_bottom_edge);
        }), 0);
      };
      $(document.body).mouseup(checkHeight).keydown(checkHeight);
      this.element.append(this.palette).append(this.workspace).append(this.selector);
      this.blockifier = blockifier;
    }

    IceEditor.prototype.getValue = function() {
      return this.root.stringify();
    };

    IceEditor.prototype.setValue = function(value) {
      var bottom_div, checkHeight, root_element, _this;
      this.workspace.html('');
      this.root = this.blockifier(value);
      root_element = this.root.blockify();
      this.workspace.append(root_element);
      bottom_div = this.bottom_div = $('<div>');
      bottom_div.addClass('ice_root_bottom_div');
      root_element.append(bottom_div);
      _this = this;
      bottom_div.droppable({
        greedy: true,
        tolerance: 'pointer',
        hoverClass: 'highlight',
        accept: function(drop) {
          return true;
        },
        drop: function(event, ui) {
          moveSegment(ui.draggable.data('ice_tree'), _this.root.children.length > 0 ? _this.root.children[_this.root.children.length - 1] : _this.root);
          return bottom_div.before($('<div>').addClass('ice_block_command_wrapper').append(ui.draggable));
        }
      });
      checkHeight = function() {
        return setTimeout((function() {
          var last_element, last_element_bottom_edge;
          last_element = root_element.children().filter('.ice_block_command_wrapper, .ice_selected_element_wrapper').last();
          last_element_bottom_edge = last_element.length > 0 ? last_element.offset().top + last_element.height() : 0;
          return bottom_div.height(root_element.height() - last_element_bottom_edge);
        }), 0);
      };
      return $(document.body).mouseup(checkHeight).keydown(checkHeight);
    };

    return IceEditor;

  })();

  defrost = function(frosting, args) {
    var argument, char, clone, current, escaped, inline, statement, _i, _len;
    statement = new IceStatement([], frosting.slice(0, +(frosting.indexOf(':') - 1) + 1 || 9e9));
    frosting = frosting.slice(frosting.indexOf(':') + 1);
    current = '';
    escaped = false;
    for (_i = 0, _len = frosting.length; _i < _len; _i++) {
      char = frosting[_i];
      if (escaped) {
        if (char === '%') {
          current += '%';
        } else if (char === 'w') {
          statement.children.push(new IceStaticSegment(current));
          argument = args.shift();
          clone = argument != null ? argument.clone() : new IceBlockSegment();
          clone.parent = statement;
          statement.children.push(clone);
          current = '';
        } else {
          statement.children.push(new IceStaticSegment(current));
          inline = null;
          (function() {
            var _char;
            _char = char;
            return inline = new IceInlineSegment(function(segment) {
              return (segment == null) || (segment.syntax_type == null) || __indexOf.call(segment.syntax_type, _char) >= 0;
            });
          })();
          argument = args.shift();
          if (argument != null) {
            if (typeof argument === 'string') {
              inline.children.push(argument);
              inline.droppable = true;
            } else {
              argument.parent = inline;
              inline.children.push(argument);
              argument.droppable = false;
              inline.droppable = false;
            }
          }
          statement.children.push(inline);
          current = '';
        }
        escaped = false;
      } else {
        if (char === '%') {
          escaped = true;
        } else {
          current += char;
        }
      }
    }
    statement.children.push(new IceStaticSegment(current));
    return statement;
  };

  /*
  # CoffeeScript blockifier... shouldn't be here by rights
  */


  coffee_operators = {
    '++': '++',
    '--': '--',
    '+': '+',
    '-': '-',
    '/': '/',
    '*': '*',
    '&&': 'and',
    '||': 'or',
    '===': 'is',
    '!==': 'isnt',
    '!': 'not',
    '?': '?'
  };

  coffee_reserved = ['return', 'break'];

  blockify = function(node) {
    var arg, child, expr, new_block, object, param, property, _i, _j, _len, _len1, _ref, _ref1, _ref2;
    console.log(node);
    if (node.constructor.name === 'Block') {
      new_block = new IceBlockSegment();
      _ref = node.expressions;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        expr = _ref[_i];
        child = blockify(expr);
        child.parent = new_block;
        new_block.children.push(child);
      }
      return new_block;
    } else if (node.constructor.name === 'Value') {
      if (node.properties.length > 0 && node.properties[0].constructor.name === 'Access') {
        return defrost('v:%v.%v', [blockify(node.base), blockify(node.properties[0].name)]);
      } else if (node.properties.length > 0 && node.properties[0].constructor.name === 'Index') {
        return defrost('v:%v[%v]', [blockify(node.base), blockify(node.properties[0].index)]);
      } else {
        return blockify(node.base);
      }
    } else if (node.constructor.name === 'Literal') {
      if (_ref1 = node.value, __indexOf.call(coffee_reserved, _ref1) >= 0) {
        return defrost('cr:' + node.value.replace(/%/g, '%%'), []);
      } else {
        return node.value;
      }
    } else if (node.constructor.name === 'Call') {
      return defrost('cv:%v(' + ((function() {
        var _j, _len1, _ref2, _results;
        _ref2 = node.args;
        _results = [];
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          arg = _ref2[_j];
          _results.push('%v');
        }
        return _results;
      })()).join(',') + ')', [blockify(node.variable)].concat((function() {
        var _j, _len1, _ref2, _results;
        _ref2 = node.args;
        _results = [];
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          arg = _ref2[_j];
          _results.push(blockify(arg));
        }
        return _results;
      })()));
    } else if (node.constructor.name === 'Code') {
      return defrost('v:(' + ((function() {
        var _j, _len1, _ref2, _results;
        _ref2 = node.params;
        _results = [];
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          param = _ref2[_j];
          _results.push('%v');
        }
        return _results;
      })()).join(',') + ') ->%w', ((function() {
        var _j, _len1, _ref2, _results;
        _ref2 = node.params;
        _results = [];
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          param = _ref2[_j];
          _results.push(blockify(param));
        }
        return _results;
      })()).concat([blockify(node.body)]));
    } else if (node.constructor.name === 'Param') {
      return blockify(node.name);
    } else if (node.constructor.name === 'Assign') {
      if ((node.context != null) && node.context === 'object') {
        return defrost('c:%v: %v', [blockify(node.variable), blockify(node.value)]);
      } else {
        return defrost("c:%v " + (node.context != null ? node.context : '=') + " %v", [blockify(node.variable), blockify(node.value)]);
      }
    } else if (node.constructor.name === 'For') {
      console.log(node);
      if (node.object) {
        return defrost('ck:for %v of %v%w', [blockify(node.index), blockify(node.source), blockify(node.body)]);
      }
      if (node.index) {
        return defrost('ck:for %v, %v in %v%w', [blockify(node.name), blockify(node.index), blockify(node.source), blockify(node.body)]);
      }
      if (node.name) {
        return defrost('ck:for %v in %v%w', [blockify(node.name), blockify(node.source), blockify(node.body)]);
      } else {
        return defrost('ck:for %v%w', [blockify(node.source), blockify(node.body)]);
      }
    } else if (node.constructor.name === 'Range') {
      return defrost((node.exclusive ? 'v:[%v...%v]' : 'v:[%v..%v]'), [blockify(node.from), blockify(node.to)]);
    } else if (node.constructor.name === 'Parens') {
      return defrost('cv:(%v)', [blockify(node.body.unwrap())]);
    } else if (node.constructor.name === 'Op') {
      if (node.second) {
        return defrost("v:%v " + coffee_operators[node.operator] + " %v", [blockify(node.first), blockify(node.second)]);
      } else if (node.flip) {
        return defrost("v:%v" + coffee_operators[node.operator], [blockify(node.first)]);
      } else {
        return defrost("v:" + coffee_operators[node.operator] + " %v", [blockify(node.first)]);
      }
    } else if (node.constructor.name === 'If') {
      if (node.elseBody != null) {
        return defrost('ck:if %v%w\nelse%w', [blockify(node.condition), blockify(node.body), blockify(node.elseBody)]);
      } else {
        return defrost('ck:if %v%w', [blockify(node.condition), blockify(node.body)]);
      }
    } else if (node.constructor.name === 'Arr') {
      return defrost('v:[' + ((function() {
        var _j, _len1, _ref2, _results;
        _ref2 = node.objects;
        _results = [];
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          object = _ref2[_j];
          _results.push('%v');
        }
        return _results;
      })()).join(',') + ']', (function() {
        var _j, _len1, _ref2, _results;
        _ref2 = node.objects;
        _results = [];
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          object = _ref2[_j];
          _results.push(blockify(object));
        }
        return _results;
      })());
    } else if (node.constructor.name === 'Obj') {
      new_block = new IceBlockSegment();
      _ref2 = node.properties;
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        property = _ref2[_j];
        new_block.children.push(blockify(property));
      }
      return defrost('v:{%w\n}', [new_block]);
    } else if (node.constructor.name === 'Return') {
      return defrost('cr:return %v', [blockify(node.expression)]);
    } else if (node.constructor.name === 'Bool') {
      return node.val;
    } else if (node.constructor.name === 'Existence') {
      return defrost('v:%v?', [blockify(node.expression)]);
    }
  };

  window.IceEditor = IceEditor;

  window.coffee_blockify = function(str) {
    return blockify(CoffeeScript.nodes(str));
  };

  window.defrost = defrost;

}).call(this);

/*
//@ sourceMappingURL=ice.map
*/
