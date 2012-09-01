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
    show:   function(){ UserController.show(this.params.id, this); },
    index:  function(){ UserController.index(this); },
    search: function(){ UserController.search(this.params.q, this); },
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