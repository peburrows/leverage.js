(function(){
  var Errors = function(errors){ this.errors = errors || []; };

  Errors.prototype.blank = function(){ return this.errors.length === 0; };
  Errors.prototype.add   = function(attr, msg){ this.errors.push(attr, msg); };

  var Validations = {
    instanceMethods: {
      getErrors : function(){ return this._leverage.errors; },

      isValid: function(){
        this.validate();
        return this.getErrors().blank();
      },

      validate: function(){
        this._leverage.errors = new Errors;
        var v = this._leverage.validations;

        for(validation in v){
          for (var i = v[validation].length - 1; i >= 0; i--) {
            v[validation][i].call(this);
          }
        }
      },

      _leverage : {
        errors: new Errors,
        validations: {},
        addError : function(attr, error){
          this.getErrors().add(attr, error);
        }
      }
    },

    classMethods: {
      validatesPresenceOf : function(attr, msg){
        msg = msg || 'cannot be blank';
        this.prototype._leverage.validations[attr] = this.prototype._leverage.validations[attr] || [];
        this.prototype._leverage.validations[attr].push(function(){
          console.log("checking " + attr + "on", this);
          if(typeof this[attr] === 'undefined' || this[attr] === ''){ this._leverage.addError(attr, msg)}
        });
      }
    }
  };

  this.Leverage.Validations = Validations;
}).call(this);