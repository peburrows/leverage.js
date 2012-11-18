
describe('Leverage.Class', function() {
  var Attrs, FullModule, SingleModule;
  Attrs = Leverage.Class.extend();
  FullModule = {
    instanceMethods: {
      instanceMethod: function() {}
    },
    classMethods: {
      classMethod: function() {}
    }
  };
  SingleModule = {
    method: function() {}
  };
  describe('initialization', function() {
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
      initialize: function() {}
    });
    user = new User;
    console.log(user.initialize);
    describe('.extend', function() {
      return it("should return a constructor", function() {
        expect(User).toEqual(jasmine.any(Function));
        return expect(user).toEqual(jasmine.any(Object));
      });
    });
    return describe('extending multiple modules', function() {
      var multiUser;
      User.extend({
        initialize: function() {
          return this.baseInit = true;
        }
      });
      multiUser = new User({
        name: 'phil'
      });
      return it("should call the parent class's initialize method", function() {
        return expect(multiUser.name).toEqual('phil');
      });
    });
  });
});
