###
Copyright (c) 2013 Anthony Bau

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

###
moveSegment = (mobile, target) ->
  # Move a selection of things
  if mobile.is_selected_wrapper? and mobile.is_selected_wrapper
    if target?
      last_child = target
      for child in mobile.elements
        moveSegment child, last_child
        last_child = child
    else
      for child in mobile.elements
        moveSegment child, null
    return

  # If the mobile element is coming from another parent, detatch it
  if mobile.parent?
    if mobile.parent.type == 'block'
      mobile.parent.children.splice(mobile.parent.children.indexOf(mobile), 1)
      mobile.parent.droppable = true
    else
      mobile.parent.children.length = 0
      mobile.parent.droppable = true

  # Insert the mobile element in the target
  if target?
    if target.type == 'block'
      target.children.unshift mobile
      target.droppable = mobile.droppable = true
      mobile.parent = target
    else if target.type == 'statement' and target.parent?
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
      if typeof child == 'string' or child.constructor.name == 'String'
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
      if segment.parent? or block.parent().length == 0
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
      if typeof child == 'string' or child.constructor.name == 'String'
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
    @line_wrapped = false

  _reconstruct: -> new IceInlineSegment(@accept)

  stringify: ->
    if @line_wrapped
      return '\n  ' + (child.stringify() for child in @children).join('\n').replace(/\n/g, '\n  ')
    else
      string = ''
      for child in @children
        if typeof child == 'string'
          string += child
        else
          string += child.stringify()
      return string


  blockify: ->
    segment = this

    # Construct the block
    block = $ '<span>'
    block.addClass 'ice_segment'
    block.addClass 'ice_' + @type
    for child in @children
      if typeof child != 'string' and child.constructor.name != 'String'
        block.append child.blockify()

    # Associate it with us
    block.data 'ice_tree', segment

    # Contruct the input
    input = $ "<input>"
    input.addClass "ice_input"

    if typeof @children[0] == 'string'
      input.val @children[0]

    # Bind its keyup handler to us
    input.keyup ->
      if segment.droppable
        segment.children[0] = this.value
    
    # Append it to us
    block.append input

    @line_wrapped = false
    
    # Prepare the indent-for-readability handler
    lineWrap = =>
      if @line_wrapped
        return false
      # This is hacky.
      ghost_element = $('<div>')
      block.after ghost_element

      wrapper_div = $('<div>').addClass('ice_big_inline_wrapper')
      wrapper_div.append block
      
      # This is hacky.
      ghost_element.replaceWith wrapper_div
      @line_wrapped = true

    unWrap = =>
      if not @line_wrapped
        return false
      block.parent().replaceWith block
      @line_wrapped = false

    checkHeight = =>
      if (block.height() > 100 or block.has('.ice_block').length > 0) and not @line_wrapped
        lineWrap()
      else if (block.height() < 100 and block.has('.ice_block').length == 0) and @line_wrapped
        unWrap()

    checkHeightDelayed = ->
      # This is hacky.
      setTimeout checkHeight, 0

    $(document.body).mouseup(checkHeightDelayed).keydown(checkHeightDelayed)

    # This is hacky.
    setTimeout checkHeight, 0

    # This is hacky
    block.data('_ice_line_wrap_function', lineWrap)

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
          if ui.draggable.parent().hasClass('ice_block_command_wrapper')
            ui.draggable.parent().detach()
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
    '\n  ' + (child.stringify() for child in @children).join('\n').replace(/\n/g, '\n  ')
  
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
        block.append $('<div>').addClass('ice_block_command_wrapper').append child.blockify()
    
    # Blocks allow for the selector element
    block.mousedown (origin_event) ->
      target = $(origin_event.target)
      if target.is(this) or (target.parent().is(this) and target.hasClass('ice_block_command_wrapper')) or target.parent().hasClass('ice_selected_element_wrapper') or target.hasClass('ice_root_bottom_div')
        # Tear down the existent selection
        existentWrapper = $('.ice_selected_element_wrapper')
        if existentWrapper.parent().hasClass 'ice_block_command_wrapper'
          existentWrapper.parent().replaceWith existentWrapper.children()
        else
          existentWrapper.replaceWith existentWrapper.children()
        
        $('.ice_statement').filter('.ui-draggable').css('outline', '').data('overlapPos', null).draggable 'enable'
        $('.ice_drop_target, .ice_inline, .ice_block_drop_target').droppable 'enable'

        # Construct the selector element
        selector = $ '<div>'
        selector.addClass 'ice_selector'
        selector.data('overlapRerender', true)
        $(document.body).append selector
        corners selector, origin_event, origin_event

        selecting = true

        $(document.body).mouseup (origin_event) ->
          if selecting
            children = _this.children()
            selected_elements = []
            selected_parents = $('')
            last_child = null
            children.each(->
              true_block = $(this).children()
              if true_block.hasClass 'ice_statement'
                if overlap selector, true_block
                  last_child = true_block
                  selected_parents = selected_parents.add this
                else
                  true_block.css('outline', ''))

            if selected_parents.size() == 1
              selector.remove()
              last_child.find('.ice_statement').draggable 'disable'
              last_child.find('.ice_drop_target, .ice_inline, .ice_block_drop_target').droppable 'disable'
              last_child.draggable 'enable'
              selecting = false
              return
            
            first = selected_parents.first()
            last = selected_parents.last()
            selected_parents = first.nextUntil(last).andSelf().add(last)

            selected_parents.each(->
              true_block = $(this).children()
              if true_block.hasClass 'ice_statement'
                true_block.css('outline', '2px solid #FF0').find('.ice_statement').add(true_block).draggable 'disable'
                true_block.find('.ice_drop_target, .ice_inline, .ice_block_drop_target').droppable 'disable'
                selected_elements.push true_block.data 'ice_tree')

            selected_parents.wrapAll '<div>'
            wrapper_div = selected_parents.parent()
            wrapper_div.addClass 'ice_selected_element_wrapper'
            wrapper_div.draggable
              appendTo: 'body'
              helper: 'clone'
              revert: 'invalid'
              handle: '.ice_statement'
              start: (event, ui) ->
                ui.helper.addClass 'ui-helper'
              end: (event, ui) ->
                ui.helper.removeClass 'ui-helper'
            wrapper_div.data 'ice_tree', {
              syntax_type: 's'
              is_selected_wrapper: true
              elements: selected_elements
            }


            selector.remove()
            selecting = false
        
        _this = $(this)
        $(document.body).mousemove (event) ->
          if selecting
            corners selector, origin_event, event
            children = _this.children()
            children.each(->
              true_block = $(this).children()
              if true_block.hasClass 'ice_statement'
                if overlap selector, true_block
                  true_block.css('outline', '2px solid #FF0')
                else
                  true_block.css('outline', ''))
        
        return false


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
          tree = ui.draggable.data('ice_tree')
          if tree.parent? and tree.parent.type == 'block'
            ui.draggable.parent().detach()
          block.prepend $('<div>').addClass('ice_block_command_wrapper').append ui.draggable
          moveSegment tree, segment

    drop_target.click ->
      if segment.droppable
        new_block = new IceHandwrittenSegment()
        segment.children.unshift new_block
        new_block.parent = segment
        new_block_el = new_block.blockify()
        block.prepend $('<div>').addClass('ice_block_command_wrapper').append new_block_el
        new_block_el.find('.ice_input').focus()

    # Append it to the block
    block.append drop_target

    return block

class IceStatement extends IceSegment
  constructor: (template, type) ->
    @parent = null

    # Clone the template for this children array
    @children = []
    for child in template
      @children.push child.clone()
      child.parent = this

    @type = 'statement'
    @syntax_type = type
    @droppable = true

  _reconstruct: -> new IceStatement([], @syntax_type)

  blockify: ->
    segment = this

    # Construct the block
    block = $ '<div>'
    block.addClass 'ice_segment'
    block.addClass 'ice_' + @type
    block.addClass 'ice_syntax_type_' + if @syntax_type? then @syntax_type else 'cv'
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
          tree = ui.draggable.data('ice_tree')
          if tree.parent? and tree.parent.type == 'block'
            ui.draggable.parent().detach()
          if ui.draggable.parent().hasClass('ice_block_command_wrapper')
            ui.draggable.parent().detach()
          block.parent().after $('<div>').addClass('ice_block_command_wrapper').append ui.draggable
          moveSegment tree, segment
    
    drop_target.click ->
      if segment.droppable
        new_block = new IceHandwrittenSegment()
        segment.parent.children.splice(segment.parent.children.indexOf(segment) + 1, 0, new_block)
        new_block.parent = segment.parent
        new_block_el = new_block.blockify()
        block.parent().after $('<div>').addClass('ice_block_command_wrapper').append new_block_el
        new_block_el.find('.ice_input').focus()
    
    # Append it to the block
    block.append drop_target

    # Make the block draggable
    block.draggable
      appendTo: 'body'
      helper: 'clone'
      revert: 'invalid'
      start: (event, ui) ->
        ui.helper.addClass 'ui-helper'
      end: (event, ui) ->
        ui.helper.removeClass 'ui-helper'

    return block

class IceHandwrittenSegment extends IceStatement
  constructor: -> super []

  reblock: (new_block) ->
    @parent.children.splice @parent.children.indexOf(this), 1, new_block

  blockify: ->
    segment = this

    # Construct the block
    block = $ '<div>'
    block.addClass 'ice_segment'
    block.addClass 'ice_statement'
    block.addClass 'ice_handwritten'

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
          if ui.draggable.parent().hasClass('ice_block_command_wrapper')
            ui.draggable.parent().detach()
          block.parent().after $('<div>').addClass('ice_block_command_wrapper').append ui.draggable
    
    drop_target.click ->
      if segment.droppable
        new_block = new IceHandwrittenSegment()
        segment.parent.children.splice(segment.parent.children.indexOf(segment) + 1, 0, new_block)
        new_block.parent = segment.parent
        new_block_el = new_block.blockify()
        block.parent().after $('<div>').addClass('ice_block_command_wrapper').append new_block_el
        new_block_el.find('.ice_input').focus()
    
    # Append it to the block
    block.append drop_target

    # Make the block draggable
    block.draggable
      appendTo: 'body'
      helper: 'clone'
      revert: 'invalid'

    # Contruct the input
    input = $ "<input>"
    input.addClass "ice_input"

    # Bind its keyup handler to us
    input.keyup ->
      segment.children[0] = this.value

    input.keydown (event) ->
      console.log segment, segment.parent, segment.parent.type
      # Lots of keyboard shortcuts!
      if event.keyCode == 13 and segment.parent.type == 'block'
        # Create a new segment
        new_segment = new IceHandwrittenSegment segment.accepts

        # Splice it right after this one
        segment.parent.children.splice(segment.parent.children.indexOf(segment) + 1, 0, new_segment)
        new_segment.parent = segment.parent
        
        # Append it and focus it
        new_block = new_segment.blockify()
        block.parent().after $('<div>').addClass('ice_block_command_wrapper').append new_block
        new_block.find('.ice_input').focus()

      else if event.keyCode == 8 and this.value.length == 0
        # Delete this element and remove its tree
        prev = block.parent().prev().find('.ice_input')
        focal = if prev.length > 0 then prev else block.parent().parent().siblings().filter('.ice_handwritten .ice_input').first()
        
        segment.parent.children.splice(segment.parent.children.indexOf(segment), 1)
        
        if segment.parent._trembling and segment.parent.children.length == 0
          segment.parent.parent.children.pop()
          block.parent().parent().remove()
        
        focal.focus()

        block.parent().remove()
        return false
      
      else if event.keyCode == 9 and segment.parent.type == 'block'
        # See if there's a previous element with a last block
        p_prev = block.parent().prevAll('.ice_block_command_wrapper:first')
        prev = p_prev.find('.ice_segment').data('ice_tree')
        console.log p_prev, prev
        if not prev?
          return false
        
        # Remove us from our current situation
        segment.parent.children.splice(segment.parent.children.indexOf(segment), 1)


        for child in prev.children.slice(0).reverse()
          # If there is, append us to it
          if child.type == 'block'
            child.children.push segment
            segment.parent = child
            block.parent().detach()
            p_prev.children().children().filter('.ice_block').last().append $('<div>').addClass('ice_block_command_wrapper').append block
            input.focus()
            return false

        # Otherwise, make one
        new_parent = new IceBlockSegment()
        new_parent._trembling = true
        new_parent.parent = prev

        # Append its element to the statement's element
        new_block = new_parent.blockify()
        block.parent().detach()
        p_prev.children().first().append new_block
        new_block.append $('<div>').addClass('ice_block_command_wrapper').append block

        # Set this for removal later if necessary
        new_block.data 'trembling', true

        # Link it into the tree
        prev.children.push new_parent
        new_parent.children.push segment
        segment.parent = new_parent

        input.focus()
        return false

    # Append it to us
    block.append input

    input.autoGrowInput
      comfortZone: 0
      minWidth: 20
      maxWidth: Infinity

    return block

corners = (element, a, b) ->
  x = [a.pageX, b.pageX]
  y = [a.pageY, b.pageY]
  x.sort((a, b) -> a - b)
  y.sort((a, b) -> a - b)
  element.css
    left: x[0]
    top: y[0]
    width: x[1] - x[0]
    height: y[1] - y[0]

genPosData  = (el) ->
  pos = el.data('overlapPos')
  if not el.data('overlapRerender')? and el.data('overlapPos')?
    return pos
  else
    pos = {}
    pos.head = el.offset()
    pos.tail =
        left: pos.head.left + el.width()
        top: pos.head.top + el.height()
    el.data 'overlapPos', pos
    return pos


overlap = (a, b) ->
  a_pos = genPosData a
  b_pos = genPosData b

  # Overlap iff a corner is inside the other rectangle.
  return a_pos.head.left < b_pos.tail.left and b_pos.head.left < a_pos.tail.left and a_pos.head.top < b_pos.tail.top and b_pos.head.top < a_pos.tail.top

class IceEditor
  constructor: (element, templates, blockifier) ->
    @mode = 'block'
    @element = $ element

    @editor_el = document.createElement('div')
    $(@editor_el).css # Ace overrides our class, so we set css here
      position: 'absolute'
      display: 'none'
      top: 0
      bottom: 0
      left: 0
      right: 0
      'line-height': '20px'

    @element.append @editor_el
    
    @editor = ace.edit @editor_el
    @editor.setTheme 'ace/theme/chrome'
    @editor.setFontSize 15
    @editor.getSession().setUseWorker false
    @editor.getSession().setMode 'ace/mode/coffee'
    @editor.getSession().setTabSize 2
    @editor.getSession().setUseSoftTabs true

    # Construct the palette
    @palette = $ '<div>'
    @palette.addClass 'ice_palette blockish'
    for title, section of templates
      details = $('<details>').addClass 'ice_palette_detail'
      details.append $('<summary>').text title
      blocks = (defrost template, [] for template in section)
      for block in blocks
        details.append $('<div>').addClass('ice_palette_template_wrapper').append block.templateify()
      @palette.append details
    @palette.droppable
      greedy: true
      tolerance: 'pointer'
      hoverClass: 'highlight'
      accept: (drop) -> true
      drop: (event, ui) ->
        if ui.draggable.parent().hasClass('ice_block_command_wrapper')
          ui.draggable.parent().detach()
        moveSegment ui.draggable.data('ice_tree'), null
        ui.draggable.detach()
        ui.draggable.trigger 'dragstop'
        ui.draggable.remove()

    # Construct the workspace
    @workspace = $ '<div>'
    @workspace.addClass 'ice_workspace blockish'
    @root = new IceBlockSegment()
    @root_element = @root.blockify()
    @workspace.append @root_element

    # The color-tester hack. This is hacky.
    @color_tester = $("<div>").addClass 'color-tester'
    @element.append @color_tester
    
    bottom_div = @bottom_div = $ '<div>'
    bottom_div.addClass 'ice_root_bottom_div'

    @root_element.append bottom_div

    _this = this
    
    bottom_div.droppable
      greedy: true
      tolerance: 'pointer'
      hoverClass: 'highlight'
      accept: (drop) -> true
      drop: (event, ui) ->
        moveSegment ui.draggable.data('ice_tree'), if _this.root.children.length > 0 then _this.root.children[_this.root.children.length - 1] else _this.root
        if ui.draggable.parent().hasClass('ice_block_command_wrapper')
          ui.draggable.parent().detach()
        bottom_div.before $('<div>').addClass('ice_block_command_wrapper').append ui.draggable

    checkHeight = ->
      setTimeout (->
        last_element = _this.root_element.children().filter('.ice_block_command_wrapper, .ice_selected_element_wrapper').last()
        last_element_bottom_edge = if last_element.length > 0 then last_element.position().top + last_element.height() else 5
        bottom_div.height _this.root_element.height() - last_element_bottom_edge), 0

    attempt_reblock = ->
      $('.ice_handwritten').not('.ice_handwritten .ice_handwritten').each(->
        tree = $(this).data 'ice_tree'
        try
          # This first-child hack is because we right now require blockifiers to wrap their entire thing in an IceBlock statement... We might want to be a bit more elegant. Or not.
          block = (blockifier tree.stringify()).children[0]
          block.parent = tree.parent
          tree.parent.children.splice tree.parent.children.indexOf(tree), 1, block
          $(this).replaceWith block.blockify()
        catch error
          console.log error
      )

    $(document.body).mouseup(checkHeight).mouseup(attempt_reblock).keydown(checkHeight).keydown((event) -> if event.keyCode in [13, 9] then attempt_reblock())

    # Append them to the element
    @element.append(@palette).append(@workspace).append @selector

    @blockifier = blockifier

  getValue: ->
    if @mode is 'block'
      return @root.stringify()[3..].replace /\n  /g, '\n'
    else
      return @editor.getValue()

  setValue: (value) ->
    # Destroy everything
    @workspace.html ''

    # Insert everything
    @root = @blockifier value
    @root_element = @root.blockify()
    @workspace.append @root_element
    
    bottom_div = @bottom_div = $ '<div>'
    bottom_div.addClass 'ice_root_bottom_div'

    @root_element.append bottom_div

    _this = this
    
    bottom_div.droppable
      greedy: true
      tolerance: 'pointer'
      hoverClass: 'highlight'
      accept: (drop) -> true
      drop: (event, ui) ->
        moveSegment ui.draggable.data('ice_tree'), if _this.root.children.length > 0 then _this.root.children[_this.root.children.length - 1] else _this.root
        if ui.draggable.parent().hasClass('ice_block_command_wrapper')
          ui.draggable.parent().detach()
        bottom_div.before $('<div>').addClass('ice_block_command_wrapper').append ui.draggable

    checkHeight = ->
      setTimeout (->
        last_element = _this.root_element.children().filter('.ice_block_command_wrapper, .ice_selected_element_wrapper').last()
        last_element_bottom_edge = if last_element.length > 0 then last_element.position().top + last_element.height() else 5
        bottom_div.height _this.root_element.height() - last_element_bottom_edge), 0

    $(document.body).mouseup(checkHeight).keydown(checkHeight)
    @editor.setValue value

  melt: ->
    if @mode isnt 'block'
      return false

    @mode = 'transitioning'

    @palette.css('border', 'none').animate {
      width: 'toggle'
      opacity: 'toggle'
    }, 1200
    @workspace.animate {
      'background-color': $.Color('#FFF')
      'left': 0
      'padding-left': 60
    }, 1200
    @root_element.find('.ice_segment, .ice_input').andSelf().animate {
      'border-width': 0
      'background-color': 'transparent'
      'padding': 0
      'min-height': 0
      'min-width': 0
    }, 1200, =>
      @workspace.hide()
      $(@editor_el).show()
      new_value = @root.stringify()[3..].replace /\n  /g, '\n'
      @editor.setValue new_value, 1
      @mode = 'text'

    @root_element.find('.ice_segment, .ice_input').css 'height', 'auto'

  freeze: ->
    if @mode isnt 'text'
      return false
    
    @mode = 'transitioning'

    $(@editor_el).hide()
    @workspace.show()
    @setValue @editor.getValue()
    @workspace.css('background-color', '#FFF').find('.ice_input').each(->
      $(this).data('_autogrow_check_function')()
    )
    segments = @root_element.find('.ice_segment').andSelf().css
      'background-color': 'transparent'
      'padding': 0
      'border-width': 0
    inputs = @root_element.find('.ice_input').css(
      'background-color': 'transparent'
    )

    setTimeout (=>
      @palette.css('border', '').animate {
        opacity: 'toggle'
        width: 'toggle'
        queue: false
      }, 1200, =>
        @mode = 'block'
      
      @workspace.animate {
        'background-color': '#DDD'
        'left': 200
        'padding-left': 0
      }, 1200

      @root_element.find('.ice_inline').each ->
        if $(this).has('.ice_block').length > 0
          $(this).data('_ice_line_wrap_function')()

      inputs.animate
        'background-color': '#FFF'
      
      setTimeout (=>
        segments.each ->
          $(this).css
            'background-color': ''
            'padding': ''
            'border-width': ''
          color = $(this).css 'background-color'
          padding = $(this).css 'padding'
          border = $(this).css 'border-width'
          $(this).css
            'background-color': 'transparent'
            'padding': 0
            'border-width': 0
          $(this).animate {
            'background-color': color
            'padding': padding
            'border-width': border
          }, 1200
      ), 0
    ), 100 # We pause a bit for aesthetics

    return true
  
  toggle: ->
    if @mode == 'block'
      @melt()
    else if @mode == 'text'
      @freeze()
    else
      return false

defrost = (frosting, args) ->
  statement = new IceStatement([], frosting[..frosting.indexOf(':')-1])

  frosting = frosting[frosting.indexOf(':')+1..]
  
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
        inline = null
        (->
          _char = char
          inline = new IceInlineSegment((segment) -> (not segment?) or (not segment.syntax_type?) or _char in segment.syntax_type)
        )()

        argument = args.shift()
        if argument?
          if typeof argument == 'string'
            inline.children.push argument
            inline.droppable = true
          else
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

###
# CoffeeScript blockifier... shouldn't be here by rights
###

# Non-exhaustive list of operators
coffee_operators =
  '++': 'c:%v++'
  '--': 'c:%v--'
  '+': 'v:%v + %v'
  '-': 'v:%v - %v'
  '/': 'v:%v / %v'
  '*': 'v:%v * %v'
  '&&': 'v:%v and %v'
  '||': 'v:%v or %v'
  '===': 'v:%v is %v'
  '!==': 'v:%v isnt %v'
  '!': 'v:not %v'
  '?': 'v:%v?'

coffee_reserved = [
  'return'
  'break'
]

blockify = (node) ->
  if node.constructor.name == 'Block'
    new_block = new IceBlockSegment()
    for expr in node.expressions
      child = blockify expr
      child.parent = new_block
      new_block.children.push child
    return new_block
  else if node.constructor.name == 'Value'
    if node.properties.length > 0 and node.properties[0].constructor.name == 'Access'
      return defrost 'v:%v.%v', [blockify(node.base), blockify(node.properties[0].name)]
    else if node.properties.length > 0 and node.properties[0].constructor.name == 'Index'
      return defrost 'v:%v[%v]', [blockify(node.base), blockify(node.properties[0].index)]
    else
      return blockify node.base
  else if node.constructor.name == 'Literal'
    if node.value in coffee_reserved
      return defrost 'cr:' + node.value.replace(/%/g, '%%'), []
    else
      return node.value
  else if node.constructor.name == 'Call'
    return defrost 'cv:%v(' + ('%v' for arg in node.args).join(',') + ')', [blockify node.variable].concat(blockify(arg) for arg in node.args)
  else if node.constructor.name == 'Code'
    return defrost 'v:(' + ('%v' for param in node.params).join(',') + ') ->%w', (blockify(param) for param in node.params).concat [blockify node.body]
  else if node.constructor.name == 'Param'
    return blockify node.name
  else if node.constructor.name == 'Assign'
    if node.context? and node.context == 'object'
      return defrost 'c:%v: %v', [blockify(node.variable), blockify(node.value)]
    else
      return defrost "c:%v #{if node.context? then node.context else '='} %v", [blockify(node.variable), blockify(node.value)]
  else if node.constructor.name == 'For'
    if node.object
      return defrost 'ck:for %v of %v%w', [blockify(node.index), blockify(node.source), blockify(node.body)]
    if node.index
      return defrost 'ck:for %v, %v in %v%w', [blockify(node.name), blockify(node.index), blockify(node.source), blockify(node.body)]
    if node.name
      return defrost 'ck:for %v in %v%w', [blockify(node.name), blockify(node.source), blockify(node.body)]
    else
      return defrost 'ck:for %v%w', [blockify(node.source), blockify(node.body)]
  else if node.constructor.name == 'Range'
    return defrost (if node.exclusive then 'v:[%v...%v]' else 'v:[%v..%v]'), [blockify(node.from), blockify(node.to)]
  else if node.constructor.name == 'Parens'
    return defrost 'cv:(%v)', [blockify(node.body.unwrap())]
  else if node.constructor.name == 'Op'
    if node.second
      return defrost coffee_operators[node.operator], [blockify(node.first), blockify(node.second)]
    else
      return defrost coffee_operators[node.operator], [blockify(node.first)]
  else if node.constructor.name == 'If'
    if node.elseBody?
      return defrost 'ck:if %v%w\nelse%w', [blockify(node.condition), blockify(node.body), blockify(node.elseBody)]
    else
      return defrost 'ck:if %v%w', [blockify(node.condition), blockify(node.body)]
  else if node.constructor.name == 'Arr'
    return defrost 'v:[' + ('%v' for object in node.objects).join(',') + ']', (blockify(object) for object in node.objects)
  else if node.constructor.name == 'Obj'
    new_block = new IceBlockSegment()
    new_block.children.push(blockify(property)) for property in node.properties
    return defrost 'v:{%w\n}', [new_block]
  else if node.constructor.name == 'Return'
    return defrost 'cr:return %v', [blockify(node.expression)]
  else if node.constructor.name == 'Bool'
    return node.val
  else if node.constructor.name == 'Existence'
    return defrost 'v:%v?', [blockify(node.expression)]

window.IceEditor = IceEditor
window.coffee_blockify = (str) -> blockify CoffeeScript.nodes str
window.defrost = defrost

