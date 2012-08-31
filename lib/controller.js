(function(){
  var Controller = Leverage.Class.extend({
    initialize: function(){
      var self = this;
      this.events = this.events || {};
      if(this.el){
        for(var key in this.events){
          var parts   = key.split(/\s+/)
            , handler = this[this.events[key]];

          this.el.delegate(parts[0], parts[1], function(e){
            handler.call(self, e, this);
          });
        }
      }
    }
  });

  this.Leverage.Controller = Controller;
}.call(this));