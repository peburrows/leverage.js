
(function(){
  var Leverage = {}

  Leverage.noop = function(){};
  Leverage.bind = function(fn, obj){ return function(){ return fn.apply(obj, arguments); }; };

  Leverage.bindLeverageFunctions = function(obj){
    // var l = obj._leverage;
    for(fn in obj){
      if( (/^_leverage/).test(fn) && [fn].apply ){
        console.log('binding: ' + fn);
        l[fn] = Leverage.bind(l[fn], obj);
      }
    }
  };

  this.Leverage = Leverage;
}).call(this);
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
}).call(this);
(function(){
  // I think we might want to change the errors array to a hash at some point
  var Errors = function(errors){ this.errors = errors || []; };

  Errors.prototype.blank = function(){ return this.errors.length === 0; };
  Errors.prototype.add   = function(attr, msg){ this.errors.push({attribute: attr, message: msg}); };

  var Validations = {
    instanceMethods: {
      getErrors : function(){
        this._leverageErrors = this._leverageErrors || new Errors();
        return this._leverageErrors;
      },

      isValid: function(){
        this.validate();
        return this.getErrors().blank();
      },

      validate: function(){
        this._leverageErrors = new Errors();
        this._leverageValidations
        var v = this._leverageValidations;

        for(validation in v){
          for (var i = v[validation].length - 1; i >= 0; i--) {
            v[validation][i].call(this);
          }
        }
      },

      _leverageAddError     : function(attr, error){ this.getErrors().add(attr, error); }
    },

    classMethods: {
      validatesPresenceOf: function(attr, msg){
        msg = msg || 'cannot be blank';
        validation.call(this, attr, msg, function(){
          return (typeof this[attr] === 'undefined' || this[attr] === '');
        });
      },

      validatesLengthOf: function(attr, len, msg){
        msg = msg || 'must be at least ' + len + ' characters in length';
        validation.call(this, attr, msg, function(){
          return (!this[attr] || this[attr].length < len);
        });
      },

      __clearValidations: function(){
        this.prototype._leverageValidations = {}
      }
    },
  };

  var validation = function(attr, msg, fn){
    this.prototype._leverageValidations = this.prototype._leverageValidations || {};
    this.prototype._leverageValidations[attr] = this.prototype._leverageValidations[attr] || [];
    this.prototype._leverageValidations[attr].push(function(){
      if(fn.call(this)){ this._leverageAddError(attr, msg); }
    });
  };

  this.Leverage.Validations = Validations;
}).call(this);
(function(){
  var Callbacks = {
    classMethods : {
      before: function(fn, callback){
        var orig = this.prototype[fn];
        this.prototype[fn] = function(){
          callback.apply(this, arguments);
          return orig.apply(this, arguments);
        };
      },

      after: function(fn, callback){
        var orig = this.prototype[fn];
        this.prototype[fn] = function(){
          var ret = orig.apply(this, arguments);
          callback.apply(this, arguments);
          return ret;
        };
      }
    }
  };

  this.Leverage.Callbacks = Callbacks;
}).call(this);
;(function(){
  var Events = {
    instanceMethods: {
      _bindings : {},
      bind: function(name, callback){
        this._bindings[name] = this._bindings[name] || [];
        this._bindings[name].push(callback);
        return this;
      },

      init: function(){
        var self = this;
        for(prop in this){
          if(typeof this[prop] !== 'undefined' && this[prop].__boundProperties){
            for (var i = this[prop].__boundProperties.length - 1; i >= 0; i--) {
              this.bind('change:'+this[prop].__boundProperties[i], function(e, data){
                self.trigger('change:'+prop);
              });
            };
          }
        }
      },

      isBound: function(name, callback){
        for (var i = this._bindings.length - 1; i >= 0; i--) {
          if(this._bindings[i] === callback){ return true; }
        };
        return false;
      },

      trigger: function(name, data){
        var callbacks = this._bindings[name];
        if(typeof callbacks !== 'undefined'){
          var len = callbacks.length;
          for (var i = 0; i < len; i++) {
            callbacks[i].call(this, data);
          };
        }
        return this;
      }
    }
  };

  this.Leverage.Events = Events;
}).call(this);
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
(function(){
  var guid = function() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+S4()+S4()+S4()+S4()+S4()+S4());
  };

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

  var Model = Leverage.Class.extend({
    __initialize: function(){
      Leverage.bindLeverageFunctions(this);
      setupBindings(this);
      this.id = this.id || guid();
    },

    set: function(attr, val, shouldTrigger){
      if(shouldTrigger == null) shouldTrigger = true;
      this[attr] = val;
      if(shouldTrigger) this.trigger('change:' + attr, val);
    }
  });

  Model.include(Leverage.Events);
  Model.include(Leverage.Validations);
  Model.include(Leverage.Callbacks);

  this.Leverage.Model = Model;
}).call(this);
;(function(){
  /*
    This templating stuff is ripped straight from Underscore.js
    with some added extensions for binding
  */

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /.^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    '\\': '\\',
    "'": "'",
    'r': '\r',
    'n': '\n',
    't': '\t',
    'u2028': '\u2028',
    'u2029': '\u2029'
  };

  for (var p in escapes) escapes[escapes[p]] = p;
  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
  var unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;

  // Within an interpolation, evaluation, or escaping, remove HTML escaping
  // that had been previously added.
  var unescape = function(code) {
    return code.replace(unescaper, function(match, escape) {
      return escapes[escape];
    });
  };

  var Template = function(text, data, settings){
    settings = _.defaults(settings || {}, Template.settings);

    // Compile the template source, taking care to escape characters that
    // cannot be included in a string literal and then unescape them in code
    // blocks.
    var source = "__p+='" + text
      .replace(escaper, function(match) {
        return '\\' + escapes[match];
      })
      .replace(settings.bind || noMatch, function(match, code){
        var code  = unescape(code).replace(/^\s+|\s+$/g, '')
          , parts = code.split('.')
          , val   = parts[parts.length-1]
          , obj;


          // if we only have an attribute, just set the object to the 'obj' variable that's
          if(parts.length === 1){ obj = settings.variable || 'obj'; }
          else{
            if(parts.length > 2){
              obj = parts.slice(0, parts.length-2).join('.');
            }else{
              obj = parts[0];
            }
          }

          var isFunc = false
            , funcReg= /\(\)\s*$/;
          if(funcReg.test(val)){
            isFunc  =true;
            val     = val.replace(funcReg, '');
          }

        var s  = "'+\n__bind(" + obj + ", '" + val + "'," + isFunc + ")+\n";
            s += "'<span class=\"' + __className(" + obj + ",'" + val + "') + '\">'+(" + unescape(code) + ")+'</span>'+\n'";
        return s;
      })
      .replace(settings.escape || noMatch, function(match, code) {
        return "'+\n_.escape(" + unescape(code) + ")+\n'";
      })
      .replace(settings.interpolate || noMatch, function(match, code) {
        return "'+\n(" + unescape(code) + ")+\n'";
      })
      .replace(settings.evaluate || noMatch, function(match, code) {
        return "';\n" + unescape(code) + "\n;__p+='";
      }) + "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __p='';" +
      "var print=function(){__p+=Array.prototype.join.call(arguments, '')};\n" +
      "var __className=function(binder, attr){ return 'data-bind-'+binder.id+'-'+attr.replace(/\(\)\s*$/, ''); };" +
      "var __bind=function(binder, attr, isFunc){ var c=__className(binder,attr); if(!Leverage.Template.allBindings[c]){ binder.bind('change:'+attr, function(newVal){var h = $('.'+c); if(isFunc){ h.text(binder[attr]()); }else{ h.text(newVal); } }); Leverage.Template.allBindings[c]=true; } return''; };\n" +


      // "var __bindFunc=function(binder, func, id){if!}"
      source + "return __p;\n";

    var render = new Function(settings.variable || 'obj', '_', source);
    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for build time
    // precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' +
      source + '}';

    return template;
  };

  Template.settings = {
      interpolate : /\{=(.+?)=\}/g    // {= interpolate =}
    , escape      : /\{==(.+?)==\}/g  // {== escape ==}
    , evaluate    : /\{%(.+?)%\}/g    // {% evaluate %}
    , bind        : /\{=>(.+?)<=\}/g  // {=> bind <=}
  };

  Template.allBindings = {};

  this.Leverage.Template = Template;
}).call(this);
