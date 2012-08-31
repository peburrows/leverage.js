(function(){
  // I think we might want to change the errors array to a hash at some point
  var Errors = function(errors){ this.errors = errors || []; };

  Errors.prototype.blank = function(){ return this.errors.length === 0; };
  Errors.prototype.add   = function(attr, msg){ this.errors.push({attribute: attr, message: msg}); };

  var Validations = {
    instanceMethods: {
      getErrors : function(){
        this._leverageErrors = this._leverageErrors || new Errors();
        return this._leverageErrors;
      },

      isValid: function(){
        this.validate();
        return this.getErrors().blank();
      },

      validate: function(){
        this._leverageErrors = new Errors();
        this._leverageValidations = this._leverageValidations || {};
        var v = this._leverageValidations;

        for(var validation in v){
          for (var i = v[validation].length - 1; i >= 0; i--) {
            v[validation][i].call(this);
          }
        }
      },

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
          return (!this[attr] || this[attr].length < len);
        });
      },

      __clearValidations: function(){
        this.prototype._leverageValidations = {};
      }
    }
  };

  var validation = function(attr, msg, fn){
    this.prototype._leverageValidations = this.prototype._leverageValidations || {};
    this.prototype._leverageValidations[attr] = this.prototype._leverageValidations[attr] || [];
    this.prototype._leverageValidations[attr].push(function(){
      if(fn.call(this)){ this._leverageAddError(attr, msg); }
    });
  };

  this.Leverage.Validations = Validations;
}.call(this));