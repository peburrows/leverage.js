(function() {

  describe('Leverage.Validations', function() {
    var User;
    User = function() {
      this.attrs = {};
      return this;
    };
    User.include(Leverage.Validations);
    beforeEach(function() {
      return this.user = new User;
    });
    it('should add the #validate method', function() {
      return expect(this.user.validate).toEqual(jasmine.any(Function));
    });
    describe('validatesPresenceOf', function() {
      User.validatesPresenceOf('firstName');
      User.validatesPresenceOf('lastName', 'give ma a value');
      beforeEach(function() {
        this.user = new User;
        return this.user.validate();
      });
      describe('is invalid', function() {
        it('should report as invalid', function() {
          return expect(this.user.isValid()).toEqual(false);
        });
        it('should add an error for each missing attribute', function() {
          var errors;
          errors = this.user.getErrors();
          expect(errors.blank()).toEqual(false);
          return expect(errors.errors.length).toEqual(2);
        });
        return describe('when attributes are assigned empty strings', function() {
          beforeEach(function() {
            this.user.firstName = this.user.lastName = '';
            return this.user.validate();
          });
          it('should report as invalid', function() {
            return expect(this.user.isValid()).toEqual(false);
          });
          return it('should add an error for each missing attribute', function() {
            var errors;
            errors = this.user.getErrors();
            expect(errors.blank()).toEqual(false);
            return expect(errors.errors.length).toEqual(2);
          });
        });
      });
      return describe('is valid', function() {
        beforeEach(function() {
          this.user.firstName = this.user.lastName = 'test';
          return this.user.validate();
        });
        it('should report as valid', function() {
          return expect(this.user.isValid()).toEqual(true);
        });
        return it('should not add any errors', function() {
          return expect(this.user.getErrors().blank()).toEqual(true);
        });
      });
    });
    return describe('validatesLengthOf', function() {
      var Length;
      Length = function() {};
      Length.include(Leverage.Validations);
      Length.validatesLengthOf('firstName', 3);
      beforeEach(function() {
        this.l = new Length;
        return this.l.validate();
      });
      return describe('is invalid', function() {
        it('should report as invalid', function() {
          return expect(this.l.isValid()).toEqual(false);
        });
        return it('should add the proper number of errors', function() {
          return expect(this.l.getErrors().errors.length).toEqual(1);
        });
      });
    });
  });

}).call(this);
