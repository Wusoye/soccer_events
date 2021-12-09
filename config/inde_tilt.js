module.exports = function (xG, tilt) {

    this.xG = parseFloat(xG)
    this.tilt = parseFloat(tilt)

    this.calc = function (type) {

        this.type = type

        if (this.type == "incr") {

            return parseFloat(this.xG * (this.tilt / 100 * this.xG))

        } else if (this.type == "decr") {
            
            return parseFloat((this.xG * 100) / (this.tilt + 100))

        }

    }

}