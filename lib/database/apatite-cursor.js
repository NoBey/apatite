'use strict';

class ApatiteCursor {
    constructor(query, apatiteResultSet) {
        this.query = query;
        this.apatiteResultSet = apatiteResultSet;
    }

    getAllResults(onResultsFetched) {
        var self = this;
        this.apatiteResultSet.fetchAllRows(function (err, rows) {
            if (err) {
                onResultsFetched(err, null);
                return;
            }
            var results = [];
            rows.forEach(function (eachRow) {
                var result = self.buildResultForRow(eachRow);
                if (result !== null)
                    results.push(result);
            });
            results = self.filterResults(results);
            onResultsFetched(null, results);
        });
    }

    filterResults(results) {
        if (!this.query.fetchesObjects())
            return results;

        if (results.length === 0)
            return results;

        var filteredResults = [];

        if (this.query.hasOnlyPrimaryKeyExpressions()) {
            return results;
        } else {
            for (var i = 0; i < results.length; i++) {
                var object = results[i];
                if (this.query.matchesObject(object))
                    filteredResults.push(object);
            }
        }
        return filteredResults;
    }

    buildResultForRow(tableRow) {
        return this.query.buildResultForRow(tableRow);
    }

    closeResultSet() {
        this.apatiteResultSet.close();
    }
}

module.exports = ApatiteCursor;