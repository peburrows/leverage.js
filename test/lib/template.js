(function() {

  describe('Leverage.Template', function() {
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
      return describe('that has bindings', function() {});
    });
  });

}).call(this);
