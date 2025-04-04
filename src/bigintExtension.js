// eslint-disable-next-line no-extend-native
BigInt.prototype.toJSON = function () {
    return Number(this.toString())
  }