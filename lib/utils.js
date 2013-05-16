(function(){
  var Utils = {};

  var escapes = {
      '&': '&amp;'
    , '<': '&lt;'
    , '>': '&gt;'
    , '"': '&quot;'
    , "'": '&#x27;'
    , '/': '&#x2F;'
  };

  var escapeArray = [];
  for(var key in escapes){
    escapeArray.push(key);
  }

  var escapeRegExp = new RegExp('[' + escapeArray.join('') + ']', 'g');

  Utils.extend = function(obj, source){
    if (source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    }
    return obj;
  };

  Utils.defaults = function(obj, source){
    if (source) {
      for (var prop in source) {
        if (obj[prop] === void 0) obj[prop] = source[prop];
      }
    }
    return obj;
  };

  Utils.escape = function(string){
    if (string == null) return '';
    return ('' + string).replace(escapeRegExp, function(match) {
      return escapes[match];
    });
  };

  this.Leverage.Utils = Utils;

  Function.prototype.include = function(){
    for (var i = 0; i < arguments.length; i++){
      // need to avoid overwriting the initialize method...
      var oldInit = this.prototype.__initialize
        , argInit = arguments[i].__initialize;

      if(!argInit){ argInit = arguments[i].instanceMethods ? arguments[i].instanceMethods.__initialize : null; }
      if(!argInit){ argInit = arguments[i].classMethods    ? arguments[i].classMethods.__initialize    : null; }

      var newInit;
      if(argInit){
        newInit = function(){
          if( argInit ){ argInit.apply(this, arguments); }
          if( oldInit ){ oldInit.apply(this, arguments); }
        };
      }


      if(arguments[i].instanceMethods){
        Leverage.Utils.extend(this.prototype, arguments[i].instanceMethods);
      }else{
        Leverage.Utils.extend(this.prototype, arguments[i]);
      }

      if(arguments[i].classMethods){ Leverage.Utils.extend(this, arguments[i].classMethods); }

      this.prototype.__initialize = newInit || this.prototype.__initialize;
    }
    return this;
  };

  Function.prototype.boundTo = function(){
    var self = this
      , newFunc = function(){ return self.apply(this, arguments); };

    newFunc.__boundProperties = Array.prototype.slice.call(arguments, 0);
    return newFunc;
  };

}.call(this));
