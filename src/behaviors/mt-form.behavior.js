// wxml
//
// <form
// bindsubmit="_mtFormSubmit"
// bindreset="_mtFormReset">
//   <input type="text" name="name"/>
//   <button
// form-type="submit"
// custom-class="a-btn-default">submit
//   </button>
//   </form>

// js
//
// const mtFormBehvior = require('../../behaviors/mt-form.behavior')

// handle
//
// mtValidateSchema 返回每次调用的schema
// mtOnFormSubmit 当form表单提交时回调

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
