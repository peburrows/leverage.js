
describe('Leverage.Events', function() {
  var User, user;
  User = Leverage.Class.extend();
  user = null;
  beforeEach(function() {
    User.include(Leverage.Events);
    user = new User;
    user.handler = function() {};
    user.bind('fake', user.handler);
    return spyOn(user, 'handler');
  });
  it('should add the trigger event to instances', function() {
    expect(user.trigger).toEqual(jasmine.any(Function));
    return expect(user.trigger).toEqual(Leverage.Events.instanceMethods.trigger);
  });
  it('should add the bind event to instances', function() {
    expect(user.bind).toEqual(jasmine.any(Function));
    return expect(user.bind).toEqual(Leverage.Events.instanceMethods.bind);
  });
  return it('should properly call bound functions', function() {
    user.trigger('fake');
    return expect(user.handler).toBeCalled;
  });
});
