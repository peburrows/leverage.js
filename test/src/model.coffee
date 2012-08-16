describe 'Leverage.Model', ->
  fullName = ->
  User = Leverage.Model.extend {
    fullName: fullName.boundTo('firstName', 'lastName')
  }

  beforeEach ->
    @user = new User
    spyOn(@user, 'trigger').andCallThrough()

  describe 'an instance', ->
    it "should have an id assigned", ->
      expect(@user.id).toBeDefined()

    it "should allow setting of attributes", ->
      @user.set('firstName', 'Phil')
      expect(@user.firstName).toEqual('Phil')

    it "should fire a change event when an attribute is set via the set method", ->
      @user.set('lastName', 'Burrows')
      expect(@user.trigger).toHaveBeenCalled()

    it "should fire change events on bound functions when props are changed", ->
      @user.set('firstName', 'Phil')
      expect(@user.trigger).toHaveBeenCalledWith('change:fullName')

