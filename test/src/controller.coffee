describe 'Controller', ->
  beforeEach ->
    setFixtures('<div id="el"><a href="">link</a></div>');

  describe 'event handling', ->
    handlerCalled = false
    clickHandler = -> handlerCalled = true
    controller = null
    Controller = Leverage.Controller.extend
                              el:     '#el'
                              events: 'a click': ['aClick', 'bClick']
                              aClick: clickHandler
                              bClick: -> return

    beforeEach ->
      controller = new Controller
      window.controller = controller

    it 'should set up the handlers properly', ->
      expect(controller.__handlers['a click'].length).toEqual(2)

    it 'should properly call event handlers', ->
      $('#el a').click()
      # can't seem to get spyOn to work with these handlers
      expect(handlerCalled).toEqual(true)

    it 'should allow you to set the element html', ->
      controller.html('things')
      expect($('#el').html()).toEqual('things')

