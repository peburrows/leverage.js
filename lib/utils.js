(function(){
  // it doesn't work properly to do this in a function this way
  var setupInitializeInheritance = function(parent, child, args){
    var parentInit = parent.prototype.initialize
      , childInit = child.initialize;

    if(!childInit){ childInit = child.instanceMethods ? child.instanceMethods.initialize : null }
    if(!childInit){ childInit = child.classMethods    ? child.classMethods.initialize    : null }

    return function(){
      if(childInit) { childInit.apply(parent, args); console.log("called child init"); }
      if(parentInit){ parentInit.apply(parent, args); console.log("called parent init", parentInit); }
    };
  };

  Function.prototype.include = function(){
    for (var i = 0; i < arguments.length; i++){
      // need to avoid overwriting the initialize method...
      var oldInit = this.prototype.initialize
        , argInit = arguments[i].initialize;

      if(!argInit){ argInit = arguments[i].instanceMethods ? arguments[i].instanceMethods.initialize : null }
      if(!argInit){ argInit = arguments[i].classMethods    ? arguments[i].classMethods.initialize    : null }

      var newInit;
      if(argInit){
        newInit = function(){
          if( argInit ){ argInit.apply(this, arguments); }
          if( oldInit ){ oldInit.apply(this, arguments); }
        };
      }


      if(arguments[i].instanceMethods){
        _.extend(this.prototype, arguments[i].instanceMethods);
      }else{
        _.extend(this.prototype, arguments[i]);
      }

      if(arguments[i].classMethods){ _.extend(this, arguments[i].classMethods); }

      this.prototype.initialize = newInit || this.prototype.initialize;
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
