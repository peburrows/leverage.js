(function(){
  var guid = function() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+S4()+S4()+S4()+S4()+S4()+S4());
  };

  var setupBindings = function(obj){
    for(var prop in obj){
      if(obj[prop].__boundProperties){
        for (var i = obj[prop].__boundProperties.length - 1; i >= 0; i--) {
          var e = 'change:' + obj[prop].__boundProperties[i]
            , t = 'change:' + prop;
          obj.bind(e , function(){
            obj.trigger(t);
          });
        }
      }
    }
  };

  var Model = Leverage.Class.extend({
    __initialize: function(){
      Leverage.bindLeverageFunctions(this);
      setupBindings(this);
      this.id = this.id || guid();
    },

    set: function(attr, val, shouldTrigger){
      if(shouldTrigger == null){ shouldTrigger = true; }
      this[attr] = val;
      if(shouldTrigger){ this.trigger('change:' + attr, val); }
    }
  });

  Model.include(Leverage.Events);
  Model.include(Leverage.Validations);
  Model.include(Leverage.Callbacks);

  this.Leverage.Model = Model;
}.call(this));
