(function(){
  var Callbacks = {
    classMethods : {
      before: function(fn, callback){
        var orig = this.prototype[fn];
        this.prototype[fn] = Leverage.Utils.extend(function(){
          callback.apply(this, arguments);
          return orig.apply(this, arguments);
        }, orig);
      },

      after: function(fn, callback){
        var orig = this.prototype[fn];
        this.prototype[fn] = Leverage.Utils.extend(function(){
          var ret = orig.apply(this, arguments);
          callback.apply(this, arguments);
          return ret;
        }, orig);
      }
    }
  };

  this.Leverage.Callbacks = Callbacks;
}.call(this));