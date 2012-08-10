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

  Model.prototype.set = function(attr, val, shouldTrigger){
    if(shouldTrigger == null) shouldTrigger = true;
    this[attr] = val;
    if(shouldTrigger) this.trigger('change:' + attr, val);
  };



  Model.include(Leverage.Events);
  Model.include(Leverage.Validations);
  Model.include(Leverage.Callbacks);

  this.Leverage.Model = Model;
}).call(this);