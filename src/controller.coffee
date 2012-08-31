Controller = Leverage.Class.extend
  initialize: ->
    self = this
    @events ||= {}
    if @el
      for key in @events
        parts   = key.split( /\s+/ )
        handler = @[@events[key]]

        @el.delegate parts[0], parts[1], (e) ->
          handler.call(self, e, this)

@Leverage.Controller = Controller