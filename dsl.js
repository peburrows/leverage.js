var UsersController = new Leverage.Controller.extend({
  events: { 'a.href click' : 'clickHandler' },
  clickHandler: function(event, el){},

  show:   function(id, request){},
  index:  function(request){},
  search: function(query, request){}
});

var Router = new Leverage.Router({pushState: true})

Router
  .define('/hello/world', function(){
    HelloController.show();
  })

  // resources
  .resources('users', {
    show:   function(request){ UsersController.show(request.params.id, request); },
    index:  function(request){ UsersController.index(request); },
    search: function(request){ UsersController.search(request.params.q, request); },
  })

  // alternatively, we could just pass the UserController to the resource definition
  .resources('users', UsersController)

  // and you can specify constraints and/or additions
  .resources('users', UsersController, {only: ['index', 'show'], collection: ['search']})

  // or, we could infer what is meant
  .resource('user') // this would call window['UserController'][action] for each matched route

  .catchAll(function(){
    // pass the request to your handler
    UserController.catchAll(this)
  })
  .setDefault('/hello/world');