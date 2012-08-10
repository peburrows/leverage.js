(function(){
  var Validations = {
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

  var Errors = function(errors){
    this.errors = errors || [];
  };

  Errors.prototype.blank = function(){
    return this.errors.length === 0;
  };

  Errors.prototype.add = function(attr, msg){
    this.errors.push(attr, msg);
  }

  this.Leverage.Errors      = Errors;
  this.Leverage.Validations = Validations;
}).call(this);