(function() {

  describe('Controller', function() {
    beforeEach(function() {
      return setFixtures('<div id="el"><a href="">link</a></div>');
    });
    describe('event handling', function() {
      var clickHandler, handlerCalled;
      handlerCalled = false;
      clickHandler = function() {
        return handlerCalled = true;
      };
      beforeEach(function() {
        var Controller, controller;
        Controller = Leverage.Controller.extend({
          el: $('#el'),
          events: {
            'a click': 'aClick'
          },
          aClick: clickHandler
        });
        return controller = new Controller;
      });
      return it('should properly call event handlers', function() {
        $('#el a').click();
        return expect(handlerCalled).toEqual(true);
      });
    });
    return it('should allow you to set the element html', function() {
      var C, controller;
      C = Leverage.Controller.extend({
        el: $('#el')
      });
      controller = new C;
      controller.html('things');
      return expect($('#el').html()).toEqual('things');
    });
  });

}).call(this);
