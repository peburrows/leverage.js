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