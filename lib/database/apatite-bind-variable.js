'use strict'

class ApatiteBindVariable {
    constructor(column, variableId, variablePrefix = '') {
        this.column = column;
        this.variableId = variableId;
        this.variablePrefix = variablePrefix;
        this.variableValue = null;
    }

    getVariableName() {
        return this.variablePrefix + this.variableId;
    }
}

module.exports = ApatiteBindVariable;