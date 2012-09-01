(function(){
  var Leverage = {};

  Leverage.noop = function(){};
  Leverage.bind = function(fn, obj){ return function(){ return fn.apply(obj, arguments); }; };

  Leverage.bindLeverageFunctions = function(obj){
    // var l = obj._leverage;
    for(var fn in obj){
      if( (/^_leverage/).test(fn) && [fn].apply ){
        console.log('binding: ' + fn);
        obj[fn] = Leverage.bindContext(obj[fn], obj);
      }
    }
  };

  this.Leverage = Leverage;
}.call(this));