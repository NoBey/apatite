'use strict';

class ApatiteDataType
{
    constructor(length) {
        this.length = length;
    }

    isSerialType() {
        return false;
    }

    validate(column) {

    }
}

module.exports = ApatiteDataType;