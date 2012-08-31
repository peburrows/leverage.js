describe 'Leverage.Class', ->
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

