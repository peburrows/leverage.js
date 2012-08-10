(function(){
  var setupBindings = function(obj){
    for(prop in obj){
      if(obj[prop].__boundProperties){
        for (var i = obj[prop].__boundProperties.length - 1; i >= 0; i--) {
          var e = 'change:' + obj[prop].__boundProperties[i]
            , t = 'change:' + prop;
          obj.bind(e , function(){
            obj.trigger(t);
          });
        };
      }
    }
  };

  var Model = function(){
    this.initialize.apply(this, arguments);
    Leverage.bindLeverageFunctions(this);
    setupBindings(this);
  };

  Model.prototype.initialize = function(){};

  Model.extend = function(instanceProps, classProps){
    var child
      , parent = this;

    child = function(){ parent.apply(this, arguments); }

    _.extend(child, parent);
    Leverage.noop.prototype = parent.prototype;
    child.prototype = new Leverage.noop;

    if(instanceProps) _.extend(child.prototype, instanceProps);
    if(classProps)    _.extend(child, classProps);

    child.prototype.constructor = child;
    child.__super = parent.prototype;

    return child;
  };

  Model.prototype.validate = function(){
    this._leverage.errors = new Leverage.Errors;
    var v = this._leverage.validations;

    for(validation in v){
      console.log("one validation set:")
      for (var i = v[validation].length - 1; i >= 0; i--) {
        // console.log('a validation:', vvalidation[i]);
        v[validation][i].call(this);
      }
    }
  };

  Model.prototype.isValid = function(){
    this.validate();
    return this.getErrors().blank();
  };

  Model.prototype.set = function(attr, val, shouldTrigger){
    if(shouldTrigger == null) shouldTrigger = true;
    this[attr] = val;
    if(shouldTrigger) this.trigger('change:' + attr, val);
  };

  Model.prototype.getErrors = function(){
    return this._leverage.errors;
  };

  Model.prototype._leverage = { errors: new Leverage.Errors, validations: {} };
  Model.prototype._leverage.addError = function(attr, error){
    // `this` is bound to the object in the bingLeverageFunctions() method on initialization
    this.getErrors().add(attr, error);
  };



  Model.include(Leverage.Events);
  Model.include(Leverage.Validations);

  this.Leverage.Model = Model;
}).call(this);