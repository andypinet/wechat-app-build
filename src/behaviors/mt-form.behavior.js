const app = getApp()

let validate = app.validate

module.exports = Behavior({
  behaviors: [],
  properties: {},
  data: {
    _mtFormData: {},
    _mtFormValid: false,
    _mtFormValidor: {},
    _mtFormScheme: {},
    _mtFormValue: {}
  },
  lifetimes: {
    attached: function () {
      console.log('attached mt')
    },
  },
  methods: {
    _mtFormSubmit(e) {
      let value = e.detail.value
      this._mtValidate(value, (errors, fields) => {
        if (this.mtOnFormSubmit) {
          this.mtOnFormSubmit(value, !errors, {
            e,
            errors,
          })
        }
      })
    },
    _mtFormReset() {
      if (this.mtOnFormReset) {
        this.mtOnFormReset()
      }
    },
    _mtValidate(value, cb) {
      if (!this.mtValidateSchema) {
        console.error('not validate schema')
      }
      let _mtFormScheme = this.mtValidateSchema()
      validate(value, _mtFormScheme, cb)
    },
    _mtSetValidaemethods(othervalidate) {
      validate = othervalidate
    }
  },
})
