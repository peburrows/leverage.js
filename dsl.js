var UserController = new Leverage.Controller.extend({
  events: { 'a.href click' : 'clickHandler' },
  clickHandler: function(event, el){},

  show:   function(id, request){},
  index:  function(request){},
  search: function(query, request){}
});

var Router = new Leverage.Router({pushState: true})

Router
  // an explicit route
  .define('/hello/world', function(){
    HelloController.show();
  })

  // resources
  .resources('users', {
    // originally, I called the handler in the context of the request 
    // (i.e. `this` within the handler referred to the request),
    // but I think it might make more sense to pass the request as a param
    // in order to maintain the expected context within the handler (probably a controller)
    show:   function(request){ UserController.show(request.params.id, request); },
    index:  function(request){ UserController.index(request); },
    search: function(request){ UserController.search(request.params.q, request); },
  })

  // alternatively, we could just pass the UserController to the resource definition
  .resources('users', UserController)

  // and you can specify constraints and/or additions
  .resources('users', UserController, {only: ['index', 'show'], collection: ['search']})

  // or, we could infer what is meant
  .resources('user') // this would call window['UserController'][action] for each matched route

  .catchAll(function(){
    // pass the request to your handler
    UserController.catchAll(this)
  })
  .setDefault('/hello/world');