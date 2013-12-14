# Convenience reassignment
sub = ICE.sub

fitsAwait = (node) ->
  return node.variable.base.value is 'await' and
        node.args.length is 1 and
        node.args[0].constructor.name is 'Call' and
        node.args[0].args.length is 1 and
        node.args[0].args[0].constructor.name is 'Call' and
        #node.args[0].args[0].variable.base.constructor.name is 'Literal' and
        node.args[0].args[0].variable.base.value is 'defer'

$.ajax
  url: 'coffee.frost'
  success: (frosting) ->
    coffee = ICE.frosting frosting
    window.coffee = coffee.categories
    coffee = coffee.all
    console.log coffee

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

    reserved =
      'return': coffee.RETURN_VOID
      'break': coffee.BREAK

    special_functions =
      'write': (args) ->
        if args.length is 1
          sub coffee.WRITE, args[0]
        else
          sub coffee.CALL, 'write', args
      'random': (args) ->
        if args.length is 1
          sub coffee.RANDOM, args[0]
        else
          sub coffee.CALL, 'write', args



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
            # If we fit await x defer y, use a special block
            return sub coffee.AWAIT, blockify(node.args[0].variable), blockify(node.args[0].args[0].args[0])
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
            else sub coffee.REPEAT, blockify(node.index), blockify(node.source), blockify(node.body)

        when 'Range'
          # [x...y] ranges are inclusive or exclusive
          if node.exclusive then sub coffee.EXCLUSIVE_RANGE, blockify(node.from), blockify(node.to)
          else sub coffee.INCLUSIVE_RANGE, blockify(node.from), blockify(node.to)

        when 'Parens' then sub coffee.PARENS, blockify(node.body.unwrap())
        
        when 'Op'
          if node.second? then sub operators[node.operator], blockify(node.first), blockify(node.second)
          else sub operators[node.operator], blockify(node.first)

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
          console.log 'dunno', node
          new ICE.IceStaticSegment('unknown construct')
    window.coffee_blockify = (string) ->
      blockify CoffeeScript.nodes(string)
