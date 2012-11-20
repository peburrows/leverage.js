
describe('Leverage.Model', function() {
  var User, fullName;
  fullName = function() {
    return "" + this.firstName + " " + this.lastName;
  };
  User = Leverage.Model.extend({
    fullName: fullName.boundTo('firstName', 'lastName'),
    nameObj: function() {
      return {
        first: this.firstName,
        last: this.lastName
      };
    }
  });
  beforeEach(function() {
    this.user = new User({
      firstName: 'Jimmy',
      lastName: 'Allen'
    });
    return spyOn(this.user, 'trigger').andCallThrough();
  });
  return describe('an instance', function() {
    it("should have an id assigned", function() {
      return expect(this.user._leverageID).toBeDefined();
    });
    describe('#get', function() {
      it("should allow the getting of attributes", function() {
        this.user.set('firstName', 'Phil');
        return expect(this.user.get('firstName')).toEqual('Phil');
      });
      it("should allow the getting of functions", function() {
        return expect(this.user.get('fullName()')).toEqual(this.user.fullName());
      });
      return it("should allow the getting of attributes by way of a function", function() {
        expect(this.user.get('nameObj().first')).toEqual(this.user.firstName);
        return expect(this.user.get('nameObj().last')).toEqual(this.user.lastName);
      });
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
      expect(this.user.trigger).toHaveBeenCalledWith('change:fullName');
      return expect(this.user.trigger).toHaveBeenCalledWith('change:firstName', 'Phil');
    });
  });
});
