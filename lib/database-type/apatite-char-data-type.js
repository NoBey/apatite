'use strict';

var ApatiteStringDataType = require('./apatite-string-data-type.js');

class ApatiteCharDataType extends ApatiteStringDataType {
    constructor(length) {
        super(length);
    }
}

module.exports = ApatiteCharDataType;