# Format a block tree

root = null
currentDrop = []

indent = (string) ->
  lines = string.split('\n')
  out = ''
  for line in lines
    out += '  ' + line + '\n'
  return out

formatBlock = (tree) ->
  console.log "Formatting block", tree
  string = ""
  for line in tree
    if line? and line != undefined
      string += indent formatLine line
  return string.slice 0, -1

formatLine = (tree) ->
  fargs = []
  console.log "formatting", tree
  for arg in tree.args
    if not arg? or arg == undefined
      fargs.push "  "
    else if arg.type == 'w'
      console.log "Calling formatBlock on", arg
      fargs.push formatBlock arg.lines
    else
      console.log "Calling formatLine on", arg
      fargs.push formatLine arg
  
  in_special = false
  string = ''
  x = 0
  for char in tree.form
    if in_special
      if char == '%'
        string += '%'
      else
        string += if fargs[x]? and fargs[x] != undefined then fargs[x] else '  '
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
        if char == 't'
          socket = document.createElement "input"
          socket.className = "input_socket"
          element.appendChild socket

          $(socket).autoGrowInput({
            comfortZone: 10
            minWidth: 20
            maxWidth: 1000
          })
          
          socket._ice_number = arg_number
          ice_tree.args[arg_number] = {
            form: ""
            args: []
          }

          socket.onkeyup = ->
            ice_tree.args[this._ice_number].form = this.value

            #EXAMPLE ONLY
            ($ "#out").text formatLine root._ice_tree


        else
          socket = document.createElement "div"
          socket.className = if char == 'w' then "block_socket" else "socket"
          element.appendChild socket

          # These things for later use when snapping things in 
          socket._ice_parent = ice_tree
          socket._ice_number = arg_number
          socket._ice_insertable = true

        # Append it to the element and resume parsing
        currently_modifying = document.createElement "span"
        arg_number += 1
      in_special = false
    else
      if char == '%'
        in_special = true
      else
        currently_modifying.innerText += char
  
  # Finish constructing the element
  ice_tree.arglen = arg_number
  element.appendChild currently_modifying
  
  # Init the element as draggable and refresh the droppable properties
  ($ element).draggable({
    appendTo: "body"
    cursor: "move"
    helper: "clone"
    revert: "invalid"
  })


  ($ ".block, .socket, .block_socket").droppable {
    tolerance: "pointer"
    activeClass: "ui-state-default"
    #hoverClass: "ui-state-hover"
    greedy: true
    accept: (el) ->
      return this._ice_insertable? and this._ice_insertable
    over: (event, ui) ->
      if currentDrop.length > 0
        ($ currentDrop[0]).removeClass "ui-state-hover"
      ($ this).addClass "ui-state-hover"
      currentDrop.unshift this
    out: (event, ui) ->
      ($ currentDrop[0]).removeClass "ui-state-hover"
      currentDrop.shift()
    drop: (event, ui) ->
      if currentDrop[0] == this
        ($ this).removeClass "ui-state-hover"
        moveTo ui.draggable[0], this
        currentDrop = []
  }


  return element

moveTo  = (drag, drop) ->
  # Deal with template issues
  if drag._ice_template_clone?
    drag._ice_template_clone.show()
    drag._ice_template_clone = null

  # Detach the tree
  if drag._ice_parent?
    if drag._ice_insert_type == 'block_socket'
      for i in [0..drag._ice_parent.args[drag._ice_number].lines.length]
        if drag._ice_parent.args[drag._ice_number].lines[i] == drag._ice_tree
          drag._ice_parent.args[drag._ice_number].lines.splice i, 1
          break
    else
      drag._ice_parent.args[drag._ice_number] = null
  if drag._ice_literal_parent?
    drag._ice_literal_parent._ice_insertable = true
  
  if drop?
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
      drag._ice_insert_type = "block_socket"
      
      # We can't append to a value-inserted block
      drag._ice_insertable = true
      drop._ice_insertable = false
      
      # Reinsert the element
      ($ drop).prepend ($ "<div>").prepend ($ drag)

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

makeElementFromBlock = (tree) ->

  for line in tree
    string += indent makeElementFromLine line
  return string.slice 0, -1

makeElementFromLine = (tree) ->
  fargs = []
  for arg in tree.args
    if not arg?
      fargs.push "  "
    else if arg.type == 'w'
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
        string += if fargs[x]? and fargs[x] != undefined then fargs[x] else '  '
        x += 1
      in_special = false
    else
      if char == '%'
        in_special = true
      else
        string += char

  return string

makeTemplateElement = (template) ->
  element = $(makeElement template)
  already_used = false
  new_template = null
  element.bind("dragstart", ->
    if not already_used
      new_template = $(makeTemplateElement template).hide()
      element.after new_template
      element[0]._ice_template_clone = new_template
      already_used = true)

makeElementFromBlock = (block) ->
  result = []
  for line in block.lines
    result.push makeElementFromTree line
  return result

makeElementFromTree = (tree) ->
  tree = $.extend(true, {}, tree)

  # Recursively parse the arguments
  fargs = []
  for arg in tree.args
    if not arg?
      fargs.push null
    else if arg.type == "w"
      fargs.push makeElementFromBlock arg
    else
      fargs.push makeElementFromTree arg
  
  arg_number = 0
  in_special = false

  element = document.createElement "div"
  element.className = "block"
  currently_modifying = document.createElement "span"

  for char in tree.form
    if in_special
      if char == '%'
        currently_modifying.innerText += '%'
      else
        element.appendChild currently_modifying
        if char == 't'
          socket = document.createElement "input"
          socket.className = "input_socket"
          socket.value = tree.args[arg_number].form
          element.appendChild socket

          $(socket).autoGrowInput({
            comfortZone: 10
            minWidth: 20
            maxWdith: 1000
          })

          socket._ice_number = arg_number

          socket.onkeyup = ->
            tree.args[this._ice_number].form = this.value

        else if char == 'w'
          socket = document.createElement "div"
          socket.className = "block_socket"
          element.appendChild socket

          socket._ice_parent = tree
          socket._ice_number = arg_number

          if fargs[arg_number] != undefined and fargs[arg_number]?
            # Append the multiline argument if necessary
            socket._ice_insertable = false
            for el in fargs[arg_number]
              new_div = document.createElement "div"
              new_div.appendChild el
              socket.appendChild new_div
          else
            socket._ice_insertable = true
        else
          socket = document.createElement "div"
          socket.className = "socket"
          element.appendChild socket

          socket._ice_parent = tree
          socket._ice_number = arg_number

          if fargs[arg_number] != undefined and fargs[arg_number]?
            socket.appendChild fargs[arg_number]
            socket._ice_insertable = false
          else
            socket._ice_insertable = true
        currently_modifying = document.createElement "span"
        arg_number += 1
      in_special = false
    else
      if char == '%'
        in_special = true
      else
        currently_modifying.innerText += char
  
  # Finish constructing the element
  tree.arglen = arg_number
  element.appendChild currently_modifying
  element._ice_tree = tree

  $(element).draggable({
    appendTo: "body"
    cursor: "move"
    helper: "clone"
    revert: "invalid"
  })
  
  ($ ".block, .socket, .block_socket").droppable {
    tolerance: "pointer"
    activeClass: "ui-state-default"
    #hoverClass: "ui-state-hover"
    greedy: true
    accept: (el) ->
      return this._ice_insertable? and this._ice_insertable
    over: (event, ui) ->
      if currentDrop.length > 0
        ($ currentDrop[0]).removeClass "ui-state-hover"
      ($ this).addClass "ui-state-hover"
      currentDrop.unshift this
    out: (event, ui) ->
      ($ currentDrop[0]).removeClass "ui-state-hover"
      currentDrop.shift()
    drop: (event, ui) ->
      if currentDrop[0] == this
        ($ this).removeClass "ui-state-hover"
        moveTo ui.draggable[0], this
        currentDrop = []
  }

  return element

window.onload = ->
  root = makeElement "(function() {\n%w\n}());"
  
  palette = ($ "#palette")
  workspace = ($ "#workspace")
  ($ "#trashbin").droppable {
    tolerance: "pointer"
    activeClass: "ui-state-default"
    hoverClass: "ui-state-hover"
    accept: ".block"
    drop: (event, ui) ->
      moveTo ui.draggable[0], null
      ui.draggable.remove()
  }

  workspace.append root

  templates = [
    "alert(%v);",
    "prompt(%v)",
    "for (var %t = 0; %t < %v; %t += 1) {\n%w\n}",
    "%t",
    "\"%t\"",
    "(%v === %v)",
    "(%v + %v)",
    "if (%v) {\n%w\n}\nelse {\n%w\n}"
  ]

  for template in templates
    palette.append $("<div>").addClass("template_wrapper").append makeTemplateElement template
  
  ($ "#melt").click(->
    $(" .block, .socket, .block_socket, .input_socket").animate {
      "border-width": 0
      padding: 0
    }, 300
  )
  ($ "#run").click(->
    eval formatLine root._ice_tree
  )

  $("#clone").click(->
    workspace.append makeElementFromTree root._ice_tree
  )

  $("#new_block").click(->
      palette.append $("<div>").addClass("template_wrapper").append makeTemplateElement (prompt "Enter template string:").replace(/\\n/g, "\n")
  )
