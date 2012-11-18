describe 'Leverage.Class', ->
  Attrs = Leverage.Class.extend()
  FullModule =
    instanceMethods: { instanceMethod: -> }
    classMethods:    { classMethod:    -> }
  SingleModule =
    method: ->

  describe 'initialization', ->
    it "should allow me to set values via the constructor", ->
      attrs = new Attrs(name: 'phil', awesome: true)
      expect(attrs.name).toEqual('phil')
      expect(attrs.awesome).toEqual(true)

  describe 'extending', ->
    User = Leverage.Class.extend( initialize: (@name)-> )
    user = new User

    describe '.extend', ->
      it "should return a constructor", ->
        expect(User).toEqual(jasmine.any(Function))
        expect(user).toEqual(jasmine.any(Object))

    describe 'extending multiple modules', ->
      User.extend( initialize: -> @baseInit=true)
      multiUser = new User('phil')

      it "should call the parent class's initialize method", ->
        expect(multiUser.name).toEqual('phil')

  describe 'a module that has the instanceMethods and classMethods properties', ->
    describe 'calling Class.include', ->
      User = Leverage.Class.extend()
      User.include(FullModule)

      beforeEach ->
        @user = new User

      it 'should include instanceMethods', ->
        expect(@user.instanceMethod).toEqual(jasmine.any(Function))

      it 'should extend classMethods', ->
        expect(User.classMethod).toEqual(jasmine.any(Function))

    describe 'a module that does not have instanceMethods or classMethods properties', ->
      beforeEach ->
        @User = Leverage.Class.extend()

      describe 'calling Class.include', ->
        beforeEach ->
          @User.include(SingleModule)
          @user = new @User

        it 'should add them as instance methods', ->
          expect(@user.method).toEqual(jasmine.any(Function))

        it 'should not add them as class methods', ->
          expect(@User.method).toEqual(undefined)

