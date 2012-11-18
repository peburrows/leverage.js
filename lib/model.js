(function(){
  var guid = function() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+S4()+S4()+S4()+S4()+S4()+S4());
  };

  var Model = Leverage.Class.extend({
    // since we're calling all the initialize methods in the inheritance chain,
    // we can just name this plain ol' "initialize"
    __initialize: function(){
      Leverage.bindLeverageFunctions(this);
      this.id = this.id || guid();
    },

    set: function(attr, val, shouldTrigger){
      if(shouldTrigger == null){ shouldTrigger = true; }
      var upped  = attr[0].toUpperCase() + attr.slice(1);

      // if there's a setter defined, call that
      if(this['set'+upped]) { this['set'+upped](val) }
      else                  { this[attr] = val; }

      if(shouldTrigger){ this.trigger('change:' + attr, this.get(attr)); }
      return this;
    },

    get: function(attr){
      return this[attr];
    }
  });

  Model.include(Leverage.Events);
  Model.include(Leverage.Validations);
  Model.include(Leverage.Callbacks);

  this.Leverage.Model = Model;
}.call(this));
