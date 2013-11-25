// Generated by CoffeeScript 1.6.3
(function() {
  var currentDrop, formatBlock, formatLine, indent, makeElement, makeTemplateElement, moveTo, root;

  root = null;

  currentDrop = [];

  indent = function(string) {
    var line, lines, out, _i, _len;
    lines = string.split('\n');
    out = '';
    for (_i = 0, _len = lines.length; _i < _len; _i++) {
      line = lines[_i];
      out += '  ' + line + '\n';
    }
    return out;
  };

  formatBlock = function(tree) {
    var line, string, _i, _len;
    string = "";
    for (_i = 0, _len = tree.length; _i < _len; _i++) {
      line = tree[_i];
      string += indent(formatLine(line));
    }
    return string.slice(0, -1);
  };

  formatLine = function(tree) {
    var arg, char, fargs, in_special, string, x, _i, _j, _len, _len1, _ref, _ref1;
    fargs = [];
    _ref = tree.args;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      arg = _ref[_i];
      if (arg == null) {
        fargs.push("  ");
      } else if (arg.type === 'w') {
        fargs.push(formatBlock(arg.lines));
      } else {
        fargs.push(formatLine(arg));
      }
    }
    in_special = false;
    string = '';
    x = 0;
    _ref1 = tree.form;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      char = _ref1[_j];
      if (in_special) {
        if (char === '%') {
          string += '%';
        } else {
          string += (fargs[x] != null) && fargs[x] !== void 0 ? fargs[x] : '  ';
          x += 1;
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
  };

  makeElement = function(template) {
    var arg_number, char, currently_modifying, element, ice_tree, in_special, socket, _i, _len;
    arg_number = 0;
    in_special = false;
    element = document.createElement("div");
    element.className = "block";
    currently_modifying = document.createElement("span");
    ice_tree = {
      form: template,
      args: [],
      element: element
    };
    element._ice_tree = ice_tree;
    for (_i = 0, _len = template.length; _i < _len; _i++) {
      char = template[_i];
      if (in_special) {
        if (char === '%') {
          currently_modifying.innerText += '%';
        } else {
          element.appendChild(currently_modifying);
          if (char === 't') {
            socket = document.createElement("input");
            socket.className = "input_socket";
            element.appendChild(socket);
            $(socket).autoGrowInput({
              comfortZone: 10,
              minWidth: 20,
              maxWidth: 100
            });
            socket._ice_number = arg_number;
            ice_tree.args[arg_number] = {
              form: "",
              args: []
            };
            socket.onkeyup = function() {
              ice_tree.args[this._ice_number].form = this.value;
              return ($("#out")).text(formatLine(root._ice_tree));
            };
          } else {
            socket = document.createElement("div");
            socket.className = char === 'w' ? "block_socket" : "socket";
            element.appendChild(socket);
            socket._ice_parent = ice_tree;
            socket._ice_number = arg_number;
            socket._ice_insertable = true;
          }
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
    ice_tree.arglen = arg_number;
    element.appendChild(currently_modifying);
    ($(element)).draggable({
      appendTo: "body",
      cursor: "move",
      helper: "clone",
      revert: "invalid"
    });
    ($(".block, .socket, .block_socket")).droppable({
      tolerance: "pointer",
      activeClass: "ui-state-default",
      hoverClass: "ui-state-hover",
      greedy: true,
      accept: function(el) {
        return (this._ice_insertable != null) && this._ice_insertable;
      },
      over: function(event, ui) {
        return currentDrop.unshift(this);
      },
      out: function(event, ui) {
        return currentDrop.shift();
      },
      drop: function(event, ui) {
        if (currentDrop[0] === this) {
          moveTo(ui.draggable[0], this);
          return currentDrop = [];
        }
      }
    });
    return element;
  };

  moveTo = function(drag, drop) {
    var i, _i, _j, _ref, _ref1;
    if (drag._ice_template_clone != null) {
      drag._ice_template_clone.show();
      drag._ice_template_clone = null;
    }
    if (drag._ice_parent != null) {
      if (drag._ice_insert_type === 'block_socket') {
        for (i = _i = 0, _ref = drag._ice_parent.args[drag._ice_number].lines.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          if (drag._ice_parent.args[drag._ice_number].lines[i] === drag._ice_tree) {
            drag._ice_parent.args[drag._ice_number].lines.splice(i, 1);
            break;
          }
        }
      } else {
        drag._ice_parent.args[drag._ice_number] = null;
      }
    }
    if (drag._ice_literal_parent != null) {
      drag._ice_literal_parent._ice_insertable = true;
    }
    if (($(drop)).hasClass("block")) {
      for (i = _j = 0, _ref1 = drop._ice_parent.args[drop._ice_number].lines.length; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        if (drop._ice_parent.args[drop._ice_number].lines[i] === drop._ice_tree) {
          drop._ice_parent.args[drop._ice_number].lines.splice(i + 1, 0, drag._ice_tree);
          break;
        }
      }
      drag._ice_insert_type = "block_socket";
      drag._ice_insertable = true;
      ($(drop)).after(($("<div>")).append($(drag)));
    } else if (($(drop)).hasClass("block_socket")) {
      if (drop._ice_parent.args[drop._ice_number] == null) {
        drop._ice_parent.args[drop._ice_number] = {
          type: 'w',
          lines: []
        };
      }
      drop._ice_parent.args[drop._ice_number].lines.unshift(drag._ice_tree);
      drag._ice_insert_type = "block_socket";
      drag._ice_insertable = true;
      drop._ice_insertable = false;
      ($(drop)).prepend(($("<div>")).prepend($(drag)));
    } else {
      drop._ice_parent.args[drop._ice_number] = drag._ice_tree;
      drag._ice_insert_type = "socket";
      drag._ice_insertable = false;
      drop._ice_insertable = false;
      ($(drop)).append($(drag));
    }
    drop._ice_contents = drag;
    drag._ice_literal_parent = drop;
    drag._ice_parent = drop._ice_parent;
    drag._ice_number = drop._ice_number;
    return ($("#out")).text(formatLine(root._ice_tree));
  };

  makeTemplateElement = function(template) {
    var already_used, element, new_template;
    element = $(makeElement(template));
    already_used = false;
    new_template = null;
    return element.bind("dragstart", function() {
      if (!already_used) {
        new_template = $(makeTemplateElement(template)).hide();
        element.after(new_template);
        element[0]._ice_template_clone = new_template;
        return already_used = true;
      }
    });
  };

  window.onload = function() {
    var palette, template, templates, workspace, _i, _len;
    root = makeElement("(function() {\n%w\n}());");
    palette = $("#palette");
    workspace = $("#workspace");
    workspace.append(root);
    templates = ["alert(%v);", "prompt(%v)", "for (var %t = 0; %t < %v; %t += 1) {\n%w\n}", "%t", "\"%t\"", "(%v === %v)", "(%v + %v)", "if (%v) {\n%w\n}\nelse {\n%w\n}"];
    for (_i = 0, _len = templates.length; _i < _len; _i++) {
      template = templates[_i];
      palette.append($("<div>").addClass("template_wrapper").append(makeTemplateElement(template)));
    }
    $(document.body).keydown(function(e) {
      if (e.keyCode === 13) {
        return palette.append($("<div>").addClass("template_wrapper").append(makeTemplateElement((prompt("Enter template string:")).replace(/\\n/g, "\n"))));
      }
    });
    ($("#melt")).click(function() {
      return $(" .block, .socket, .block_socket").css("border", "none");
    });
    return ($("#run")).click(function() {
      return eval(formatLine(root._ice_tree));
    });
  };

}).call(this);
