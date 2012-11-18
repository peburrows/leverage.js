describe 'Leverage.Events', ->
  User = Leverage.Class.extend()
  user = null
  beforeEach ->
    User.include(Leverage.Events)
    user = new User
    user.handler = ->
    user.bind 'fake', user.handler
    spyOn(user, 'handler')

  it 'should add the trigger event to instances', ->
    expect(user.trigger).toEqual(jasmine.any(Function))
    expect(user.trigger).toEqual(Leverage.Events.instanceMethods.trigger)

  it 'should add the bind event to instances', ->
    expect(user.bind).toEqual(jasmine.any(Function))
    expect(user.bind).toEqual(Leverage.Events.instanceMethods.bind)

  it 'should properly call bound functions', ->
    user.trigger('fake')
    expect(user.handler).toBeCalled