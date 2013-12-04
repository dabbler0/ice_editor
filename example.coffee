window.onload = ->
  
  addition = defrost('(%v + %v)', [null, null])
  multiplication = defrost("(%v * %v)", [null, null])
  
  editor = new IceEditor(document.getElementById('editor'), [addition, multiplication], coffee_blockify)
  
  $("#get").click ->
    $("#value").val editor.getValue()[3..].replace /\n  /g, '\n'
  
  $("#set").click ->
    editor.setValue $("#value").val()
  
  $("#run").click ->
    $("#value").val editor.getValue()[3..].replace /\n  /g, '\n'
    CoffeeScript.eval $("#value").val()
  
  window.editor = editor
