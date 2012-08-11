describe 'Leverage.Class', ->
  User = Leverage.Class.extend({})
  user = new User

  describe '.extend', ->
    it "should return a constructor", ->
      expect(User).toEqual(jasmine.any(Function))
      expect(user).toEqual(jasmine.any(Object))