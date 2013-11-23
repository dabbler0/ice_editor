// Generated by CoffeeScript 1.6.3
(function() {
  var format, indent, makeElement;

  indent = function(string) {
    var line, lines, outstring, _i, _len;
    lines = string.split("\n");
    outstring = "";
    for (_i = 0, _len = lines.length; _i < _len; _i++) {
      line = lines[_i];
      outstring += "  " + line + "\n";
    }
    return outstring.slice(0, -1);
  };

  format = function(tree) {
    var args, char, form, in_special, line, s, string, _i, _j, _len, _len1;
    if (tree == null) {
      return "<ERROR>";
    }
    if (!tree.hasOwnProperty("args" || tree.args.length === 0)) {
      if (tree.hasOwnProperty("form")) {
        return tree.form;
      } else {
        string = "";
        for (_i = 0, _len = tree.length; _i < _len; _i++) {
          line = tree[_i];
          string += (indent(format(line))) + "\n";
        }
        return string.slice(0, -1);
      }
    } else {
      form = tree.form;
      args = tree.args;
      in_special = false;
      string = '';
      s = 0;
      for (_j = 0, _len1 = form.length; _j < _len1; _j++) {
        char = form[_j];
        if (in_special) {
          if (char === '%') {
            string += '%';
          } else {
            string += format(args[s]);
            s += 1;
          }
          in_special = false;
        } else {
          if (char === '%') {
            in_special = true;
          } else {
            string += char;
          }
        }
      }
      return string;
    }
  };

  makeElement = function(template) {
    var arg_number, char, currently_modifying, element, in_special, socket, _i, _len;
    arg_number = 0;
    in_special = false;
    element = document.createElement("div");
    element.className = "block";
    currently_modifying = document.createElement("span");
    for (_i = 0, _len = template.length; _i < _len; _i++) {
      char = template[_i];
      if (in_special) {
        if (char === '%') {
          currently_modifying.innerText += '%';
        } else if (char === 'w') {
          element.appendChild(currently_modifying);
          socket = document.createElement("div");
          socket.className = "block_socket";
          socket._ghostly_parent = element;
          socket._ghostly_number = arg_number;
          element.appendChild(socket);
          currently_modifying = document.createElement("span");
          arg_number += 1;
        } else {
          element.appendChild(currently_modifying);
          socket = document.createElement("div");
          socket.className = "socket";
          socket._ghostly_parent = element;
          socket._ghostly_number = arg_number;
          element.appendChild(socket);
          currently_modifying = document.createElement("span");
          arg_number += 1;
        }
        in_special = false;
      } else {
        if (char === '%') {
          in_special = true;
        } else {
          currently_modifying.innerText += char;
        }
      }
    }
    element.appendChild(currently_modifying);
    element._ghostly_tree = {
      form: template,
      args: [],
      arglen: arg_number,
      element: element
    };
    return element;
  };

  window.onload = function() {
    var _, _i, _j, _k;
    for (_ = _i = 1; _i <= 4; _ = ++_i) {
      document.body.appendChild(makeElement("alert %v"));
    }
    for (_ = _j = 1; _j <= 3; _ = ++_j) {
      document.body.appendChild(makeElement("for _ in [1..10]\n%w"));
    }
    for (_ = _k = 1; _k <= 4; _ = ++_k) {
      document.body.appendChild(makeElement(Math.random().toString().slice(0, 4)));
    }
    ($(".block")).draggable({
      appendTo: "body",
      cursor: "move",
      helper: "clone",
      revert: "invalid"
    });
    ($(".socket")).droppable({
      tolerance: "pointer",
      greedy: true,
      accept: ".block",
      activeClass: "ui-state-default",
      hoverClass: "ui-state-hover",
      drop: function(event, ui) {
        this._ghostly_parent._ghostly_tree.args[this._ghostly_number] = ui.draggable[0]._ghostly_tree;
        ui.draggable[0]._ghostly_parent = this._ghostly_parent;
        return ($(this)).append($(ui.draggable));
      }
    });
    ($(".block_socket")).droppable({
      tolerance: "pointer",
      greedy: true,
      accept: ".block",
      activeClass: "ui-state-default",
      hoverClass: "ui-state-hover",
      drop: function(event, ui) {
        if (this._ghostly_parent._ghostly_tree.args[this._ghostly_number] == null) {
          this._ghostly_parent._ghostly_tree.args[this._ghostly_number] = [];
        }
        ui.draggable[0]._ghostly_parent = this._ghostly_parent;
        ui.draggable[0]._ghostly_number = this._ghostly_number;
        this._ghostly_parent._ghostly_tree.args[this._ghostly_number].push(ui.draggable[0]._ghostly_tree);
        return ($(this)).append($(ui.draggable));
      },
      out: function(event, ui) {
        var block, i, _l, _ref;
        block = this._ghostly_parent._ghostly_tree.args[this._ghostly_number];
        for (i = _l = 0, _ref = block.length; 0 <= _ref ? _l <= _ref : _l >= _ref; i = 0 <= _ref ? ++_l : --_l) {
          if (block[i] === ui.draggable[0]._ghostly_tree) {
            block.slice(i, 1);
            break;
          }
        }
        ui.draggable[0]._ghostly_parent = null;
        return ui.draggable[0]._ghostly_number = null;
      }
    });
    ($(".block")).droppable({
      tolerance: "pointer",
      greedy: true,
      accept: function(el) {
        return this._ghostly_parent != null;
      },
      activeClass: "ui-state-default",
      hoverClass: "ui-state-hover",
      drop: function(event, ui) {
        var block, i, _l, _ref, _results;
        console.log(this, this._ghostly_parent, this._ghostly_parent.ghostly_tree);
        block = this._ghostly_parent._ghostly_tree.args[this._ghostly_number];
        _results = [];
        for (i = _l = 0, _ref = block.length; 0 <= _ref ? _l <= _ref : _l >= _ref; i = 0 <= _ref ? ++_l : --_l) {
          if (block[i] === this._ghostly_tree) {
            ui.draggable[0]._ghostly_parent = this._ghostly_parent;
            ui.draggable[0]._ghostly_number = this._ghostly_number;
            block.splice(i + 1, 0, ui.draggable[0]._ghostly_tree);
            ($(this)).after(($("<div>")).append($(ui.draggable)));
            break;
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      },
      out: function(event, ui) {
        var block, i, _l, _ref;
        block = this._ghostly_parent._ghostly_tree.args[this._ghostly_number];
        for (i = _l = 0, _ref = block.length; 0 <= _ref ? _l <= _ref : _l >= _ref; i = 0 <= _ref ? ++_l : --_l) {
          if (block[i] === ui.draggable[0]._ghostly_tree) {
            block.slice(i, 1);
            break;
          }
        }
        ui.draggable[0]._ghostly_parent = null;
        return ui.draggable[0]._ghostly_number = null;
      }
    });
    ($("#stringify")).click(function() {
      var str;
      str = format(document.getElementsByClassName("block")[0]._ghostly_tree);
      return ($("#out")).text(str);
    });
    return ($("#melt")).click(function() {
      ($(".block")).css("border", "none");
      ($(".socket")).css("border", "none");
      return ($(".block_socket")).css("border", "none");
    });
  };

}).call(this);
