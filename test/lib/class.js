
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
  describe('extending', function() {
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
        initialize: function() {
          return this.baseInit = true;
        }
      });
      multiUser = new User('phil');
      return it("should call the parent class's initialize method", function() {
        return expect(multiUser.name).toEqual('phil');
      });
    });
  });
  return describe('a module that has the instanceMethods and classMethods properties', function() {
    describe('calling Class.include', function() {
      var User;
      User = Leverage.Class.extend();
      User.include(FullModule);
      beforeEach(function() {
        return this.user = new User;
      });
      it('should include instanceMethods', function() {
        return expect(this.user.instanceMethod).toEqual(jasmine.any(Function));
      });
      return it('should extend classMethods', function() {
        return expect(User.classMethod).toEqual(jasmine.any(Function));
      });
    });
    return describe('a module that does not have instanceMethods or classMethods properties', function() {
      beforeEach(function() {
        return this.User = Leverage.Class.extend();
      });
      return describe('calling Class.include', function() {
        beforeEach(function() {
          this.User.include(SingleModule);
          return this.user = new this.User;
        });
        it('should add them as instance methods', function() {
          return expect(this.user.method).toEqual(jasmine.any(Function));
        });
        return it('should not add them as class methods', function() {
          return expect(this.User.method).toEqual(void 0);
        });
      });
    });
  });
});
