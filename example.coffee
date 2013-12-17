window.onload = ->
  editor = new ICE.IceEditor(document.getElementById('editor'), coffee, coffee_blockify)
  
  $("#toggle").click ->
    editor.toggle()
  
  $("#run").click ->
    frames[0].location.reload()
    frame = $("iframe").load ->
        frames[0].CoffeeScript.eval editor.getValue()
        frame.unbind("load")
  
  # Example first program
  editor.setValue """
speed Infinity
pen_on = false
write 'Arrow keys to move, space to draw!'
tick 100, 
  () -> 
    if keyisdown('space') and not pen_on 
      pen random('color')
      pen_on = true
    if pen_on and not keyisdown('space') 
      pen 'off'
      pen_on = false
    if keyisdown('up') 
      fd 1
    if keyisdown('down') 
      bk 1
    if keyisdown('right') 
      rt 1
    if keyisdown('left') 
      lt 1
"""

  window.editor = editor
