(function() {
  var hasPushState = (window.history != null ? _ref.pushState : void 0) != null;

  // ------ URL -------- //
  var URL = function(url){
    var a = document.createElement('a');
    a.href = url;
    this.url = a;
    this.queryString = this.url.search.replace(/^\?/, '');
    this.hash        = this.url.hash.replace(/^#/, '');
    this.path        = this.url.pathname;

    this.fullPathWithoutHash = this.path + (this.queryString.length > 0 ? ('?'+this.queryString) : '')

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
  var Request = function(path, method, body){
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
    if(options == null) options = {};
    this.options = options;
    this.usePushState = options.pushState && hasPushState;

    var self    = this
      , router  = self;

    var routes = [],
        catchAll, defaultRoute, queryString, fragment, requestUrl;

    this.createRequest = function(path, method, body){
      var request = new Request(path, method, body);
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
    }

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
    return this
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
        partNames.push(matchedParts[1])
      }
    };

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
        if( i+1 != parts.length){
          // this is rudimentary, but for now, just drop the last character
          parts[i] = parts[i] + '/:' + parts[i].slice(0, -1) + '_id';
        }
      };
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

    // return this so we can chain methods
    return this;
  };

  Router.extend(Leverage.Events);
  this.Leverage.Router = Router;
}.call(this));