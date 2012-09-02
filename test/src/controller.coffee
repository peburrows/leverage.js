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
      $('#el a').click()
      # can't seem to get spyOn to work with these handlers
      expect(handlerCalled).toEqual(true)

  it 'should allow you to set the element html', ->
    C = Leverage.Controller.extend(el: $('#el'))
    controller = new C
    controller.html('things')
    expect($('#el').html()).toEqual('things')

