
describe('Leverage Utils', function() {
  var FullModule, SingleModule, User;
  User = Leverage.Model.extend({});
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
  beforeEach(function() {
    return User = function() {};
  });
  describe('a module that has the instanceMethods and classMethods properties', function() {
    return describe('calling Class.include', function() {
      var user;
      user = null;
      beforeEach(function() {
        User.include(FullModule);
        return user = new User;
      });
      it('should include instanceMethods', function() {
        return expect(user.instanceMethod).toEqual(jasmine.any(Function));
      });
      return it('should extend classMethods', function() {
        return expect(User.classMethod).toEqual(jasmine.any(Function));
      });
    });
  });
  return describe('a module that does not have instanceMethods or classMethods properties', function() {
    return describe('calling Class.include', function() {
      var user;
      user = null;
      beforeEach(function() {
        User.include(SingleModule);
        return user = new User;
      });
      it('should add them as instance methods', function() {
        return expect(user.method).toEqual(jasmine.any(Function));
      });
      return it('should not add them as class methods', function() {
        return expect(User.method).toEqual(void 0);
      });
    });
  });
});
