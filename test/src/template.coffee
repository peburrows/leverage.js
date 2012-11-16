boundClass = (id, prop) ->
  "data-bind-#{id}-#{prop}"

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

    describe 'that has one way bindings', ->
      beforeEach ->
        @user = new Leverage.Model({name: 'Phil'})

      describe 'for object properties', ->
        beforeEach ->
          @template = new Leverage.Template('{=> user.name <=}')
          $('#body').html(@template(user: @user))

        it 'should the bound property in the proper tag with identifier', ->
          expect($('#body').find(':first')).toHaveClass(boundClass(@user.id, 'name'))

        it 'should update the text when the object property', ->
          @user.set('name', 'Jimmy')
          expect($('#body').text()).toEqual('Jimmy')

      describe 'for naked variables', ->
        beforeEach ->
          @template = new Leverage.Template( '{=> name <=}' )
          $('#body').html(@template(@user))

        it 'should wrap the bound variable in the proper tag with identifier', ->
          expect($('#body').find(':first')).toHaveClass(boundClass(@user.id, 'name'))

        it 'should update the text when the variable changes', ->
          @user.set('name', 'Jimmy')
          expect($('#body').text()).toEqual('Jimmy')

      describe 'for bound functions', ->
        beforeEach ->
          fullName = -> "#{@firstName} #{@lastName}"
          User = Leverage.Model.extend {
            firstName : 'Phil'
            lastName  : 'Burrows'
            fullName  : fullName.boundTo('firstName', 'lastName')
          }

          @user = new User
          @template = new Leverage.Template( '{=> user.fullName() <=}' )
          $('#body').html(@template(user:@user))

        it 'should wrap the bound function in the proper tag with identifier', ->
          expect($('#body > :first')).toHaveClass(boundClass(@user.id, 'fullName'))

        it 'should, of course, render the proper text', ->
          expect($('#body').text()).toEqual(@user.fullName())

        it 'should update the text when either variable changes', ->
          @user.set('firstName', 'P.')
          expect($('#body').text()).toEqual(@user.fullName())
          @user.set('lastName', 'B.')
          expect($('#body').text()).toEqual(@user.fullName())

    describe 'that has template --> model bindings', ->
      beforeEach ->
        User = Leverage.Model.extend()
        @user = new User({name: 'Phil'})
        @template = new Leverage.Template('<input type="text" value="{<= user.name =>}">')
        $('#body').html(@template(user: @user))

      it 'should render the initial value in the template', ->
        expect( $('#body input').val() ).toEqual('Phil');


