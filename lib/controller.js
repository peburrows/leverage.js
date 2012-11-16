(function(){
  var Controller = Leverage.Class.extend({
    initialize: function(){
      var self = this;
      this.events = this.events || {};
      this.__handlers = {};
      // we should possibly delegate these via the doc if this.el isn't set
      if(this.el){
        if(typeof this.el === 'string'){ this.el = $(this.el); }
        for(var key in this.events){
          var parts   = key.split(/\s+/)
            , handler = this[this.events[key]];

          // just store a copy of the handlers for reference (and testing)
          this.__handlers[key] = this.__handlers[key] || [];
          this.__handlers[key].push(handler);

          this.el.delegate(parts[0], parts[1], function(e){
            // pass the event and element to the handler
            handler.call(self, e, this);
          });
        }
      }
    },

    html: function(data){
      if(this.el){ this.el.html(data); }
    }
  });

  this.Leverage.Controller = Controller;
}.call(this));
