
describe('Controller', function() {
  beforeEach(function() {
    return setFixtures('<div id="el"><a href="">link</a></div>');
  });
  return describe('event handling', function() {
    var Controller, clickHandler, controller, handlerCalled;
    handlerCalled = false;
    clickHandler = function() {
      return handlerCalled = true;
    };
    controller = null;
    Controller = Leverage.Controller.extend({
      el: '#el',
      events: {
        'a click': 'aClick'
      },
      aClick: clickHandler
    });
    beforeEach(function() {
      return controller = new Controller;
    });
    it('should set up the handlers properly', function() {
      return expect(controller.__handlers['a click'].length).toEqual(1);
    });
    it('should properly call event handlers', function() {
      $('#el a').click();
      return expect(handlerCalled).toEqual(true);
    });
    return it('should allow you to set the element html', function() {
      controller.html('things');
      return expect($('#el').html()).toEqual('things');
    });
  });
});
