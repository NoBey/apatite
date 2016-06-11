'use strict';

var ApatiteResultSet = require('../../lib/database/apatite-result-set.js');

class ApatiteTestResultSet extends ApatiteResultSet {
    constructor(dbCursor) {
        super(dbCursor);
    }

    fetchAllRows(onRowsFetched) {
        onRowsFetched(null, this.dbCursor);
    }

}

module.exports = ApatiteTestResultSet;