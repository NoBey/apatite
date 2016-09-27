'use strict';

class ApatiteDataType
{
    constructor(length) {
        this.length = length;
        this.internalDataType = null;
    }

    isSerialType() {
        return false;
    }

    validate(column) {

    }
}

module.exports = ApatiteDataType;