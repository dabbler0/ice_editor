moveSegment = (mobile, target) ->
  console.log target.droppable
  # If the mobile element is coming from another parent, detatch it
  if mobile.parent?
    if mobile.parent.type == 'block'
      mobile.parent.children.splice(mobile.parent.children.indexOf(mobile), 1)
      mobile.parent.droppable = true
    else
      mobile.parent.children.length = 0
      mobile.parent.droppable = true

  # Insert the mobile element in the target
  if target.type == 'block'
    target.children.unshift mobile
    target.droppable = mobile.droppable = true
    mobile.parent = target
  else if target.type == 'statement'
    target.parent.children.splice(target.parent.children.indexOf(target)+1, 0, mobile)
    target.droppable = mobile.droppable = true
    mobile.parent = target.parent
  else if target.type == 'inline'
    target.children = [mobile]
    target.droppable = mobile.droppable = false
    mobile.parent = target

class IceSegment
  constructor: ->
    @parent = null
    @index = 0
    @children = []
    @type = null

  _reconstruct: -> new IceSegment()

  stringify: ->
    string = ''
    for child in @children
      if typeof child == 'string'
        string += child
      else
        string += child.stringify()
    return string
  
  clone: ->
    copy = this._reconstruct()
    copy.type = @type
    copy.children = []
    for child in @children
      if typeof child == 'string'
        copy.children.push child
      else
        child_clone = child.clone()
        child_clone.parent = copy
        copy.children.push child_clone
    if this.droppable?
      copy.droppable = this.droppable
    return copy
  
  templateify: ->
    block = @blockify()
    segment = this
    new_block = null
    block.on 'dragstart', ->
      clone = segment.clone()
      new_block = clone.templateify()
      new_block.hide()
      block.after new_block
      block.unbind 'dragstart'
    block.on 'dragstop', ->
      if segment.parent?
        new_block.show()
        block.unbind 'dragstop'

class IceStaticSegment extends IceSegment
  constructor: (text) ->
    @parent = null
    @index = 0
    @children = [text]
    @type = 'static'

  _reconstruct: -> new IceStaticSegment()

  blockify: ->
    block = $ '<span>'
    block.addClass 'ice_segment'
    block.addClass 'ice_' + @type
    for child in @children
      if typeof child == 'string'
        block.append child
      else
        block.append child.blockify()
    return block


class IceInlineSegment extends IceSegment
  constructor: (accept) ->
    @parent = null
    @index = 0
    @children = []
    @type = 'inline'
    @accept = accept
    @droppable = true

  _reconstruct: -> new IceInlineSegment(@accept)

  blockify: ->
    segment = this

    # Construct the block
    block = $ '<span>'
    block.addClass 'ice_segment'
    block.addClass 'ice_' + @type
    for child in @children
      if typeof child == 'string'
        block.append child
      else
        block.append child.blockify()

    # Associate it with us
    block.data 'ice_tree', segment

    # Contruct the input
    input = $ "<input>"
    input.addClass "ice_input"

    # Bind its keyup handler to us
    input.keyup ->
      if segment.droppable
        segment.children[0] = this.value
    
    # Append it to us
    block.append input

    input.autoGrowInput
      comfortZone: 0
      minWidth: 20
      maxWidth: Infinity
    
    # Make us droppable
    block.droppable
      greedy: true
      tolerance: 'pointer'
      hoverClass: 'highlight'
      accept: (drop) -> segment.droppable and segment.accept drop.data 'ice_tree'
      drop: (event, ui) ->
        if event.target == this
          input.val ""
          moveSegment ui.draggable.data('ice_tree'), segment
          $(this).prepend ui.draggable

    return block

class IceBlockSegment extends IceSegment
  constructor: ->
    @parent = null
    @index = 0
    @children = []
    @type = 'block'
    @droppable = true

  _reconstruct: -> new IceBlockSegment()

  stringify: ->
    console.log 'Blockifying', @children
    '  ' + (child.stringify() for child in @children).join('\n').replace(/\n/g, '\n  ')
  
  blockify: ->
    segment = this

    # Construct the block
    block = $ '<div>'
    block.addClass 'ice_segment'
    block.addClass 'ice_' + @type
    for child in @children
      if typeof child == 'string'
        block.append child
      else
        block.append $('<div>').append child.blockify()

    # Create the drop target
    drop_target = $ '<div>'
    drop_target.addClass 'ice_block_drop_target'
    
    # Make it droppable
    drop_target.droppable
      greedy: true
      tolerance: 'pointer'
      hoverClass: 'highlight'
      accept: -> segment.droppable
      drop: (event, ui) ->
        if event.target == this
          moveSegment ui.draggable.data('ice_tree'), segment
          block.prepend $('<div>').append ui.draggable

    # Append it to the block
    block.append drop_target

    return block

class IceStatement extends IceSegment
  constructor: (template) ->
    @parent = null

    # Clone the template for this children array
    @children = []
    for child in template
      @children.push child.clone()

    @type = 'statement'
    @droppable = true

  _reconstruct: -> new IceStatement([])

  blockify: ->
    segment = this

    # Construct the block
    block = $ '<div>'
    block.addClass 'ice_segment'
    block.addClass 'ice_' + @type
    for child in @children
      if typeof child == 'string'
        block.append child
      else
        block.append child.blockify()

    # Associate it with us
    block.data 'ice_tree', segment

    # Create the drop target
    drop_target = $ '<div>'
    drop_target.addClass 'ice_drop_target'
    
    # Make it droppable
    drop_target.droppable
      greedy: true
      tolerance: 'pointer'
      hoverClass: 'highlight'
      accept: -> segment.droppable
      drop: (event, ui) ->
        if event.target == this
          moveSegment ui.draggable.data('ice_tree'), segment
          block.after $('<div>').append ui.draggable
    
    # Append it to the block
    block.append drop_target

    # Make the block draggable
    block.draggable
      appendTo: 'body'
      helper: 'clone'
      revert: 'invalid'

    return block

class IceEditor
  constructor: (element, templates) ->
    @element = $ element

    # Construct the palette
    @palette = $ '<div>'
    @palette.addClass 'ice_palette blockish'
    for template in templates
      @palette.append $('<div>').append template.templateify()

    # Construct the workspace
    @workspace = $ '<div>'
    @workspace.addClass 'ice_workspace blockish'
    @root = new IceBlockSegment()
    @workspace.append @root.blockify()

    # Append them to the element
    @element.append(@palette).append(@workspace)

  getValue: ->
    return @root.stringify()

defrost = (frosting, args) ->
  statement = new IceStatement([])
  
  # Parse
  current = ''
  escaped = false
  for char in frosting
    if escaped
      if char == '%'
        current += '%'
      else if char == 'w'
        # Finish up the current segment
        statement.children.push new IceStaticSegment(current)

        # Make the block
        argument = args.shift()
        clone = if argument? then argument.clone() else new IceBlockSegment()
        clone.parent = statement
        statement.children.push clone

        # Start a new segment
        current = ''
      else
        # Finish up the current element
        statement.children.push new IceStaticSegment(current)
        
        # Make the inline socket
        inline = new IceInlineSegment(-> true)
        argument = args.shift()
        if argument?
          argument.parent = inline
          inline.children.push argument
          argument.droppable = false
          inline.droppable = false
        statement.children.push inline

        # Start a new segment
        current = ''
      escaped = false
    else
      if char == '%'
        escaped = true
      else
        current += char

  statement.children.push new IceStaticSegment(current)

  return statement

# CoffeeScript blockifier... shouldn't be here by rights

blockify = (node) ->
  if node.constructor.name == 'Block'
    new_block = new IceBlockSegment()
    for expr in node.expressions
      child = blockify expr
      child.parent = new_block
      new_block.children.push child
    return new_block
  else if node.constructor.name == 'Value'
    return blockify node.base
  else if node.constructor.name == 'Literal'
    return new IceStatement([new IceStaticSegment node.value])
  else if node.constructor.name == 'Call'
    return defrost '%v(' + ['%v' for arg in node.args].join(',') + ')', [blockify node.variable].concat blockify arg for arg in node.args
  else if node.constructor.name == 'Code'
    return defrost '(' + ['%v' for param in node.params].join(',') + ') ->\n%w', (blockify param for param in node.params).concat [blockify node.body]

window.blockify = blockify

# Testing
window.onload = ->
  addition = defrost('(%v + %v)', [null, null])
  multiplication = defrost("(%v * %v)", [null, null])
  nodie = blockify(CoffeeScript.nodes "->\n  a b").children[0]
  nodie.parent = null
  editor = new IceEditor(document.getElementById('editor'), [addition, multiplication, nodie])
  window.editor = editor
