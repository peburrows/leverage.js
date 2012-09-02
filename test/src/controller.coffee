describe 'Controller', ->
  beforeEach ->
    setFixtures('<div id="el"><a href="">link</a></div>');

  describe 'event handling', ->
    handlerCalled = false
    clickHandler = -> handlerCalled = true
    beforeEach ->
      Controller = Leverage.Controller.extend
                              el:     $('#el')
                              events: 'a click': 'aClick'
                              aClick: clickHandler
      controller = new Controller

    it 'should properly call event handlers', ->
      # can't seem to get spyOn to work with these handlers
      $('#el a').click()
      expect(handlerCalled).toEqual(true)