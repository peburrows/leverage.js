(function() {

  describe('Leverage.Model', function() {
    var User, fullName, user;
    fullName = function() {};
    User = Leverage.Model.extend({
      fullName: fullName.boundTo('firstName', 'lastName')
    });
    user = new User;
    beforeEach(function() {
      return spyOn(user, 'trigger').andCallThrough();
    });
    it(".extend should return a constructor", function() {
      return expect(User).toEqual(jasmine.any(Function));
    });
    it("should allow setting of attributes", function() {
      user.set('firstName', 'Phil');
      return expect(user.firstName).toEqual('Phil');
    });
    it("should fire a change event when an attribute is set via the set method", function() {
      user.set('lastName', 'Burrows');
      return expect(user.trigger).toHaveBeenCalled();
    });
    return it("should fire change events on bound functions when props are changed", function() {
      user.set('firstName', 'Phil');
      return expect(user.trigger).toHaveBeenCalledWith('change:fullName');
    });
  });

}).call(this);
