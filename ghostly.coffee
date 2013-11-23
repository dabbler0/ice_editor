# Format a block tree

indent = (string) ->
  lines = string.split("\n")
  outstring = ""
  for line in lines
    outstring += "  " + line + "\n"
  return outstring.slice 0, -1

format = (tree) ->
  if not tree?
    return "<ERROR>"
  if not tree.hasOwnProperty "args" or tree.args.length == 0
    if tree.hasOwnProperty "form"
      return tree.form
    else
      string = ""
      for line in tree
        string += (indent format line) + "\n"
      return string.slice 0, -1
  else
    form = tree.form
    args = tree.args
    in_special = false
    string = ''
    s = 0
    for char in form
      if in_special
        if char == '%'
          string += '%'
        else
          string += format args[s]
          s += 1
        in_special = false
      else
        if char == '%'
          in_special = true
        else
          string += char

    return string


makeElement = (template) ->
  arg_number = 0
  in_special = false
  element = document.createElement "div"
  element.className = "block"
  currently_modifying = document.createElement "span"
  for char in template
    if in_special
      if char == '%'
        currently_modifying.innerText += '%'
      else if char == 'w'
        # Create the socket
        element.appendChild currently_modifying
        socket = document.createElement "div"
        socket.className = "block_socket"

        # These things for later use when snapping things in 
        socket._ghostly_parent = element
        socket._ghostly_number = arg_number

        # Append it to the element and resume parsing
        element.appendChild socket
        currently_modifying = document.createElement "span"
        arg_number += 1
      else
        # Create the socket
        element.appendChild currently_modifying
        socket = document.createElement "div"
        socket.className = "socket"

        # These things for later use when snapping things in 
        socket._ghostly_parent = element
        socket._ghostly_number = arg_number

        # Append it to the element and resume parsing
        element.appendChild socket
        currently_modifying = document.createElement "span"
        arg_number += 1
      in_special = false
    else
      if char == '%'
        in_special = true
      else
        currently_modifying.innerText += char
  
  element.appendChild currently_modifying
  element._ghostly_tree = {
    form: template
    args: []
    arglen: arg_number
    element: element
  }

  return element

window.onload = ->
  for _ in [1..4]
    document.body.appendChild makeElement "alert %v"
  for _ in [1..3]
    document.body.appendChild makeElement "for _ in [1..10]\n%w"
  for _ in [1..4]
    document.body.appendChild makeElement Math.random().toString()[0..3]
  ($ ".block").draggable {
    appendTo: "body",
    cursor: "move",
    helper: "clone",
    revert: "invalid"
  }

  ($ ".socket").droppable {
    tolerance: "pointer"
    greedy: true
    accept: ".block"
    activeClass: "ui-state-default"
    hoverClass: "ui-state-hover"
    drop: (event, ui) ->
      this._ghostly_parent._ghostly_tree.args[this._ghostly_number] = ui.draggable[0]._ghostly_tree
      ui.draggable[0]._ghostly_parent = this._ghostly_parent
      ($ this).append ($ ui.draggable)
  }

  ($ ".block_socket").droppable {
    tolerance: "pointer"
    greedy: true
    accept: ".block"
    activeClass: "ui-state-default"
    hoverClass: "ui-state-hover"
    drop: (event, ui) ->
      if not this._ghostly_parent._ghostly_tree.args[this._ghostly_number]?
        this._ghostly_parent._ghostly_tree.args[this._ghostly_number] = []
      ui.draggable[0]._ghostly_parent = this._ghostly_parent
      ui.draggable[0]._ghostly_number = this._ghostly_number
      this._ghostly_parent._ghostly_tree.args[this._ghostly_number].push(ui.draggable[0]._ghostly_tree)
      ($ this).append ($ ui.draggable)
    out: (event, ui) ->
      block = this._ghostly_parent._ghostly_tree.args[this._ghostly_number]
      for i in [0..block.length]
        if block[i] == ui.draggable[0]._ghostly_tree
          block.splice i, 1
          break
      ui.draggable[0]._ghostly_parent = null
      ui.draggable[0]._ghostly_number = null
  }

  ($ ".block").droppable {
    tolerance: "pointer"
    greedy: true
    accept: (el) ->
      return this._ghostly_parent?
    activeClass: "ui-state-default"
    hoverClass: "ui-state-hover"
    drop: (event, ui) ->
      console.log this, this._ghostly_parent, this._ghostly_parent.ghostly_tree
      block = this._ghostly_parent._ghostly_tree.args[this._ghostly_number]
      for i in [0..block.length]
        if block[i] == this._ghostly_tree
          ui.draggable[0]._ghostly_parent = this._ghostly_parent
          ui.draggable[0]._ghostly_number = this._ghostly_number
          block.splice(i+1, 0, ui.draggable[0]._ghostly_tree)
          ($ this).after (($ "<div>").append $ ui.draggable)
          break
    out: (event, ui) ->
      block = this._ghostly_parent._ghostly_tree.args[this._ghostly_number]
      for i in [0..block.length]
        if block[i] == ui.draggable[0]._ghostly_tree
          block.splice i, 1
          break
      ui.draggable[0]._ghostly_parent = null
      ui.draggable[0]._ghostly_number = null
  }

  ($ "#stringify").click(->
    str = format document.getElementsByClassName("block")[0]._ghostly_tree
    ($ "#out").text str)
  ($ "#melt").click(->
    ($ ".block").css "border", "none"
    ($ ".socket").css "border", "none"
    ($ ".block_socket").css "border", "none")
