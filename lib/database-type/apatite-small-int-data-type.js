'use strict';

var ApatiteIntegerDataType = require('./apatite-integer-data-type.js');

class ApatiteSmallIntDataType extends ApatiteIntegerDataType {
    constructor() {
        super(null);
    }
}

module.exports = ApatiteSmallIntDataType;