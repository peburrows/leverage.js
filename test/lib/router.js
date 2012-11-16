
describe('Router', function() {
  var router;
  router = new Leverage.Router({
    test: true
  });
  it('should properly alias goTo as navigate', function() {
    return expect(router.goTo).toEqual(router.navigate);
  });
  describe('vanilla routes', function() {
    var handler, path;
    path = '/hello/world';
    handler = function() {};
    router.define(path, handler);
    it('should add the proper number of routes', function() {
      return expect(router.routes().length).toEqual(1);
    });
    it('should find the route properly', function() {
      return expect(router.findRoute(path)).toEqual(jasmine.any(Object));
    });
    it('should return the proper handler', function() {
      return expect(router.findRoute(path).handler).toEqual(handler);
    });
    return it('should properly call the handler when asked to navigate, but only once', function() {
      var route;
      route = router.findRoute(path);
      spyOn(route, 'handler');
      router.goTo(path);
      expect(route.handler).toHaveBeenCalled();
      return expect(route.handler.callCount).toEqual(1);
    });
  });
  return describe('basic resources', function() {
    var editHandler, finder, indexHandler, resourceRouter, showHandler;
    resourceRouter = new Leverage.Router({
      test: true
    });
    showHandler = function() {};
    indexHandler = function() {};
    editHandler = function() {};
    resourceRouter.resources('users', {
      show: showHandler,
      index: indexHandler,
      edit: editHandler
    });
    finder = resourceRouter.findRoute;
    it('should add the proper number of routes', function() {
      return expect(resourceRouter.routes().length).toEqual(3);
    });
    describe('the :show: action', function() {
      it('should find the proper route with digits', function() {
        return expect(finder('/users/23').handler).toEqual(showHandler);
      });
      it('should find the proper route with letters', function() {
        return expect(finder('/users/kkweoij').handler).toEqual(showHandler);
      });
      return it('should find the proper route with alpha-numeric', function() {
        return expect(finder('/users/123kh9lh').handler).toEqual(showHandler);
      });
    });
    describe('the :index: action', function() {
      it('should find the proper route', function() {
        return expect(finder('/users').handler).toEqual(indexHandler);
      });
      return it('should find the proper route with a trailing slash', function() {
        return expect(finder('/users/').handler).toEqual(indexHandler);
      });
    });
    return describe('the :edit: action', function() {
      it('should find the proper route', function() {
        return expect(finder('/users/99/edit').handler).toEqual(editHandler);
      });
      it('should find the proper route with letters', function() {
        return expect(finder('/users/kkweoij/edit').handler).toEqual(editHandler);
      });
      return it('should find the proper route with alpha-numeric', function() {
        return expect(finder('/users/123kh9lh/edit').handler).toEqual(editHandler);
      });
    });
  });
});
