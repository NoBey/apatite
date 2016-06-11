'use strict';

var ApatiteStringDataType = require('./apatite-string-data-type.js');

class ApatiteVarCharDataType extends ApatiteStringDataType {
    constructor(length) {
        super(length);
    }
}

module.exports = ApatiteVarCharDataType;