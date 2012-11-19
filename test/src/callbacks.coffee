describe 'Leverage.Callbacks', ->
  beforeEach ->
    fullName = -> "#{@firstName} #{@lastName}"
    @User = Leverage.Model.extend(fullName: fullName.boundTo('firstNmae','lastName'))


  describe 'before callbacks', ->
    beforeEach ->
      @User.beforeCallback = ->
      spyOn(@User, 'beforeCallback').andCallThrough()
      @origProps = {}
      for attr, value of @User.prototype.fullName
        @origProps[attr] = value

      @User.before 'fullName', @User.beforeCallback

      @user = new @User(firstName:'Phil',lastName:'Burrows')


    it 'should properly fire the callback', ->
      @user.fullName()
      expect(@User.beforeCallback).toHaveBeenCalled()

    it 'should maintain all properties of the original function', ->
      for key, value of @origProps
        expect(@user.fullName[key]).not.toBeNull()
        expect(@user.fullName[key]).toEqual(@origProps[key])

    it 'should still fire callbacks when the bound properties are changed', ->
      spyOn(@user, 'trigger').andCallThrough()
      @user.set('firstName', 'Jimmy')
      @user.set('lastName', 'Allen')
      expect(@user.trigger).toHaveBeenCalledWith('change:fullName')
