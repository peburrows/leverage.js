;(function(){
  Function.prototype.include = function(){
    for (var i = 0; i < arguments.length; i++){
      if(arguments[i].instanceMethods){
        _.extend(this.prototype, arguments[i].instanceMethods);
      }else{
        _.extend(this.prototype, arguments[i]);
      }

      if(arguments[i].classMethods){ _.extend(this, arguments[i].classMethods); }
    }
    return this;
  };

  Function.prototype.extend = function(){
    for (var i = 0; i < arguments.length; i++){
      if(arguments[i].classMethods){
        _.extend(this, arguments[i].classMethods);
      }else{
        _.extend(this, arguments);
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
}).call(this);