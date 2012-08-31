# Features
* data bindings (models --> templates)
* modular, extensible
* validations
* callbacks

## Template stuff:
```javascript
{% evaluate %}
{= interpolation =}             : {== escapedInterpolation ==}
{=> binding <=}                 : {==> escapedBinding <==}
{<= templateToModelBinding =>}
{=> twoWayBinding =>}           : {==> escapedTwoWayBinding ==>}
```

*Bind template to the model*
```javascript
  "{=> user.firstName <=}"
  // would essentially become:
  "{% bind(user, 'firstName', 75044602054567897090); %}" +
  "<span class='data-bind-75044602054567897090'>{{ user.firstName }}</span>"
```

form field bindings (within a template)
we need a way to say "push changes from this field into the model"
```html
<input type="text" value="{{ user.firstName }}" {<= user.firstName =>} >
```

//