(function() {

  describe('Leverage.Class', function() {
    var User, user;
    User = Leverage.Class.extend({});
    user = new User;
    return describe('.extend', function() {
      return it("should return a constructor", function() {
        expect(User).toEqual(jasmine.any(Function));
        return expect(user).toEqual(jasmine.any(Object));
      });
    });
  });

}).call(this);
