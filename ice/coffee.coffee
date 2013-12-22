# Convenience reassignment
sub = ICE.sub

# For binding operator order precedence
op = (order, template) ->
  ICE.op order, template,
  (->
    first = new ICE.IceStaticSegment('(')
    last = new ICE.IceStaticSegment(')')
    this.children.unshift first
    this.children.push last),
  (->
    this.children.shift()
    this.children.pop()
  ),
  (block) ->
    console.log 'I was called...'
    if block.children().first().data('ice_tree') != this.children[0] #Hacky...
      if this.parenWrapped
        block.prepend(this.children[0].blockify()).append(this.children[this.children.length - 1].blockify())
      else
        block.children().first().remove()
        block.children().last().remove()


fitsAwait = (node) ->
  return node.variable.base.value is 'await' and
        node.args.length is 1 and
        node.args[0].constructor.name is 'Call' and
        node.args[0].args.length is 1 and
        node.args[0].args[0].constructor.name is 'Call' and
        node.args[0].args[0].variable.base.constructor.name is 'Literal' and
        node.args[0].args[0].variable.base.value is 'defer'

$.ajax
  url: 'coffee.frost'
  success: (frosting) ->
    coffee = ICE.frosting frosting
    window.coffee = coffee.categories
    coffee = coffee.all

    argIf = (template, name) ->
      return (args) ->
        if args.length is 1 then sub template, args[0]
        else sub coffee.CALL, name, args

    operators =
      '+': coffee.ADD
      '-': coffee.SUB
      '*': coffee.MUL
      '/': coffee.DIV
      '&&': coffee.AND
      '||': coffee.OR
      '===': coffee.IS
      '!==': coffee.ISNT
      '!': coffee.NOT
      '>': coffee.GREATER
      '<': coffee.LESSER


    # Generate operator precedences
    operator_preorder = [
      ['!'],
      ['*', '/'],
      ['+', '-'],
      ['>', '<'],
      ['===', '!==='],
      ['&&', '||']
    ]

    operator_order = {}

    for operator_block, i in operator_preorder
      for operator in operator_block
        operator_order[operator] = i

    reserved =
      'return': coffee.RETURN_VOID
      'break': coffee.BREAK
      'lastmousemove': coffee.LASTMOUSEMOVE

    special_functions =
      'write': argIf coffee.WRITE, 'write'
      'random': argIf coffee.RANDOM, 'random'
      'fd': argIf coffee.FD, 'fd'
      'bk': argIf coffee.BK, 'bk'
      'sin': argIf coffee.SIN, 'sin'
      'cos': argIf coffee.COS, 'cos'
      'speed': argIf coffee.SPEED, 'speed'
      'tick': (args) ->
        if args.length is 2 then  sub coffee.TICK, args[0], args[1]
        else sub coffee.CALL, 'tick', args[0]
      'moveto': (args) ->
        switch args.length
          when 1 then sub coffee.MOVETO_ONEARG, args[0]
          when 2 then sub coffee.MOVETO, args[0], args[1]
          else sub coffee.CALL, 'moveto', args
      'rt': (args) ->
        switch args.length
          when 1 then sub coffee.RT, args[0]
          when 2 then sub coffee.RT_ARC, args[0], args[1]
          else sub coffee.CALL, 'rt', args
      'lt': (args) ->
        switch args.length
          when 1 then sub coffee.LT, args[0]
          when 2 then sub coffee.LT_ARC, args[0], args[1]
          else sub coffee.CALL, 'lt', args
      'pen': (args) ->
        switch args.length
          when 1 then sub coffee.PEN, args[0]
          when 2 then sub coffee.PEN_THICK, args[0], args[1]
          else sub coffee.CALL, 'pen', args
      'dot': (args) ->
        switch args.length
          when 1 then sub coffee.DOT, args[0]
          when 2 then sub coffee.DOT_SIZE, args[0], args[1]
          else sub coffee.CALL, 'dot', args

    blockify = (node) ->
      switch node.constructor.name
        when 'Block'
          # Blocks are put into block elements
          new_block = new ICE.IceBlockSegment()
          for expr in node.expressions
            child = blockify expr
            child.parent = new_block
            new_block.children.push child
          return new_block
        
        when 'Value'
          if node.properties.length > 0
            # Some values are not literals, such as access and indices
            switch node.properties[0].constructor.name
              when 'Access' then sub coffee.ACCESS, blockify(node.base), blockify(node.properties[0].name)
              when 'Index' then sub coffee.INDEX, blockify(node.base), blockify(node.properties[0].index)
          else blockify node.base
        
        when 'Literal'
          # Literals are returned verbatim, unless they are special
          if node.value of reserved then sub reserved[node.value]
          else node.value

        when 'Call'
          variable = blockify node.variable
          if variable of special_functions
            # Some functions are reserved and parsed specially
            return special_functions[variable] (blockify(arg) for arg in node.args)
          else if fitsAwait node
            if node.args[0].args[0].args.length > 0
              # If we fit await x defer y, use a special block
              return sub coffee.AWAIT_DEFER_VAR, blockify(node.args[0].variable), blockify(node.args[0].args[0].args[0])
            else
              return sub coffee.AWAIT_DEFER, blockify(node.args[0].variable)
          else
            return sub coffee.CALL, blockify(node.variable), (blockify(arg) for arg in node.args)

        when 'Code'
          # A function definition
          return sub coffee.DEFUN, (blockify(param) for param in node.params), blockify(node.body)
        
        when 'Param' then blockify node.name # Params are passed straight to literals

        when 'Assign'
          # Assignation covers a bunch of different operations
          switch node.context
            when 'object' then sub coffee.DEF_PROPERTY, blockify(node.variable), blockify(node.value)
            when '+=' then sub coffee.VAR_ADD, blockify(node.variable), blockify(node.value)
            when '-=' then sub coffee.VAR_SUB, blockify(node.variable), blockify(node.value)
            when '*=' then sub coffee.VAR_MUL, blockify(node.variable), blockify(node.value)
            when '/=' then sub coffee.VAR_DIV, blockify(node.variable), blockify(node.value)
            else sub coffee.DEF_VARIABLE, blockify(node.variable), blockify(node.value)

        when 'For'
          # The for loop has a lot of different forms
          switch
            when node.object then sub coffee.FOR_OF, blockify(node.index), blockify(node.source), blockify(node.body)
            when node.index then sub coffee.FOR_IN_INDEX, blockify(node.name), blockify(node.index), blockify(node.source), blockify(node.body)
            when node.name then sub coffee.FOR_IN, blockify(node.name), blockify(node.source), blockify(node.body)
            else sub coffee.REPEAT, blockify(node.source.to), blockify(node.body) # This actually loses a lot! Careful now!
        
        when 'While' then sub coffee.WHILE, blockify(node.condition), blockify(node.body)

        when 'Range'
          # [x...y] ranges are inclusive or exclusive
          if node.exclusive then sub coffee.EXCLUSIVE_RANGE, blockify(node.from), blockify(node.to)
          else sub coffee.INCLUSIVE_RANGE, blockify(node.from), blockify(node.to)

        when 'Parens' then sub coffee.PARENS, blockify(node.body.unwrap())
        
        when 'Op'
          if not node.second? and node.operator == '-' then op 0, sub coffee.NEGATIVE, blockify(node.first) # Hack to deal with this case, since it is two operators at once
          else if node.second? then op operator_order[node.operator], sub operators[node.operator], blockify(node.first), blockify(node.second)
          else op operator_order[node.operator], sub operators[node.operator], blockify(node.first)

        when 'If'
          if node.elseBody? then sub coffee.IF_ELSE, blockify(node.condition), blockify(node.body), blockify(node.elseBody)
          else sub coffee.IF, blockify(node.condition), blockify(node.body)

        when 'Arr' then sub coffee.ARRAY, (blockify(object) for object in node.objects)

        when 'Obj'
          new_block = new ICE.IceBlockSegment()
          new_block.children.push(blockify(property)) for property in node.properties
          return sub coffee.OBJECT, new_block
        
        # A couple one-line things that happent to have their own types
        when 'Return' then sub coffee.RETURN, blockify(node.expression)
        when 'Bool' then node.val
        when 'Existence' then sub coffee.EXISTENCE, blockify(node.expression)
        
        # Once this is finished this default case should never occur.
        else
          new ICE.IceStaticSegment('unknown construct')
    window.coffee_blockify = (string) ->
      blockify CoffeeScript.nodes(string)
