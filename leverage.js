/*! Leverage.js - v0.0.1 - 2012-08-31
* Copyright (c) 2012 Phil Burrows; Licensed MIT */

(function(){
  var Leverage = {};

  Leverage.noop = function(){};
  Leverage.bind = function(fn, obj){ return function(){ return fn.apply(obj, arguments); }; };

  Leverage.bindLeverageFunctions = function(obj){
    // var l = obj._leverage;
    for(var fn in obj){
      if( (/^_leverage/).test(fn) && [fn].apply ){
        console.log('binding: ' + fn);
        obj[fn] = Leverage.bindContext(obj[fn], obj);
      }
    }
  };

  this.Leverage = Leverage;
}.call(this));
(function(){
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
}.call(this));
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
        this._leverageValidations = this._leverageValidations || {};
        var v = this._leverageValidations;

        for(var validation in v){
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
        this.prototype._leverageValidations = {};
      }
    }
  };

  var validation = function(attr, msg, fn){
    this.prototype._leverageValidations = this.prototype._leverageValidations || {};
    this.prototype._leverageValidations[attr] = this.prototype._leverageValidations[attr] || [];
    this.prototype._leverageValidations[attr].push(function(){
      if(fn.call(this)){ this._leverageAddError(attr, msg); }
    });
  };

  this.Leverage.Validations = Validations;
}.call(this));
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
}.call(this));
;(function(){
  var Events = {
    instanceMethods: {
      _bindings : {},
      bind: function(name, callback){
        this._bindings[name] = this._bindings[name] || [];
        this._bindings[name].push(callback);
        return this;
      },

      initialize: function(){
        var self = this;
        for(var prop in this){
          if(typeof this[prop] !== 'undefined' && this[prop].__boundProperties){
            for (var i = this[prop].__boundProperties.length - 1; i >= 0; i--) {
              this.bind('change:'+this[prop].__boundProperties[i], function(e, data){
                self.trigger('change:'+prop);
              });
            }
          }
        }
      },

      isBound: function(name, callback){
        for (var i = this._bindings.length - 1; i >= 0; i--) {
          if(this._bindings[i] === callback){ return true; }
        }
        return false;
      },

      trigger: function(name, data){
        var callbacks = this._bindings[name];
        if(typeof callbacks !== 'undefined'){
          var len = callbacks.length;
          for (var i = 0; i < len; i++) {
            callbacks[i].call(this, data);
          }
        }
        return this;
      }
    }
  };

  // alias 'trigger' as 'fire'
  Events.fire = Events.trigger;

  this.Leverage.Events = Events;
}.call(this));
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

    child.__super = parent.prototype;

    return child;
  };

  this.Leverage.Class = Class;
}.call(this));
(function(){
  var Controller = Leverage.Class.extend({
    initialize: function(){
      var self = this;
      this.events = this.events || {};
      if(this.el){
        for(var key in this.events){
          var parts   = key.split(/\s+/)
            , handler = this[this.events[key]];

          this.el.delegate(parts[0], parts[1], function(e){
            handler.call(self, e, this);
          });
        }
      }
    }
  });

  this.Leverage.Controller = Controller;
}.call(this));
(function(){
  var guid = function() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+S4()+S4()+S4()+S4()+S4()+S4());
  };

  var setupBindings = function(obj){
    for(var prop in obj){
      if(obj[prop].__boundProperties){
        for (var i = obj[prop].__boundProperties.length - 1; i >= 0; i--) {
          var e = 'change:' + obj[prop].__boundProperties[i]
            , t = 'change:' + prop;
          obj.bind(e , function(){
            obj.trigger(t);
          });
        }
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
      if(shouldTrigger == null){ shouldTrigger = true; }
      this[attr] = val;
      if(shouldTrigger){ this.trigger('change:' + attr, val); }
    }
  });

  Model.include(Leverage.Events);
  Model.include(Leverage.Validations);
  Model.include(Leverage.Callbacks);

  this.Leverage.Model = Model;
}.call(this));
(function() {
  var ref
    , hasPushState = ((ref = window.history) != null ? ref.pushState : void 0) != null;

  // ------ URL -------- //
  var URL = function(url){
    var a = document.createElement('a');
    a.href = url;
    this.url = a;
    this.queryString = this.url.search.replace(/^\?/, '');
    this.hash        = this.url.hash.replace(/^#/, '');
    this.path        = this.url.pathname;

    this.fullPathWithoutHash = this.path + (this.queryString.length > 0 ? ('?'+this.queryString) : '');

    this.fullPath = this.fullPathWithoutHash + (this.hash.length > 0 ? ('#'+this.hash) : '');

    // now, let's get those query string params
    this.queryParams = {};
    var match,
      pl     = /\+/g,  // Regex for replacing addition symbol with a space
      search = /([^&=]+)=?([^&]*)/g,
      decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
      query  = this.queryString;

    while (match = search.exec(query)){
       this.queryParams[decode(match[1])] = decode(match[2]);
     }
  };

  // ------ Request -------- //
  var Request = function(path, method, body, router){
    var url = new URL(path),
        self = this;

    this.url          = url;
    this.path         = url.path;
    this.queryString  = url.queryString;
    this.queryParams  = url.queryParams;
    this.fullPath     = url.fullPath;
    this.method       = method || 'GET';
    this.body         = body;

    var pieces        = this.path.split('/');

    // drop the first piece if it's an empty string
    this.pathPieces = (pieces[0] === '' ? pieces.slice(1) : pieces);

    var route         = router.findRoute(this.path);
    this.pathParams   = (route ? router.pathParams(this.path, route) : {});

    this.params       = $.extend({}, this.pathParams, this.queryParams);

    this.perform      = function(){
      if(route){
        router.trigger('request:before');
        route.handler.call(this);
        router.trigger('request');
      }
    };
  };


  // ------ Router -------- //
  var Router = function(options){
    if(options == null){ options = {}; }
    this.options = options;
    this.usePushState = options.pushState && hasPushState;

    var self    = this
      , router  = self;

    var routes = [],
        catchAll, defaultRoute, queryString, fragment, requestUrl;

    this.createRequest = function(path, method, body){
      var request = new Request(path, method, body, this);
      request.perform();
    };

    this.handleUrlChange = function(e){
      if(this.usePushState){
        this.createRequest( new URL(document.location).fullPath );
      }else{
        this.createRequest( new URL(document.location).hash );
      }
    };

    this.pushDefaultRoute = function(){
      if(defaultRoute){ this.goTo(defaultRoute); }
    };

    this.setDefault = function(route)   { defaultRoute = route; };
    this.addRoute   = function(r)       { routes.push(r); };
    this.routes     = function()        { return routes; };

    this.goTo       = function(where)   {
      var url = new URL(where)
        , hash= url.hash;

      if(this.usePushState){
        // here. we. go.
        return history.pushState({}, document.title, this.fullPath);
      }else{
        // we can't really push a hash onto the hash
        return window.location.hash = this.fullPathWithoutHash;
      }
    };

    // alias goTo as navigate
    this.navigate = this.goTo;

    this.findRoute    = function(path){
      var parts;
      for(var i=0; i<routes.length; i++){
        if(routes[i].matcher.test(path)){
          return routes[i];
        }
      }
      // nothing was found, so return false (for now)
      return false;
    };

    this.pathParams   = function(path, theRoute){
      var foundParams = {};
      var parts = path.match(theRoute.matcher);
      for(var i=theRoute.params.length - 1; i >= 0; i--){
        foundParams[theRoute.params[i]] = parts[i+1];
      }
      return foundParams;
    };

    // watch url changes
    if(this.usePushState){
       $(window).bind('popstate', this.handleUrlChange);
    }else{
      $(window).bind('hashchange', this.handleUrlChange);
    }

    $(document).ready(function(){
      var currentUrl = new URL(document.location);
      if(self.usePushState){
        if(currentUrl.path && currentUrl.path !== '/'){ $(window).trigger('popstate'); }
        else{ self.pushDefaultRoute(); }
      }else{
        if(currentUrl.hash && currentUrl.hash !== '/'){ $(window).trigger('hashchange'); }
        else{ self.pushDefaultRoute(); }
      }
    });

  };

  Router.prototype.catchAll   = function(handler) {
    this.addRoute({'matcher':(/.*/), 'params':[], 'handler':handler});
    return this;
  };

  Router.prototype.define = function(route, handler){
    // add the route and handler to the routes array
    // 1. create the regular expression to use to match the routes
    var segment = /:([^:]+)/,
        parts   = route.split('/'),
        partNames = [];

    route = route.replace(/^\/+/, '');

    for (var i=0; i < parts.length; i++) {
      var matchedParts;
      if( matchedParts = parts[i].match(segment) ){
        parts[i] = '([^\\/]+)';
        partNames.push(matchedParts[1]);
      }
    }

    // join them with a slash
    var matcher = new RegExp('^' + parts.join('\\/') + '\/?$');

    // 2. add that regular express and handler to the routes
    // console.log("on a defining route, here are the partNames:", partNames, matcher);
    this.addRoute({'matcher':matcher, 'params':partNames, 'handler':handler});
    return this;
  };

  Router.prototype.resources = function(resource, handlers){
    var self = this;

    if((/\//).test(resource)){
      var parts = resource.split('/');
      for (var i=0; i < parts.length; i++) {
        if( i+1 !== parts.length){
          // this is rudimentary, but for now, just drop the last character
          parts[i] = parts[i] + '/:' + parts[i].slice(0, -1) + '_id';
        }
      }
      resource = parts.join('/');
    }

    resource = '/' + resource;
    for(var action in handlers){
      if(/show/.test(action)){
        self.define(resource + '/:id', handlers[action]);
      }else if(/index/.test(action)){
        self.define(resource, handlers[action]);
      }else if(/edit/.test(action)){
        self.define(resource + '/:id/edit', handlers[action]);
      }else if(/update/.test(action)){
        self.define(resource + '/:id/update', handlers[action]);
      }else if(/delete/.test(action)){
        self.define(resource + '/:id/delete', handlers[action]);
      }
    }

    // return this so we can chain methods
    return this;
  };

  Router.extend(Leverage.Events);
  this.Leverage.Router = Router;
}.call(this));
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

  for (var p in escapes){ escapes[escapes[p]] = p; }
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
        code  = unescape(code).replace(/^\s+|\s+$/g, '');
        var parts = code.split('.')
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
    if (!settings.variable){ source = 'with(obj||{}){\n' + source + '}\n'; }

    source = "var __p='';" +
      "var print=function(){__p+=Array.prototype.join.call(arguments, '')};\n" +
      "var __className=function(binder, attr){ return 'data-bind-'+binder.id+'-'+attr.replace(/\(\)\s*$/, ''); };" +
      "var __bind=function(binder, attr, isFunc){ var c=__className(binder,attr); if(!Leverage.Template.allBindings[c]){ binder.bind('change:'+attr, function(newVal){var h = $('.'+c); if(isFunc){ h.text(binder[attr]()); }else{ h.text(newVal); } }); Leverage.Template.allBindings[c]=true; } return''; };\n" +


      // "var __bindFunc=function(binder, func, id){if!}"
      source + "return __p;\n";

    var render = new Function(settings.variable || 'obj', '_', source);
    if (data){ return render(data, _); }
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
}.call(this));