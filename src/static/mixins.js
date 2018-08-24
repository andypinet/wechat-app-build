let mixins = {}

mixins.hello = function() {
  return {
    methods: {
      sayHello() {
        console.log('hello world')
      }
    }
  }
}

module.exports = {
  get(key) {
    return mixins[key]()
  }
}
