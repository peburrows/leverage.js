(function(){
  var Errors = function(errors){ this.errors = errors || []; };

  Errors.prototype.blank = function(){ return this.errors.length === 0; };
  Errors.prototype.add   = function(attr, msg){ this.errors.push(attr, msg); };

  var Validations = {
    instanceMethods: {
      getErrors : function(){ return this._leverageErrors; },

      isValid: function(){
        this.validate();
        return this.getErrors().blank();
      },

      validate: function(){
        this._leverageErrors = new Errors;
        var v = this._leverageValidations;

        for(validation in v){
          for (var i = v[validation].length - 1; i >= 0; i--) {
            v[validation][i].call(this);
          }
        }
      },

      // have these a seperate properties so _.extend doesn't overwrite the whole _leverage object
      _leverageErrors       : new Errors,
      _leverageValidations  : {},
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
          return (this[attr] && this[attr].length < len);
        });
      }
    }
  };

  var validation = function(attr, msg, fn){
    this.prototype._leverageValidations[attr] = this.prototype._leverageValidations[attr] || [];
    this.prototype._leverageValidations[attr].push(function(){
      if(fn.call(this)){ this._leverageAddError(attr, msg); }
    });
  };

  this.Leverage.Validations = Validations;
}).call(this);