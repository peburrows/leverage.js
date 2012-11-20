(function(){
  var guid = function() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+S4()+S4()+S4()+S4()+S4()+S4());
  };

  var functionMatcher = function(val){
    var isFunc = /^(.*)(\((.*)\))$/
        , m;

      if(val == null) return false;
      if(m = val.match(isFunc)){
        return {
            name: m[1]
          , arg:  m[3]
        };
      }else{
        return false;
      }
  };

  var Model = Leverage.Class.extend({
    __initialize: function(){
      this.super('initialize', arguments)
      // this will auto-call super, so don't do it manually, or you'll have issues
      Leverage.bindLeverageFunctions(this);
      this._leverageID = this._leverageID || guid();
    },

    set: function(attr, val, shouldTrigger){
      if(shouldTrigger == null){ shouldTrigger = true; }
      var upped  = attr[0].toUpperCase() + attr.slice(1);

      // if there's a setter defined, call that
      if(this['set'+upped]) { this['set'+upped](val) }
      else                  { this[attr] = val; }

      if(shouldTrigger){ this.trigger('change:' + attr, this.get(attr)); }
      return this;
    },

    // I'd like to add key path getting, i.e. get('user.address.city')
    get: function(attr){
      var isFunc = /^(.*)(\((.*)\))$/
        , m
        , foundFunc;

      if(attr.indexOf('.') < 0 && attr.indexOf('(') < 0){
        return this[attr];
      }else if(m = functionMatcher(attr)){
        foundFunc = this.get.call(this, m.name);
        if(typeof foundFunc !== 'undefined'){
          if(m.arg !== ''){
            return foundFunc.call(this, m.arg);
          }else{
            return foundFunc.call(this);
          }
        }
      }else{
        var parts = attr.split('.')
          , ret   = this
          , func;
        for(var i = 0; i < parts.length; i++){
          if(typeof ret === 'undefined') continue;
          if(m = functionMatcher(parts[i])){
            func = ret[m.name];
            if(typeof func !== 'undefined'){
              if(m.arg && m.arg !== ''){
                ret = func.call(ret, m.arg);
              }else{
                ret = func.call(ret);
              }
            }else{
              ret = func;
            }
          }else{
            ret = ret[parts[i]];
          }
        }
        return ret;
      }
    }
  });

  Model.include(Leverage.Events);
  Model.include(Leverage.Validations);
  Model.include(Leverage.Callbacks);

  this.Leverage.Model = Model;
}.call(this));
