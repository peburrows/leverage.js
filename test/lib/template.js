var boundClass;

boundClass = function(id, prop) {
  return "data-bind-" + id + "-" + prop;
};

describe('Leverage.Template', function() {
  beforeEach(function() {
    var fullName;
    setFixtures('<div id="body"></div>');
    fullName = function() {
      return "" + this.firstName + " " + this.lastName;
    };
    return this.User = Leverage.Model.extend({
      firstName: 'Phil',
      lastName: 'Burrows',
      fullName: fullName.boundTo('firstName', 'lastName')
    });
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
    describe('that has data way bindings', function() {
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
          return expect($('#body').find(':first')).toHaveClass(boundClass(this.user._leverageID, 'name'));
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
          return expect($('#body').find(':first')).toHaveClass(boundClass(this.user._leverageID, 'name'));
        });
        return it('should update the text when the variable changes', function() {
          this.user.set('name', 'Jimmy');
          return expect($('#body').text()).toEqual('Jimmy');
        });
      });
      return describe('for bound functions', function() {
        beforeEach(function() {
          this.user = new this.User;
          this.template = new Leverage.Template('{=> user.fullName() <=}');
          return $('#body').html(this.template({
            user: this.user
          }));
        });
        it('should wrap the bound function in the proper tag with identifier', function() {
          return expect($('#body > :first')).toHaveClass(boundClass(this.user._leverageID, 'fullName'));
        });
        it('should, of course, render the proper text', function() {
          return expect($('#body').text()).toEqual(this.user.fullName());
        });
        it('should update the text when either variable changes', function() {
          this.user.set('firstName', 'P.');
          expect($('#body').text()).toEqual(this.user.fullName());
          this.user.set('lastName', 'B.');
          return expect($('#body').text()).toEqual(this.user.fullName());
        });
        return describe('AND object properties', function() {
          beforeEach(function() {
            this.user2 = new this.User;
            this.bothTemplate = new Leverage.Template('<span id="first">{=> user.firstName <=}</span><span id="full">{=> user.fullName() <=}</span>');
            return $('#body').html(this.bothTemplate({
              user: this.user2
            }));
          });
          it('should update the property', function() {
            this.user2.set('firstName', 'Jimmy');
            return expect($('#first').text()).toEqual('Jimmy');
          });
          it('should update the bound function on property change', function() {
            this.user2.set('firstName', 'Alex');
            return expect($('#full').text()).toEqual(this.user2.fullName());
          });
          return it('should update both', function() {
            this.user2.set('firstName', 'Geraldo');
            expect($('#first').text()).toEqual('Geraldo');
            return expect($('#full').text()).toEqual(this.user2.fullName());
          });
        });
      });
    });
    return describe('when dealing with multiple templates', function() {
      beforeEach(function() {
        this.user = new this.User;
        this.templates = {
          first: new Leverage.Template('<span id="first-1">{=> user.firstName <=}</span>'),
          last: new Leverage.Template('<span id="last-1">{=> user.lastName <=}</span>'),
          full: new Leverage.Template('<span id="full-1">{=> user.fullName() <=}</span>'),
          all: new Leverage.Template('<span id="first-2">{=> user.firstName <=}</span><span id="last-2">{=> user.lastName <=}</span><span id="full-2">{=> user.fullName() <=}</span>')
        };
        return $('#body').html(this.templates.first({
          user: this.user
        }) + this.templates.last({
          user: this.user
        }) + this.templates.full({
          user: this.user
        }) + this.templates.all({
          user: this.user
        }));
      });
      it('should update all templates with bound properties', function() {
        this.user.set('firstName', 'Bro');
        expect(this.user.firstName).toEqual('Bro');
        expect($('#first-1').text()).toEqual(this.user.firstName);
        return expect($('#first-2').text()).toEqual(this.user.firstName);
      });
      it('should update all templates with bound functions', function() {
        this.user.set('lastName', 'Dude');
        expect(this.user.lastName).toEqual('Dude');
        expect($('#full-1').text()).toEqual(this.user.fullName());
        return expect($('#full-1').text()).toEqual($('#full-2').text());
      });
      return it('should update *all* values in the template', function() {
        this.user.set('firstName', 'Jimmy').set('lastName', 'Allen');
        expect($('#first-1').text()).toEqual(this.user.firstName);
        expect($('#first-2').text()).toEqual(this.user.firstName);
        expect($('#last-1').text()).toEqual(this.user.lastName);
        expect($('#last-2').text()).toEqual(this.user.lastName);
        expect($('#full-1').text()).toEqual(this.user.fullName());
        return expect($('#full-2').text()).toEqual(this.user.fullName());
      });
    });
  });
});
