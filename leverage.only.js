/*! Leverage.js - v0.1.0 - 2013-10-29
* Copyright (c) 2013 Phil Burrows; Licensed MIT */
;(function($){

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
  var Utils = {};

  var escapes = {
      '&': '&amp;'
    , '<': '&lt;'
    , '>': '&gt;'
    , '"': '&quot;'
    , "'": '&#x27;'
    , '/': '&#x2F;'
  };

  var escapeArray = [];
  for(var key in escapes){
    escapeArray.push(key);
  }

  var escapeRegExp = new RegExp('[' + escapeArray.join('') + ']', 'g');

  Utils.extend = function(obj, source){
    if (source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    }
    return obj;
  };

  Utils.defaults = function(obj, source){
    if (source) {
      for (var prop in source) {
        if (obj[prop] === void 0) obj[prop] = source[prop];
      }
    }
    return obj;
  };

  Utils.escape = function(string){
    if (string == null) return '';
    return ('' + string).replace(escapeRegExp, function(match) {
      return escapes[match];
    });
  };

  this.Leverage.Utils = Utils;

  Function.prototype.include = function(){
    for (var i = 0; i < arguments.length; i++){
      // need to avoid overwriting the initialize method...
      var oldInit = this.prototype.__initialize
        , argInit = arguments[i].__initialize;

      if(!argInit){ argInit = arguments[i].instanceMethods ? arguments[i].instanceMethods.__initialize : null; }
      if(!argInit){ argInit = arguments[i].classMethods    ? arguments[i].classMethods.__initialize    : null; }

      var newInit;
      if(argInit){
        newInit = function(){
          if( argInit ){ argInit.apply(this, arguments); }
          if( oldInit ){ oldInit.apply(this, arguments); }
        };
      }


      if(arguments[i].instanceMethods){
        Leverage.Utils.extend(this.prototype, arguments[i].instanceMethods);
      }else{
        Leverage.Utils.extend(this.prototype, arguments[i]);
      }

      if(arguments[i].classMethods){ Leverage.Utils.extend(this, arguments[i].classMethods); }

      this.prototype.__initialize = newInit || this.prototype.__initialize;
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
        this.prototype[fn] = Leverage.Utils.extend(function(){
          callback.apply(this, arguments);
          return orig.apply(this, arguments);
        }, orig);
      },

      after: function(fn, callback){
        var orig = this.prototype[fn];
        this.prototype[fn] = Leverage.Utils.extend(function(){
          var ret = orig.apply(this, arguments);
          callback.apply(this, arguments);
          return ret;
        }, orig);
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

      __initialize: function(){
        var self = this;
        for(var prop in this){
          if(typeof this[prop] !== 'undefined' && this[prop].__boundProperties){
            for (var i = this[prop].__boundProperties.length - 1; i >= 0; i--) {
              // do this in a function so we make sure not to screw up variables
              (function(p, ind){
                this.bind('change:'+this[p].__boundProperties[ind], function(e, data){
                  self.trigger('change:'+p);
                });
              }.call(this, prop, i));
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
  Events.on   = Events.bind;

  this.Leverage.Events = Events;
}.call(this));

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

    Leverage.Utils.extend(child, parent);

    var Noop = function(){ this.constructor = child; };
    Noop.prototype = parent.prototype;
    child.prototype = new Noop();

    if(instanceProps){ Leverage.Utils.extend(child.prototype, instanceProps); }
    if(classProps)   { Leverage.Utils.extend(child, classProps); }

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

(function(){
  var Controller = Leverage.Class.extend({
    __initialize: function(){
      var self = this;
      this.events = this.events || {};
      this.__handlers = {};
      // we should possibly delegate these via the doc if this.el isn't set
      if(this.el){
        if(typeof this.el === 'string'){ this.el = $(this.el); }
        var len = this.events.length;

        for(var key in this.events){
          var parts    = key.split(/\s+/)
            , handlers = [];

          if(typeof this.events[key] !== 'string'){
            // must have been an array
            // so we need to loop through the array and add each to the handlers
            for (var i = this.events[key].length - 1; i >= 0; i--) {
              handlers.push( this[this.events[key][i]] );
            }
          }else{
            handlers.push(this[this.events[key]]);
          }

          // just store a copy of the handlers for reference (and testing)
          this.__handlers[key] = this.__handlers[key] || [];
          for (var ii = handlers.length - 1; ii >= 0; ii--) {
            this.__handlers[key].push(handlers[ii]);
          }

          this.el.delegate(parts[0], parts[1], function(e){
            // pass the event and element to the handler(s)
            var len = handlers.length;
            for(var i=0; i < len; i++){
              handlers[i].call(self, e, this);
            }
          });
        }
      }
    },

    html: function(data){
      if(this.el){ return this.el.html(data); }
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

(function() {
  var ref
    , hasPushState = ((ref = window.history) != null ? ref.pushState : void 0) != null;

  // ------ URL -------- //
  var URL = function(url){
    var a = document.createElement('a');
    a.href = url;
    // this.url = url;
    this.queryString = a.search.replace(/^\?/, '');
    this.hash        = a.hash.replace(/^#/, '');
    this.path        = a.pathname;

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

    this.perform  = function(){
      if(route){
        router.trigger('request:before');
        // route.handler.call(this);
        route.handler(this);
        router.trigger('request');
      }
    };
  };

  // ------ Router -------- //
  var Router = function(options){
    if(options == null){ options = {}; }

    this.options = $.extend({}, {
        pushState: true
      , test:      false
    }, options);

    this.usePushState = this.options.pushState && hasPushState;

    var self    = this
      , router  = self;

    var routes = [],
        catchAll, defaultRoute, queryString, fragment, requestUrl;

    this.updateUrl = function(whereTo){
      var url = new URL(whereTo);
      if(this.usePushState){
        // here. we. go.
        return history.pushState({}, document.title, url.fullPath);
      }else{
        // we can't really push a hash onto the hash, so we push the path w/o the hash instead
        return window.location.hash = url.fullPathWithoutHash;
      }
    };

    this.createRequest = function(path, method, body){
      var request = new Request(path, method, body, this);
      request.perform();
    };

    // alias as navigate and goTo
    this.goTo     = function(path){
      // okay, here's the deal:
      // if we're testing, we don't want to actually want to change the URL
      // instead, we're just going to call the handler for the change event
      // that way, we can test the routes w/o changing the URL
      if(this.options.test) { this.handleUrlChange(path); }
      else                  { this.updateUrl(path); }
    };

    this.navigate = this.goTo;

    this.handleUrlChange = function(url){
      if(this.usePushState){
        if(url == null){ url = document.location; }
        this.createRequest( new URL(url).fullPath );
      }else{
        var parsed = new URL(url || document.location)
          , path   = (url == null ? parsed.hash : parsed.fullPathWithoutHash );
        this.createRequest( path );
      }
    };

    this.pushDefaultRoute = function(){
      if(defaultRoute){ this.goTo(defaultRoute); }
    };

    this.setDefault = function(route)   { defaultRoute = route; };
    this.addRoute   = function(r)       { routes.push(r); };
    this.routes     = function()        { return routes; };

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
    if(!this.options.test){
      if(this.usePushState){
        $(window).bind('popstate',   function(){ self.handleUrlChange(); });
      }else{
        $(window).bind('hashchange', function(){ self.handleUrlChange(); });
      }
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

  Router.prototype.resources = function(resource, handlers, options){
    // thinking this will eventually allow us to specify things like:
    // {collection: {'search': UserController.search} }
    if(options == null){ options = {}; }
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
      // I think we can just check for equality instead of using a regexp
      if(action === 'show'){
        self.define(resource + '/:id', handlers[action]);
      }else if(action === 'index'){
        self.define(resource, handlers[action]);
      }else if(action === 'edit'){
        self.define(resource + '/:id/edit', handlers[action]);
      }else if(action === 'update'){
        self.define(resource + '/:id/update', handlers[action]);
      }else if(action === 'delete'){
        self.define(resource + '/:id/delete', handlers[action]);
      }
    }

    // return this so we can chain methods
    return this;
  };

  Router.include(Leverage.Events);
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

  var extractValueAndObject = function(code, settings){
    code  = unescape(code).replace(/^\s+|\s+$/g, '');
    var parts = code.split('.')
      , val   = parts[parts.length-1]
      , obj;

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

    return {obj: obj, val: val, isFunc: isFunc, code: code};
  };

  var Template = function(text, data, settings){
    settings = Leverage.Utils.defaults(settings || {}, Template.settings);

    // Compile the template source, taking care to escape characters that
    // cannot be included in a string literal and then unescape them in code
    // blocks.
    var source = "__p+='" + text
      .replace(escaper, function(match) {
        return '\\' + escapes[match];
      })
      .replace(settings.bind || noMatch, function(match, code){
        var ret = extractValueAndObject(code, settings);

        var s  = "'+\n__bind(" + ret.obj + ", '" + ret.val + "'," + ret.isFunc + ")+\n";
            s += "'<span class=\"' + __className(" + ret.obj + ",'" + ret.val + "') + '\">'+(" + unescape(ret.code) + ")+'</span>'+\n'";
        return s;
      })
      .replace(settings.modelBind || noMatch, function(match, code){
        var ret = extractValueAndObject(code, settings);

        var parts     = ret.val.split(/\s*:\s*/)
          , bindEvent = parts.length > 1 ? parts[1] : 'onchange';

        if(!(/^on/).test(bindEvent)){ bindEvent = 'on'+bindEvent; }

        // now, make sure we have only what we need in the value
        ret.val = parts[0];
        code    = code.split(/\s*:\s*/)[0];

        var k  = "'+\n__boundModel(" + ret.obj + ")+\n'";
            // don't need the closing quotation here because the template should already include it
            k += "'+\n(" + unescape(code) + ")+'\" " + bindEvent + "=\"Leverage.Template.onInputChange(\\'' + __binderId(" + ret.obj + ",'" + ret.val + "') + '\\', this)'+\n'";

        return k;
      })
      .replace(settings.escape || noMatch, function(match, code) {
        return "'+\nLeverage.Utils.escape(" + unescape(code) + ")+\n'";
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
      "var __binderId=function(binder, attr){ return binder._leverageID + '-' + attr.replace(/\(\)\s*$/, ''); };" +
      "var __className=function(binder, attr){ return 'data-bind-'+__binderId(binder,attr); };" +
      "var __bind=function(binder, attr, isFunc){ var c=__className(binder,attr); if(!Leverage.Template.allBindings[c]){ binder.bind('change:'+attr, function(newVal){var h = $('.'+c); if(isFunc){ h.text(binder[attr]()); }else{ h.text(newVal); } }); Leverage.Template.allBindings[c]=true; } return''; };\n" +
      "var __boundModel=function(m){ if(!Leverage.Template.boundModels[m._leverageID]) Leverage.Template.boundModels[m._leverageID] = m; return ''; };" +


      // "var __bindFunc=function(binder, func, id){if!}"
      source + "return __p;\n";

    var render = new Function(settings.variable || 'obj', source);
    if (data){ return render(data); }
    var template = function(data) {
      return render.call(this, data);
    };

    // Provide the compiled function source as a convenience for build time
    // precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' +
      source + '}';

    return template;
  };

  Template.settings = {
      interpolate : /\{=(.+?)=\}/g      // {= interpolate =}
    , escape      : /\{==(.+?)==\}/g    // {== escape ==}
    , evaluate    : /\{%(.+?)%\}/g      // {% evaluate %}
    , bind        : /\{=>(.+?)<=\}/g    // {=> bind <=}
    , modelBind   : /\{<=(.+?)=>\}/g    // {<= modelBind =>}
    , twoWayBind  : /\{<=>(.+?)<=>\}/g  // {<=> twoWayBind <=>}
  };

  Template.onInputChange = function(what, input){
    var parts = what.split('-')
      , id    = parts[0]
      , attr  = parts[1]
      , model = Template.boundModels[id]
      , value = $(input).val();

    if(model){ model.set(attr, value); }
  };

  Template.allBindings = {};

  // I think we might want to store these on each Template instance
  // otherwise, we're probably going to get a bunch of memory bloat over time
  Template.boundModels = {};

  this.Leverage.Template = Template;
}.call(this));

}.call(this, $));