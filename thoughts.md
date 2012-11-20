## Templates

Rendering templates is going to become a two-step process:
  1. parse the template via regexps and replace values (the way we're currently doing it)
  2. walk the node tree to setup bindings and replace values

I can't say that I exactly love the idea of essentially running through each template twice, but it's better to me than moving all the logic into HTML attributes. Plus, it seems to me that the templates should be able to be used for things other than just HTML (if one wanted to)

So, a template with bindings, logic, and interpolation might look something like this:

```html
<script id="user-template" type="leverage/bound-template">
  <div>
    <span data-bind="user.fullName()"/>
    <input data-bind-value="user.firstName:onkeyup">
    <input data-bind-value="user.lastName:onkeyup">
  </div>
</script>
```

And a template that doesn't need any binding could look like this:
```html
<script id="user-template" type="leverage/template">
  <div>
    <span>{= user.fullName() =}</span>
  </div>
</script>
```