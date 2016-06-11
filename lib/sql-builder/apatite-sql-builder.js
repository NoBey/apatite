'use strict';

class ApatiteSQLBuilder {
    constructor(session) {
        this.session = session;
        this.bindVariableCount = 0;
    }

    getNextBindVariableId() {
        this.bindVariableCount++;
        return this.bindVariableCount;
    }

    buildBindVariable() {
        return this.session.apatite.dialect.buildBindVariable(this);
    }
}

module.exports = ApatiteSQLBuilder;