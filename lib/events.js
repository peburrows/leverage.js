;(function(){
  var Events = {
    instanceMethods: {
      _bindings : {},
      bind: function(name, callback){
        this._bindings[name] = this._bindings[name] || [];
        this._bindings[name].push(callback);
        return this;
      },

      initialize: function(){
        var self = this;
        for(var prop in this){
          if(typeof this[prop] !== 'undefined' && this[prop].__boundProperties){
            for (var i = this[prop].__boundProperties.length - 1; i >= 0; i--) {
              // do this in a function so we make sure not to screw up variables
              (function(p, ind){
                this.bind('change:'+this[p].__boundProperties[ind], function(e, data){
                  self.trigger('change:'+p);
                });
              }.call(this, prop, i));
            }
          }
        }
      },

      isBound: function(name, callback){
        for (var i = this._bindings.length - 1; i >= 0; i--) {
          if(this._bindings[i] === callback){ return true; }
        }
        return false;
      },

      trigger: function(name, data){
        var callbacks = this._bindings[name];
        if(typeof callbacks !== 'undefined'){
          var len = callbacks.length;
          for (var i = 0; i < len; i++) {
            callbacks[i].call(this, data);
          }
        }
        return this;
      }
    }
  };

  // alias 'trigger' as 'fire'
  Events.fire = Events.trigger;
  Events.on   = Events.bind;

  this.Leverage.Events = Events;
}.call(this));
