describe 'Router', ->
  router = new Leverage.Router(test: true)

  it 'should properly alias goTo as navigate', ->
    expect(router.goTo).toEqual(router.navigate)

  describe 'vanilla routes', ->
    path = '/hello/world'
    h = handler: -> console.log("handler called", this)
    router.define(path, h.handler)

    it 'should add the proper number of routes', ->
      expect(router.routes().length).toEqual(1)

    it 'should find the route properly', ->
      expect(router.findRoute(path)).toEqual(jasmine.any(Object))

    it 'should return the proper handler', ->
      expect(router.findRoute(path).handler).toEqual(h.handler)

    it 'should properly call the handler when asked to navigate, but only once', ->
      route = router.findRoute(path)
      spyOn(route, 'handler')
      router.goTo(path)
      expect(route.handler).toHaveBeenCalled()
      expect(route.handler.callCount).toEqual(1);

  describe 'basic resources', ->
    resourceRouter = new Leverage.Router(test: true)
    showHandler  = ->
    indexHandler = ->
    editHandler  = ->
    resourceRouter.resources 'users',
                              show:   showHandler
                              index:  indexHandler
                              edit:   editHandler
    finder = resourceRouter.findRoute

    it 'should add the proper number of routes', ->
      expect(resourceRouter.routes().length).toEqual(3)

    describe 'the :show: action', ->
      it 'should find the proper route with digits', ->
        expect(finder('/users/23').handler).toEqual(showHandler)
      it 'should find the proper route with letters', ->
        expect(finder('/users/kkweoij').handler).toEqual(showHandler)
      it 'should find the proper route with alpha-numeric', ->
        expect(finder('/users/123kh9lh').handler).toEqual(showHandler)

    describe 'the :index: action', ->
      it 'should find the proper route', ->
        expect(finder('/users').handler).toEqual(indexHandler)
      it 'should find the proper route with a trailing slash', ->
        expect(finder('/users/').handler).toEqual(indexHandler)

    describe 'the :edit: action', ->
      it 'should find the proper route', ->
        expect(finder('/users/99/edit').handler).toEqual(editHandler)
      it 'should find the proper route with letters', ->
        expect(finder('/users/kkweoij/edit').handler).toEqual(editHandler)
      it 'should find the proper route with alpha-numeric', ->
        expect(finder('/users/123kh9lh/edit').handler).toEqual(editHandler)
