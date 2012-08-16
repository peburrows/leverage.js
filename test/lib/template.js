(function() {

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
      return describe('that has bindings', function() {
        beforeEach(function() {
          return this.user = new Leverage.Model({
            name: 'Phil'
          });
        });
        describe('for object properties', function() {
          beforeEach(function() {
            this.template = new Leverage.Template('{=> user.name <=}');
            return $('#body').append(this.template({
              user: this.user
            }));
          });
          it('should the bound property in the proper tag with identifier', function() {
            return expect($('#body').find(':first')).toHaveClass('data-bind-' + this.user.id + '-name');
          });
          return it('should update the text when the object property', function() {
            this.user.set('name', 'Jimmy');
            return expect($('#body').text()).toEqual('Jimmy');
          });
        });
        return describe('for naked variables', function() {
          beforeEach(function() {
            this.template = new Leverage.Template('{=> name <=}');
            return $('#body').append(this.template(this.user));
          });
          it('should wrap the bound variable in the proper tag with identifier', function() {
            return expect($('#body').find(':first')).toHaveClass('data-bind-' + this.user.id + '-name');
          });
          return it('should update the text when the variable changes', function() {
            this.user.set('name', 'Jimmy');
            return expect($('#body').text()).toEqual('Jimmy');
          });
        });
      });
    });
  });

}).call(this);
