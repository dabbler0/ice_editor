# Format a block tree
format = (tree) ->
  if not tree.hasOwnProperty "args" or tree.args.length == 0
    return tree.form
  else
    form = tree.form
    args = tree.args
    in_special = false
    string = ''
    for char in form
      if in_special
        if char == '%'
          string += '%'
        else
          string += format args.shift()
      else
        if char == '%'
          in_special = true
        else
          string += char

    return string

"""
# Test for block tree formatting
console.log format {
  form: "alert %v"
  args: [{
    form: "'hello'"
  }]
}
"""

# We start not carrying any blocks.
currently_held = null
offset_coords = {x:10, y:10}
current_in_socket = null
sockets = []

makeElement = (template) ->
  in_special = false
  element = document.createElement "div"
  element.className = "block"
  element.style.position = "absolute"
  element._ghostly_arguments = []
  currently_modifying = document.createElement "span"
  for char in template
    if in_special
      if char == '%'
        currently_modifying.innerText += '%'
      else
        console.log "creating a socket"
        element.appendChild currently_modifying
        socket = document.createElement "div"
        socket.style.display = "inline-block"
        socket.className = "socket"
        socket.innerText = "  "
        element._ghostly_arguments.push socket
        sockets.push $ socket
        element.appendChild socket
        currently_modifying = document.createElement "span"
      in_special = false
    else
      if char == '%'
        in_special = true
      else
        currently_modifying.innerText += char


  element.appendChild currently_modifying
  document.body.appendChild element

  return $ element

findSocket = (e) ->
  for socket in sockets
    if socket.children().length > 0
      continue
    offset = socket.offset()
    if offset.left < e.pageX and e.pageX < offset.left + socket.width() and offset.top < e.pageY and e.pageY < offset.top + socket.height()
      return socket
  return null

checkSocket = (e) ->
  for socket in sockets
    offset = socket.offset()
    if offset.left < e.pageX and e.pageX < offset.left + socket.width() and offset.top < e.pageY and e.pageY < offset.top + socket.height()
      return true
  return false

takeBlock = (block, e) ->
  currently_held = block
  if e?
    offset_coords.x = e.pageX - block.element.offset().left
    offset_coords.y = e.pageY - block.element.offset().top

makeBlock = (template) ->
  new_element = makeElement template
  new_block = {
    form: template
    element: new_element
    args: []
  }
  new_element.click (e) ->
    e.stopPropagation()
    if new_block == currently_held
      takeBlock null
    else
      takeBlock new_block, e
    return false
  takeBlock new_block

window.onload = ->
  document.body.onmousemove = (e) ->
    if currently_held?
      if not current_in_socket
        currently_held.element.offset({
          left: e.pageX-offset_coords.x
          top: e.pageY-offset_coords.y
        })
      socket = findSocket e
      if not current_in_socket and socket?
          currently_held.element.detach()
          socket.append currently_held.element
          socket.text ""
          #currently_held.element.css {left: socket.position().left, top: socket.position().top}
          currently_held.element.css "position", "static"
          socket.width currently_held.element.width() + 4
          socket.height currently_held.element.height() + 4
          current_in_socket = true
      else if current_in_socket and not checkSocket e
        currently_held.element.detach()
        ($ document.body).append currently_held.element
        current_in_socket = false

  document.body.onkeydown = (e) ->
    if e.keyCode == 13
      makeBlock "moveto %v, %v"
