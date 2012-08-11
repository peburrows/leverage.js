describe 'Leverage.Template', ->
  describe 'with the default settings', ->

    it 'should handle interpolation', ->
      template = new Leverage.Template( '{= name =}' );
      expect(template(name: 'phil')).toEqual('phil')

    it 'should properly escape HTML entities', ->
      template = new Leverage.Template( '{== name ==}' )
      expect(template(name: '<phil')).toEqual('&lt;phil')

    describe 'that has bindings', ->
      # not exactly sure how to test this just yet
