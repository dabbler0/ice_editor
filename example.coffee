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
