describe 'Leverage.Class', ->
  describe 'initialization', ->
    Attrs = Leverage.Class.extend()

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
      User.extend( initialize: -> )
      multiUser = new User('phil')

      it "should call the parent class's initialize method", ->
        expect(multiUser.name).toEqual('phil')

