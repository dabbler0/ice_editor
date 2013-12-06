window.onload = ->
  
  editor = new IceEditor(document.getElementById('editor'), {
    math: [
      'v:%v + %v'
      'v:%v - %v'
      'v:%v * %v'
      'v:%v / %v'
      'v:%v == %v'
      'v:%v > %v'
      'v:%v < %v'
      'vc:(%v)'
    ]
    logic: [
      'v:%v and %v'
      'v:%v or %v'
      'v:true'
      'v:false'
    ]
    control: [
      'ck:for [1..%v]%w'
      'ck:for %v in %v%w'
      'ck:for %v, %v in %v%w'
      'ck:if %v%w'
      'ck:if %v%w\nelse%w'
    ]
    variables: [
      'c:%v = %v'
      'c:%v += %v'
      'c:%v /= %v'
      'c:%v -= %v'
      'c:%v *= %v'
      'c:%v ?= %v'
    ]
    dialogs: [
      'c:alert(%v)'
      'vc:confirm(%v)'
      'vc:prompt(%v)'
    ]
    functions: [
      'v:(%v) ->%w'
      'c:%v = %v ->%w'
      'cr:return %v'
      'vc:%v(%v)'
    ]
    arrays: [
      'v:[]'
      'v:[%v..%v]'
      'v:%v[%v]'
      'vc:%v.push(%v)'
      'vc:%v.splice(%v, %v)'
      'v:%v[%v..%v]'
    ]
    objects: [
      'v:{}'
      'v:{%w\n}'
      'c:%v: %v'
      'v:%v[%v]'
      'v:%v.%v'
    ]
    comment: [
      'c:###%w\n###'
    ]
  }, coffee_blockify)
  $("#get").click ->
    $("#value").val editor.getValue()[3..].replace /\n  /g, '\n'
  
  $("#set").click ->
    editor.setValue $("#value").val()
  
  $("#run").click ->
    $("#value").val editor.getValue()[3..].replace /\n  /g, '\n'
    CoffeeScript.eval $("#value").val()
  
  window.editor = editor