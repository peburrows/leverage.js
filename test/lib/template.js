var boundClass;

boundClass = function(id, prop) {
  return "data-bind-" + id + "-" + prop;
};

describe('Leverage.Template', function() {
  beforeEach(function() {
    return setFixtures('<div id="body"></div>');
  });
  return describe('with the default settings', function() {
    it('should handle interpolation', function() {
      var template;
      template = new Leverage.Template('{= name =}');
      return expect(template({
        name: 'phil'
      })).toEqual('phil');
    });
    it('should properly escape HTML entities', function() {
      var template;
      template = new Leverage.Template('{== name ==}');
      return expect(template({
        name: '<phil'
      })).toEqual('&lt;phil');
    });
    describe('that has one way bindings', function() {
      beforeEach(function() {
        return this.user = new Leverage.Model({
          name: 'Phil'
        });
      });
      describe('for object properties', function() {
        beforeEach(function() {
          this.template = new Leverage.Template('{=> user.name <=}');
          return $('#body').html(this.template({
            user: this.user
          }));
        });
        it('should the bound property in the proper tag with identifier', function() {
          return expect($('#body').find(':first')).toHaveClass(boundClass(this.user.id, 'name'));
        });
        return it('should update the text when the object property', function() {
          this.user.set('name', 'Jimmy');
          return expect($('#body').text()).toEqual('Jimmy');
        });
      });
      describe('for naked variables', function() {
        beforeEach(function() {
          this.template = new Leverage.Template('{=> name <=}');
          return $('#body').html(this.template(this.user));
        });
        it('should wrap the bound variable in the proper tag with identifier', function() {
          return expect($('#body').find(':first')).toHaveClass(boundClass(this.user.id, 'name'));
        });
        return it('should update the text when the variable changes', function() {
          this.user.set('name', 'Jimmy');
          return expect($('#body').text()).toEqual('Jimmy');
        });
      });
      return describe('for bound functions', function() {
        beforeEach(function() {
          var User, fullName;
          fullName = function() {
            return "" + this.firstName + " " + this.lastName;
          };
          User = Leverage.Model.extend({
            firstName: 'Phil',
            lastName: 'Burrows',
            fullName: fullName.boundTo('firstName', 'lastName')
          });
          this.user = new User;
          this.template = new Leverage.Template('{=> user.fullName() <=}');
          return $('#body').html(this.template({
            user: this.user
          }));
        });
        it('should wrap the bound function in the proper tag with identifier', function() {
          return expect($('#body > :first')).toHaveClass(boundClass(this.user.id, 'fullName'));
        });
        it('should, of course, render the proper text', function() {
          return expect($('#body').text()).toEqual(this.user.fullName());
        });
        return it('should update the text when either variable changes', function() {
          this.user.set('firstName', 'P.');
          expect($('#body').text()).toEqual(this.user.fullName());
          this.user.set('lastName', 'B.');
          return expect($('#body').text()).toEqual(this.user.fullName());
        });
      });
    });
    return describe('that has template --> model bindings', function() {
      it('should render the initial value in the template', function() {
        var template;
        template = new Leverage.Template('<input type="text" value="{<= user.name =>}">');
        $('#body').html(template({
          user: {
            name: 'Phil'
          }
        }));
        return expect($('#body input').val()).toEqual('Phil');
      });
      return describe('for naked variables', function() {
        beforeEach(function() {
          var User;
          User = Leverage.Model.extend();
          this.user = new User({
            name: 'Phil'
          });
          this.template = new Leverage.Template('<input type="text" value="{<= user.name =>}">');
          return $('#body').html(this.template({
            user: this.user
          }));
        });
        it('should render the initial value in the template', function() {
          return expect($('#body input').val()).toEqual('Phil');
        });
        return it('should update the model when the input changes', function() {
          $('#body input').val('Jimmy');
          $('#body input').trigger('change', 'Jimmy');
          return expect(this.user.name).toEqual('Jimmy');
        });
      });
    });
  });
});
