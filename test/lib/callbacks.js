
describe('Leverage.Callbacks', function() {
  beforeEach(function() {
    var fullName;
    fullName = function() {
      return "" + this.firstName + " " + this.lastName;
    };
    return this.User = Leverage.Model.extend({
      fullName: fullName.boundTo('firstNmae', 'lastName')
    });
  });
  return describe('before callbacks', function() {
    beforeEach(function() {
      var attr, value, _ref;
      this.User.beforeCallback = function() {};
      spyOn(this.User, 'beforeCallback').andCallThrough();
      this.origProps = {};
      _ref = this.User.prototype.fullName;
      for (attr in _ref) {
        value = _ref[attr];
        this.origProps[attr] = value;
      }
      this.User.before('fullName', this.User.beforeCallback);
      return this.user = new this.User({
        firstName: 'Phil',
        lastName: 'Burrows'
      });
    });
    it('should properly fire the callback', function() {
      this.user.fullName();
      return expect(this.User.beforeCallback).toHaveBeenCalled();
    });
    it('should maintain all properties of the original function', function() {
      var key, value, _ref, _results;
      _ref = this.origProps;
      _results = [];
      for (key in _ref) {
        value = _ref[key];
        expect(this.user.fullName[key]).not.toBeNull();
        _results.push(expect(this.user.fullName[key]).toEqual(this.origProps[key]));
      }
      return _results;
    });
    return it('should still fire callbacks when the bound properties are changed', function() {
      spyOn(this.user, 'trigger').andCallThrough();
      this.user.set('firstName', 'Jimmy');
      this.user.set('lastName', 'Allen');
      return expect(this.user.trigger).toHaveBeenCalledWith('change:fullName');
    });
  });
});
