(function(){
  var Callbacks = {
    classMethods : {
      before: function(fn, callback){
        var orig = this.prototype[fn];
        this.prototype[fn] = function(){
          callback.apply(this, arguments);
          return orig.apply(this, arguments);
        };
      },

      after: function(fn, callback){
        var orig = this.prototype[fn];
        this.prototype[fn] = function(){
          var ret = orig.apply(this, arguments);
          callback.apply(this, arguments);
          return ret;
        };
      }
    }
  };

  this.Leverage.Callbacks = Callbacks;
}).call(this);