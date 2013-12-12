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
    turtle: [
      'c:fd(%v)'
      'c:bk(%v)'
      'c:rt(%v)'
      'c:rt(%v, %v)'
      'c:lt(%v)'
      'c:lt(%v, %v)'
      'c:pen(%v)'
      'c:pen(%v, %v)'
      'c:dot(%v)'
      'c:dot(%v, %v)'
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
  
  $("#toggle").click ->
    editor.toggle()
  
  $("#run").click ->
    frames[0].location.reload()
    frame = $("iframe").load ->
        frames[0].CoffeeScript.eval editor.getValue()
        frame.unbind("load")
  
  # Example first program
  editor.setValue """
distance = (a,b) ->
  d = 0
  for char, i in a
    if char isnt b[i]
      d += 1
  return d
write('Guess the 5-letter secret in 20 guesses!')
secret = ''
for i in [1..5]
  secret += random('abcdefghijklmnopqrstuvwxyz'.split(''))
for i in [1..20]
  await(read(defer(guess)))
  if guess is secret
    write('You got it!')
    break
  else
    write('Nope! You are ' + distance(guess,secret) + ' letters off.')
write('The secret was: ' + secret)
"""

  window.editor = editor
