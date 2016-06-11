'use strict';

var ApatiteResultSet = require('../apatite-result-set.js');

class ApatiteOracleResultSet extends ApatiteResultSet {
    constructor(dbCursor) {
        super(dbCursor);
        this.fetchedRows = [];
        this.resultSet = null;
    }

    fetchAllRows(onRowsFetched) {
        this.resultSet = this.dbCursor.resultSet;
        this.fetchRecords(onRowsFetched);
    }

    fetchRecords(onRowsFetched) {
        var self = this;
        if (!self.resultSet) {
            onRowsFetched(null, self.fetchedRows);
            return;
        }
        self.resultSet.getRows(100, function (err, rows) {
            if (err) {
                self.closeResultSet();
                onRowsFetched(err);
            } else if (rows.length == 0) {  // no rows, or no more rows
                self.closeResultSet();
                onRowsFetched(null, self.fetchedRows);
            } else if (rows.length > 0) {
                self.fetchedRows = self.fetchedRows.concat(rows);
                self.fetchRecords(onRowsFetched);
            }
        });
    }

    closeResultSet() {
        if (this.resultSet) {
            this.resultSet.close(function (err) { });
            this.resultSet = null;
        }
    }
}

module.exports = ApatiteOracleResultSet;