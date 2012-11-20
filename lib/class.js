(function(){
  var Class = function(){
    if(typeof this.__initialize !== 'undefined'){
      // for internal initialization that shouldn't be overwritten
      this.__initialize.apply(this, arguments);
    }

    if(typeof this.initialize !== 'undefined'){
      this.initialize.apply(this, arguments);
    }
  };

  Class.prototype.__initialize = function(){
    this.setAttrs.apply(this, arguments)
  };

  // I really don't know how I feel about doing this by default
  Class.prototype.setAttrs = function(attrs){
    if(typeof attrs === 'object'){
      for(var key in attrs){ this[key] = attrs[key]; }
    }
  }

  Class.prototype.super = function(what){
    // this is a tacky way of doing this, but it should work fine
    if(typeof this.constructor.__super[what] !== 'undefined'){
      this.constructor.__super[what].apply(this, Array.prototype.slice.call(arguments, 1))
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

    var oldInit = this.prototype.__initialize
      , argInit;

    // so, I think __initialize is the one that should auto-call super
    if(instanceProps)         { argInit = instanceProps.__initialize; }
    if(!argInit && classProps){ argInit = classProps.__initialize; }

    // we're going to call the __initialize method
    // for every class in the inheritance chain

    var newInit;
    if(argInit){
      newInit = function(){
        if( argInit ){ argInit.apply(this, arguments); }
        if( oldInit ){ oldInit.apply(this, arguments); }
      };
    }

    child.prototype.__initialize = newInit || parent.prototype.__initialize;

    child.__super = parent.prototype;

    return child;
  };

  this.Leverage.Class = Class;
}.call(this));
