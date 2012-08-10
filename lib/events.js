;(function(){
  var Events = {
    instanceMethods: {
      _bindings : {},
      bind: function(name, callback){
        this._bindings[name] = this._bindings[name] || [];
        this._bindings[name].push(callback);
        return this;
      },

      init: function(){
        var self = this;
        for(prop in this){
          if(typeof this[prop] !== 'undefined' && this[prop].__boundProperties){
            for (var i = this[prop].__boundProperties.length - 1; i >= 0; i--) {
              this.bind('change:'+this[prop].__boundProperties[i], function(e, data){
                self.trigger('change:'+prop);
              });
            };
          }
        }
      },

      isBound: function(name, callback){
        for (var i = this._bindings.length - 1; i >= 0; i--) {
          if(this._bindings[i] === callback){ return true; }
        };
        return false;
      },

      trigger: function(name, data){
        var callbacks = this._bindings[name];
        if(typeof callbacks !== 'undefined'){
          var len = callbacks.length;
          for (var i = 0; i < len; i++) {
            callbacks[i].call(this, data);
          };
        }
        return this;
      }
    }
  };

  this.Leverage.Events = Events;
}).call(this);