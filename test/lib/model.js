(function() {

  describe('Leverage.Model', function() {
    var User, fullName;
    fullName = function() {};
    User = Leverage.Model.extend({
      fullName: fullName.boundTo('firstName', 'lastName')
    });
    beforeEach(function() {
      this.user = new User;
      return spyOn(this.user, 'trigger').andCallThrough();
    });
    return describe('an instance', function() {
      it("should have an id assigned", function() {
        return expect(this.user.id).toBeDefined();
      });
      it("should allow setting of attributes", function() {
        this.user.set('firstName', 'Phil');
        return expect(this.user.firstName).toEqual('Phil');
      });
      it("should fire a change event when an attribute is set via the set method", function() {
        this.user.set('lastName', 'Burrows');
        return expect(this.user.trigger).toHaveBeenCalled();
      });
      return it("should fire change events on bound functions when props are changed", function() {
        this.user.set('firstName', 'Phil');
        return expect(this.user.trigger).toHaveBeenCalledWith('change:fullName');
      });
    });
  });

}).call(this);
