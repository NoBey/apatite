'use strict';

var ApatiteNumericDataType = require('./apatite-numeric-data-type.js');

class ApatiteDecimalDataType extends ApatiteNumericDataType {
    constructor(length, precision) {
        super(length);
        this.precision = precision;
    }
}

module.exports = ApatiteDecimalDataType;