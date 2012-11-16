(function(){
  Function.prototype.include = function(){
    for (var i = 0; i < arguments.length; i++){
      // need to avoid overwriting the initialize method...
      var oldInit = this.prototype.initialize
        , argInit = arguments[i].initialize;

      var newInit = function(){
        if( argInit ){ argInit.apply(this, arguments); }
        if( oldInit ){ oldInit.apply(this, arguments); }
      };


      if(arguments[i].instanceMethods){
        _.extend(this.prototype, arguments[i].instanceMethods);
      }else{
        _.extend(this.prototype, arguments[i]);
      }

      if(arguments[i].classMethods){ _.extend(this, arguments[i].classMethods); }

      this.prototype.initialize = newInit;
    }
    return this;
  };

  Function.prototype.extend = function(){
    for (var i = 0; i < arguments.length; i++){
      if(arguments[i].classMethods){
        _.extend(this, arguments[i].classMethods);
      }else{
        _.extend(this, arguments[i]);
      }

      if(arguments[i].instanceMethods){ _.extend(this.prototype, arguments[i].instanceMethods); }
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
