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

    var oldInit = this.prototype.initialize
      , argInit;

    if(instanceProps)         { argInit = instanceProps.initialize; }
    if(!argInit && classProps){ argInit = classProps.initialize; }

    // I don't know if we really want to do things this way...
    // but for now, we're going to call the initialize method
    // for every class in the inheritance chain

    var newInit;
    if(argInit){
      newInit = function(){
        if( argInit ){ argInit.apply(this, arguments); }
        if( oldInit ){ oldInit.apply(this, arguments); }
      };
    }

    child.prototype.initialize = newInit || parent.prototype.initialize;

    child.__super = parent.prototype;

    return child;
  };

  this.Leverage.Class = Class;
}.call(this));
