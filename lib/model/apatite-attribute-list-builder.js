'use strict';

class ApatiteAttributeListBuilder {
    constructor(session, tableRow, query) {
        this.session = session;
        this.tableRow = tableRow;
        this.query = query;
        this.descriptor = null;
        if (query) {
            this.descriptor = this.query.getModelDescriptor().findDescriptorToCreateObject(this);
        }
    }

    buildAttrList() {
        if (this.descriptor === null)
            return null;

        var self = this;
        var attrColumnMapping = self.query.attrColumnMapping;
        var attrList = {};
        this.query.attributesToFetch.forEach(function (eachAttrExpr) {
            var attrName = eachAttrExpr.expressionValue;
            var columnName = attrColumnMapping[attrName];
            attrList[attrName] = self.tableRow[columnName];
        })
        return attrList
    }

}

module.exports = ApatiteAttributeListBuilder;