'use strict';

var ApatiteIntegerDataType = require('./apatite-integer-data-type.js');

class ApatiteBigIntDataType extends ApatiteIntegerDataType {
    constructor() {
        super(null);
    }
}

module.exports = ApatiteBigIntDataType;