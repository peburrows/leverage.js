(function(){
  var Class = function(){
    if(typeof this.__initialize !== 'undefined'){
      // for internal initialization that shouldn't be overwritten
      this.__initialize.apply(this, arguments);
    }
    this.initialize.apply(this, arguments);
  };

  Class.prototype.initialize = function(attrs){
    if(typeof attrs === 'object'){
      for(var key in attrs){ this[key] = attrs[key]; }
    }
  };

  // Class.include = function(){
  //   for (var i = 0; i < arguments.length; i++){
  //     // need to avoid overwriting the initialize method...
  //     var oldInit = this.prototype.initialize
  //       , argInit = arguments[i].initialize;

  //     if(!argInit){ argInit = arguments[i].instanceMethods ? arguments[i].instanceMethods.initialize : null }
  //     if(!argInit){ argInit = arguments[i].classMethods    ? arguments[i].classMethods.initialize    : null }

  //     var newInit;
  //     if(argInit){
  //       newInit = function(){
  //         if( argInit ){ argInit.apply(this, arguments); }
  //         if( oldInit ){ oldInit.apply(this, arguments); }
  //       };
  //     }


  //     if(arguments[i].instanceMethods){
  //       _.extend(this.prototype, arguments[i].instanceMethods);
  //     }else{
  //       _.extend(this.prototype, arguments[i]);
  //     }

  //     if(arguments[i].classMethods){ _.extend(this, arguments[i].classMethods); }

  //     this.prototype.initialize = newInit || this.prototype.initialize;
  //   }
  //   return this;
  // };

  Class.extend = function(instanceProps, classProps){
    var child
      , parent = this;

    // automatically call the parent's initialize method
    child = function(){ parent.apply(this, arguments); };

    _.extend(child, parent);
    var Noop = function(){ this.constructor = child; };
    Noop.prototype = parent.prototype;
    child.prototype = new Noop();

    if(instanceProps){ _.extend(child.prototype, instanceProps); }
    if(classProps)   { _.extend(child, classProps); }

    child.__super = parent.prototype;

    return child;
  };

  this.Leverage.Class = Class;
}.call(this));
