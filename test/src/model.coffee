describe 'Leverage.Model', ->
  fullName = ->
  User = Leverage.Model.extend {
    fullName: fullName.boundTo('firstName', 'lastName')
  }
  user = new User

  beforeEach ->
    spyOn(user, 'trigger').andCallThrough()

  it ".extend should return a constructor", ->
    expect(User).toEqual(jasmine.any(Function))

  it "should allow setting of attributes", ->
    user.set('firstName', 'Phil')
    expect(user.firstName).toEqual('Phil')

  it "should fire a change event when an attribute is set via the set method", ->
    user.set('lastName', 'Burrows')
    expect(user.trigger).toHaveBeenCalled()

  it "should fire change events on bound functions when props are changed", ->
    user.set('firstName', 'Phil')
    expect(user.trigger).toHaveBeenCalledWith('change:fullName')

