(function(){
  var Leverage = {}

  Leverage.noop = function(){};
  Leverage.bind = function(fn, obj){ return function(){ return fn.apply(obj, arguments); }; };

  Leverage.bindLeverageFunctions = function(obj){
    var l = obj._leverage;
    for(fn in l){
      if(l[fn].apply){
        l[fn] = Leverage.bind(l[fn], obj);
      }
    }
  };

  this.Leverage = Leverage;
}).call(this);