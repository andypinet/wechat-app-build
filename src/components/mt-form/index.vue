<template>
  <form
    bindsubmit="_mtFormSubmit"
    bindreset="_mtFormReset">
    <input type="text" name="name"/>
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
        console.log('page mt')
      },
    },
    methods: {
      mtValidateSchema() {
        return {
          name: {type: "string", required: true},
        }
      },
      mtOnFormSubmit(value, valid, res) {
        console.log(value, valid, res)
      },
    },
  }
</script>
