describe 'Leverage.Model', ->
  fullName = -> "#{@firstName} #{@lastName}"
  User = Leverage.Model.extend {
    fullName: fullName.boundTo('firstName', 'lastName')
    nameObj:  -> {first: @firstName, last: @lastName}
  }

  beforeEach ->
    @user = new User(firstName: 'Jimmy', lastName: 'Allen')
    spyOn(@user, 'trigger').andCallThrough()

  describe 'an instance', ->
    it "should have an id assigned", ->
      expect(@user._leverageID).toBeDefined()

    describe '#get', ->
      it "should allow the getting of attributes", ->
        @user.set('firstName', 'Phil')
        expect(@user.get('firstName')).toEqual('Phil')

      it "should allow the getting of functions", ->
        expect(@user.get('fullName()')).toEqual(@user.fullName())

      it "should allow the getting of attributes by way of a function", ->
        expect(@user.get('nameObj().first')).toEqual(@user.firstName)
        expect(@user.get('nameObj().last')).toEqual(@user.lastName)

    it "should allow setting of attributes", ->
      @user.set('firstName', 'Phil')
      expect(@user.firstName).toEqual('Phil')

    it "should fire a change event when an attribute is set via the set method", ->
      @user.set('lastName', 'Burrows')
      expect(@user.trigger).toHaveBeenCalled()

    it "should fire change events on bound functions when props are changed", ->
      @user.set('firstName', 'Phil')
      expect(@user.trigger).toHaveBeenCalledWith('change:fullName')
      expect(@user.trigger).toHaveBeenCalledWith('change:firstName', 'Phil')

