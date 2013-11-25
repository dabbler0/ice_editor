# Format a block tree

root = null

indent = (string) ->
  lines = string.split('\n')
  out = ''
  for line in lines
    out += '  ' + line + '\n'
  return out

formatBlock = (tree) ->
  string = ""
  for line in tree
    string += indent formatLine line
  console.log string.slice 0, -1
  return string.slice 0, -1

formatLine = (tree) ->
  fargs = []
  for arg in tree.args
    if arg.type == 'w'
      fargs.push formatBlock arg.lines
    else
      fargs.push formatLine arg
  
  in_special = false
  string = ''
  x = 0
  for char in tree.form
    if in_special
      if char == '%'
        string += '%'
      else
        string += fargs[x]
        x += 1
      in_special = false
    else
      if char == '%'
        in_special = true
      else
        string += char

  return string

makeElement = (template) ->
  # Setup for parsing
  arg_number = 0
  in_special = false

  # Construct the element
  element = document.createElement "div"
  element.className = "block"
  currently_modifying = document.createElement "span"

  # Construct its tree
  ice_tree = {
    form: template
    args: []
    element: element
  }

  element._ice_tree = ice_tree

  # Parse
  for char in template
    if in_special
      if char == '%'
        # % is escape character
        currently_modifying.innerText += '%'
      else
        element.appendChild currently_modifying
        socket = document.createElement "div"
        socket.className = if char == 'w' then "block_socket" else "socket"

        # These things for later use when snapping things in 
        socket._ice_parent = ice_tree
        socket._ice_number = arg_number
        socket._ice_insertable = true

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
  
  ice_tree.arglen = arg_number
  element.appendChild currently_modifying

  return element

moveTo  = (drag, drop) ->
  console.log "drag", drag._ice_parent, "drop", drop._ice_parent

  # Detach the tree
  if drag._ice_parent?
    if drag._ice_insert_type == 'block_socket'
      for i in [0..drag._ice_parent.args[drop._ice_number].lines.length]
        if drag._ice_parent.args[drop._ice_number].lines[i] == drag._ice_tree
          drag._ice_parent.args[drop._ice_number].lines.splice i, 1
          break
    else
      drag._ice_parent.args[drag._ice_number] = null
  if drag._ice_literal_parent?
    drag._ice_literal_parent._ice_insertable = true

  # Reinsert the tree
  if ($ drop).hasClass "block"
    for i in [0..drop._ice_parent.args[drop._ice_number].lines.length]
      if drop._ice_parent.args[drop._ice_number].lines[i] == drop._ice_tree
        drop._ice_parent.args[drop._ice_number].lines.splice i+1, 0, drag._ice_tree
        break
    drag._ice_insert_type = "block_socket"
    
    drag._ice_insertable = true

    # Reinsert the element
    ($ drop).after ($ "<div>").append ($ drag)

  else if ($ drop).hasClass "block_socket"
    if not drop._ice_parent.args[drop._ice_number]?
      drop._ice_parent.args[drop._ice_number] = {type: 'w', lines:[]}
    drop._ice_parent.args[drop._ice_number].lines.unshift drag._ice_tree
    console.log "dropping into block_socket", drop._ice_parent[drop._ice_number]
    drag._ice_insert_type = "block_socket"
    
    # We can't append to a value-inserted block
    drag._ice_insertable = true
    drop._ice_insertable = false
    
    # Reinsert the element
    ($ drop).append ($ "<div>").prepend ($ drag)

  else
    drop._ice_parent.args[drop._ice_number] = drag._ice_tree
    drag._ice_insert_type = "socket"

    # Both are now filled
    drag._ice_insertable = false
    drop._ice_insertable = false

    # Reinsert the element
    ($ drop).append ($ drag)

  drop._ice_contents = drag
  drag._ice_literal_parent = drop
  drag._ice_parent = drop._ice_parent
  drag._ice_number = drop._ice_number

  # FOR EXAMPLE ONLY (might want to allow handler-binding here)
  ($ "#out").text formatLine root._ice_tree

window.onload = ->
  root = makeElement "window.onload = ->\n%w"
  document.body.appendChild root
  for i in [1..5]
    document.body.appendChild makeElement "alert %v"
  for i in [1..2]
    document.body.appendChild makeElement "for _ in [1..10]\n%w"
  for i in [1..5]
    document.body.appendChild makeElement Math.random().toString()[0..2]

  ($ ".block").draggable {
    appendTo: "body"
    cursor: "move"
    helper: "clone"
    revert: "invalid"
  }

  ($ ".socket, .block_socket, .block").droppable {
    tolerance: "pointer"
    activeClass: "ui-state-default"
    hoverClass: "ui-state-hover"
    greedy: true
    accept: (el) ->
      return this._ice_insertable? and this._ice_insertable
    drop: (event, ui) ->
      moveTo ui.draggable[0], this
  }
  
  ($ "#melt").click(->
    $(" .block, .socket, .block_socket").css "border", "none"
  )
