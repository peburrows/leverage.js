boundClass = (id, prop) ->
  "data-bind-#{id}-#{prop}"

describe 'Leverage.Template', ->
  beforeEach ->
    setFixtures('<div id="body"></div>');
    fullName = -> "#{@firstName} #{@lastName}"
    @User = Leverage.Model.extend {
      firstName : 'Phil'
      lastName  : 'Burrows'
      fullName  : fullName.boundTo('firstName', 'lastName')
    }

  describe 'with the default settings', ->

    it 'should handle interpolation', ->
      template = new Leverage.Template( '{= name =}' );
      expect(template(name: 'phil')).toEqual('phil')

    it 'should properly escape HTML entities', ->
      template = new Leverage.Template( '{== name ==}' )
      expect(template(name: '<phil')).toEqual('&lt;phil')

    describe 'that has data way bindings', ->
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
          @user = new @User
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

        describe 'AND object properties', ->
          beforeEach ->
            @user2 = new @User
            @bothTemplate = new Leverage.Template('<span id="first">{=> user.firstName <=}</span><span id="full">{=> user.fullName() <=}</span>')
            $('#body').html( @bothTemplate(user: @user2) )

          it 'should update the property', ->
            @user2.set('firstName', 'Jimmy')
            expect($('#first').text()).toEqual('Jimmy')

          it 'should update the bound function on property change', ->
            @user2.set('firstName', 'Alex')
            expect($('#full').text()).toEqual(@user2.fullName())

          it 'should update both', ->
            @user2.set('firstName', 'Geraldo')
            expect($('#first').text()).toEqual('Geraldo')
            expect($('#full').text()).toEqual(@user2.fullName())

    describe 'when dealing with multiple templates', ->
      beforeEach ->
        @user = new @User
        @templates =
          first: new Leverage.Template('<span id="first-1">{=> user.firstName <=}</span>')
          last:  new Leverage.Template('<span id="last-1">{=> user.lastName <=}</span>')
          full:  new Leverage.Template('<span id="full-1">{=> user.fullName() <=}</span>')
          all:   new Leverage.Template('<span id="first-2">{=> user.firstName <=}</span><span id="last-2">{=> user.lastName <=}</span><span id="full-2">{=> user.fullName() <=}</span>')

        $('#body').html( @templates.first(user:@user) +
                         @templates.last(user:@user) +
                         @templates.full(user:@user) +
                         @templates.all(user:@user))


      it 'should update all templates with bound properties', ->
        @user.set('firstName', 'Bro')
        expect( @user.firstName ).toEqual('Bro')
        expect( $('#first-1').text() ).toEqual(@user.firstName)
        expect( $('#first-2').text() ).toEqual(@user.firstName)

      it 'should update all templates with bound functions', ->
        @user.set('lastName', 'Dude')
        expect( @user.lastName ).toEqual('Dude')
        expect( $('#full-1').text() ).toEqual(@user.fullName())
        expect( $('#full-1').text() ).toEqual($('#full-2').text())

      it 'should update *all* bound properties and functions', ->
        @user.set('firstName', 'Jimmy').set('lastName', 'Allen')
        expect( $('#first-1').text() ).toEqual(@user.firstName)
        expect( $('#first-2').text() ).toEqual(@user.firstName)
        expect( $('#last-1').text() ).toEqual(@user.lastName)
        expect( $('#last-2').text() ).toEqual(@user.lastName)
        expect( $('#full-1').text() ).toEqual(@user.fullName())
        expect( $('#full-2').text() ).toEqual(@user.fullName())

    describe 'that has template --> model bindings', ->
      it 'should render the initial value in the template', ->
        template = new Leverage.Template('<input type="text" value="{<= user.name =>}">')
        $('#body').html(template(user:{name: 'Phil'}))
        expect( $('#body input').val() ).toEqual('Phil');

      describe 'for naked variables', ->
        beforeEach ->
          User = Leverage.Model.extend()
          @user = new User({name: 'Phil'})
          @template = new Leverage.Template('<input type="text" value="{<= user.name =>}">')
          $('#body').html(@template(user: @user))

        it 'should render the initial value in the template', ->
          expect( $('#body input').val() ).toEqual('Phil');
        it 'should update the model when the input changes', ->
          $('#body input').val('Jimmy')
          $('#body input').trigger('change', 'Jimmy')
          expect( @user.name ).toEqual('Jimmy')




