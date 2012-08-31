(function() {

  describe('Leverage.Class', function() {
    describe('initialization', function() {
      var Attrs;
      Attrs = Leverage.Class.extend();
      return it("should allow me to set values via the constructor", function() {
        var attrs;
        attrs = new Attrs({
          name: 'phil',
          awesome: true
        });
        expect(attrs.name).toEqual('phil');
        return expect(attrs.awesome).toEqual(true);
      });
    });
    return describe('extending', function() {
      var User, user;
      User = Leverage.Class.extend({
        initialize: function(name) {
          this.name = name;
        }
      });
      user = new User;
      describe('.extend', function() {
        return it("should return a constructor", function() {
          expect(User).toEqual(jasmine.any(Function));
          return expect(user).toEqual(jasmine.any(Object));
        });
      });
      return describe('extending multiple modules', function() {
        var multiUser;
        User.extend({
          initialize: function() {}
        });
        multiUser = new User('phil');
        return it("should call the parent class's initialize method", function() {
          return expect(multiUser.name).toEqual('phil');
        });
      });
    });
  });

}).call(this);
