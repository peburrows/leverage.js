(function(){
  var Callbacks = {
    classMethods : {
      before: function(fn, callback){
        var orig = this.prototype[fn];
        this.prototype[fn] = function(){
          callback.apply(this, arguments);
          orig.apply(this, arguments);
        };
      },

      after: function(fn, callback){
        var orig = this.prototype[fn];
        this.prototype[fn] = function(){
          orig.apply(this, arguments);
          callback.apply(this, arguments);
        };
      }
    }
  };

  this.Leverage.Callbacks = Callbacks;
}).call(this);