'use strict';

var ApatiteDataType = require('./apatite-data-type.js');

class ApatiteNumericDataType extends ApatiteDataType {
    constructor(length) {
        super(length);
    }
}

module.exports = ApatiteNumericDataType;