describe 'Leverage.Validations', ->
  User = Leverage.Class.extend(attrs:{})
  User.include(Leverage.Validations)

  beforeEach ->
    @user = new User

  it 'should add the #validate method', ->
    expect(@user.validate).toEqual(jasmine.any Function)

  describe 'validatesPresenceOf', ->
    User.validatesPresenceOf('firstName')
    User.validatesPresenceOf('lastName', 'give ma a value')

    beforeEach ->
      @user = new User
      @user.validate()

    describe 'is invalid', ->
      it 'should report as invalid', ->
        expect(@user.isValid()).toEqual(false)

      it 'should add an error for each missing attribute', ->
        errors = @user.getErrors()
        expect(errors.blank()).toEqual(false)
        expect(errors.errors.length).toEqual(2)

      describe 'when attributes are assigned empty strings', ->
        beforeEach ->
          @user.firstName = @user.lastName = ''
          @user.validate()

        it 'should report as invalid', ->
          expect(@user.isValid()).toEqual(false)

        it 'should add an error for each missing attribute', ->
          errors = @user.getErrors()
          expect(errors.blank()).toEqual(false)
          expect(errors.errors.length).toEqual(2)

    describe 'is valid', ->
      beforeEach ->
        @user.firstName = @user.lastName = 'test'
        @user.validate()

      it 'should report as valid', ->
        expect(@user.isValid()).toEqual(true)

      it 'should not add any errors', ->
        expect(@user.getErrors().blank()).toEqual(true)

  describe 'validatesLengthOf', ->
    Length = Leverage.Class.extend()
    Length.include(Leverage.Validations)
    Length.validatesLengthOf('firstName', 3)
    beforeEach ->
      @l = new Length
      @l.validate()

    describe 'is invalid', ->

      it 'should report as invalid', ->
        expect(@l.isValid()).toEqual(false)

      it 'should add the proper number of errors', ->
        expect(@l.getErrors().errors.length).toEqual(1)
