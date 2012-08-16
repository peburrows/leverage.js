describe 'Leverage.Template', ->
  beforeEach ->
    setFixtures('<div id="body"></div>');

  describe 'with the default settings', ->

    it 'should handle interpolation', ->
      template = new Leverage.Template( '{= name =}' );
      expect(template(name: 'phil')).toEqual('phil')

    it 'should properly escape HTML entities', ->
      template = new Leverage.Template( '{== name ==}' )
      expect(template(name: '<phil')).toEqual('&lt;phil')

    describe 'that has bindings', ->
      beforeEach ->
        @user = new Leverage.Model({name: 'Phil'})

      describe 'for object properties', ->
        beforeEach ->
          @template = new Leverage.Template('{=> user.name <=}')
          $('#body').append(@template(user: @user))

        it 'should the bound property in the proper tag with identifier', ->
          expect($('#body').find(':first')).toHaveClass('data-bind-' + @user.id + '-name')

        it 'should update the text when the object property', ->
          @user.set('name', 'Jimmy')
          expect($('#body').text()).toEqual('Jimmy')

      describe 'for naked variables', ->
        beforeEach ->
          @template = new Leverage.Template( '{=> name <=}' )
          $('#body').append(@template(@user))

        it 'should wrap the bound variable in the proper tag with identifier', ->
          expect($('#body').find(':first')).toHaveClass('data-bind-' + @user.id + '-name')

        it 'should update the text when the variable changes', ->
          @user.set('name', 'Jimmy')
          expect($('#body').text()).toEqual('Jimmy')
