;(function(){
  var Class = function(){
    if(typeof this.__initialize !== 'undefined'){
      // for internal initialization that shouldn't be overwritten
      this.__initialize.apply(this, arguments);
    }
    this.initialize.apply(this, arguments);
  };

  Class.prototype.initialize = function(){};

  Class.extend = function(instanceProps, classProps){
    var child
      , parent = this;

    child = function(){ parent.apply(this, arguments); }

    _.extend(child, parent);
    var noop = function(){};
    noop.prototype = parent.prototype;
    child.prototype = new noop;

    if(instanceProps) _.extend(child.prototype, instanceProps);
    if(classProps)    _.extend(child, classProps);

    child.prototype.constructor = child;
    child.__super = parent.prototype;

    return child;
  };

  this.Leverage.Class = Class;
}).call(this);