<template>
  <form
    bindsubmit="_mtFormSubmit"
    bindreset="_mtFormReset">
    <div class="field">
      <div class="field__label">name</div>
      <input type="text" name="name"/>
    </div>
    <div class="field">
      <div class="field__label">phone</div>
      <input type="text" name="phone"/>
    </div>
    <div class="field">
      <div class="field__label">验证码</div>
      <input type="text" name="verifycode"/>
    </div>
    <button
      form-type="submit"
      custom-class="a-btn-default">submit
    </button>
  </form>
</template>

<script>
  const mtFormBehvior = require('../../behaviors/mt-form.behavior')

  export default {
    behaviors: [
      mtFormBehvior,
    ],
    data() {
      return {}
    },
    lifetimes: {
      attached: function () {
      },
    },
    methods: {
      mtValidateSchema() {
        console.d( [
          globalReg.stringType(),
          ...globalReg.isPhone()
        ])
        return {
          name: [
            globalReg.stringType()
          ],
          phone: [
            globalReg.stringType(),
            ...globalReg.isPhone()
          ],
          verifycode: [
            globalReg.stringType(),
            globalReg.isOnlyHasNum()
          ]
        }
      },
      mtOnFormSubmit(value, valid, res) {
        console.log(value, valid, res)
      },
    },
  }
</script>

<style lang="scss">
  .field {
    &__label {
      color: #428bca;
    }
  }
</style>
