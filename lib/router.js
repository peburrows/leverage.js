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
          , path   = (url == null ? parsed.hash : parsed.fullPathWithoutHash )
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

  Router.extend(Leverage.Events);
  this.Leverage.Router = Router;
}.call(this));
