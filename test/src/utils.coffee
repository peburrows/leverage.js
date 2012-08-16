describe 'Leverage Utils', ->
  # need to make sure it works with a leverage model
  User = Leverage.Model.extend({})
  FullModule =
    instanceMethods: { instanceMethod: -> }
    classMethods:    { classMethod:    -> }
  SingleModule =
    method: ->

  beforeEach ->
    # reset the user
    User = ->

  describe 'a module that has the instanceMethods and classMethods properties', ->

    describe 'calling Class.include', ->
      user = null
      beforeEach ->
        User.include(FullModule)
        user = new User

      it 'should include instanceMethods', ->
        expect(user.instanceMethod).toEqual(jasmine.any(Function))

      it 'should extend classMethods', ->
        expect(User.classMethod).toEqual(jasmine.any(Function))

    describe 'calling Class.extend', ->
      user = null
      beforeEach ->
        User.extend(FullModule)
        user = new User

      it 'should include instanceMethods', ->
        expect(user.instanceMethod).toEqual(jasmine.any(Function))

      it 'should extend classMethods', ->
        expect(User.classMethod).toEqual(jasmine.any(Function))

  describe 'a module that does not have instanceMethods or classMethods properties', ->

    describe 'calling Class.include', ->
      user = null
      beforeEach ->
        User.include(SingleModule)
        user = new User

      it 'should add them as instance methods', ->
        expect(user.method).toEqual(jasmine.any(Function))

      it 'should not add them as class methods', ->
        expect(User.method).toEqual(undefined)

    describe 'calling Class.extend', ->
      user = null
      beforeEach ->
        User.extend(SingleModule)
        user = new User

      it 'should add them as class methods', ->
        expect(User.method).toEqual(jasmine.any(Function))

      it 'should not add them as instance methods', ->
        expect(user.method).toEqual(undefined)