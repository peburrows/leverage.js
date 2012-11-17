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
    settings = _.defaults(settings || {}, Template.settings);

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
        var k  = "'+\n__boundModel(" + ret.obj + ")+\n'";
            // don't need the closing quotation here because the template should already include it
            k += "'+\n(" + unescape(code) + ")+'\" onchange=\"Leverage.Template.onInputChange(\\'' + __binderId(" + ret.obj + ",'" + ret.val + "') + '\\', this)'+\n'";
        return k;
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
      "var __binderId=function(binder, attr){ return binder.id + '-' + attr.replace(/\(\)\s*$/, ''); };" +
      "var __className=function(binder, attr){ return 'data-bind-'+__binderId(binder,attr); };" +
      "var __bind=function(binder, attr, isFunc){ var c=__className(binder,attr); if(!Leverage.Template.allBindings[c]){ binder.bind('change:'+attr, function(newVal){var h = $('.'+c); if(isFunc){ h.text(binder[attr]()); }else{ h.text(newVal); } }); Leverage.Template.allBindings[c]=true; } return''; };\n" +
      "var __boundModel=function(m){ if(!Leverage.Template.boundModels[m.id]) Leverage.Template.boundModels[m.id] = m; return ''; };" +


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
    , modelBind   : /\{<=(.+?)=>\}/g  // {<= modelBind =>}
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
  Template.boundModels = {};

  this.Leverage.Template = Template;
}.call(this));
