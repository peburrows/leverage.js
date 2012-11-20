(function(){
  var Controller = Leverage.Class.extend({
    __initialize: function(){
      var self = this;
      this.events = this.events || {};
      this.__handlers = {};
      // we should possibly delegate these via the doc if this.el isn't set
      if(this.el){
        if(typeof this.el === 'string'){ this.el = $(this.el); }
        var len = this.events.length;

        for(var key in this.events){
          var parts    = key.split(/\s+/)
            , handlers = [];

          if(typeof this.events[key] !== 'string'){
            // must have been an array
            // so we need to loop through the array and add each to the handlers
            for (var i = this.events[key].length - 1; i >= 0; i--) {
              handlers.push( this[this.events[key][i]] );
            }
          }else{
            handlers.push(this[this.events[key]]);
          }

          // just store a copy of the handlers for reference (and testing)
          this.__handlers[key] = this.__handlers[key] || [];
          for (var ii = handlers.length - 1; ii >= 0; ii--) {
            this.__handlers[key].push(handlers[ii]);
          }

          this.el.delegate(parts[0], parts[1], function(e){
            // pass the event and element to the handler(s)
            var len = handlers.length;
            for(var i=0; i < len; i++){
              handlers[i].call(self, e, this);
            }
          });
        }
      }
    },

    html: function(data){
      if(this.el){ return this.el.html(data); }
    }
  });

  this.Leverage.Controller = Controller;
}.call(this));
