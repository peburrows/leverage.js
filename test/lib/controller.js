(function() {

  describe('Controller', function() {
    beforeEach(function() {
      return setFixtures('<div id="el"><a href="">link</a></div>');
    });
    return describe('event handling', function() {
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
  });

}).call(this);
