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
    setupBindings(this);
  };

  Model.include(Leverage.Events);

  Model.prototype.initialize = function(){};

  Model.extend = function(instanceProps, classProps){
    var child
      , parent = this;

    child = function(){ parent.apply(this, arguments); }

    _.extend(child, parent);
    noop.prototype = parent.prototype;
    child.prototype = new noop;

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

  // don't use this in templates
  Model.prototype.get = function(attr){
    if(!this[attr]) return null;
    if(_.isFunction(this[attr])) return this[attr]();
    return this[attr];
  };


  this.Leverage.Model = Model;
}).call(this);