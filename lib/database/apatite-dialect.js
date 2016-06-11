'use strict';

var ApatiteIntegerDataType = require('../database-type/apatite-integer-data-type.js');
var ApatiteSerialDataType = require('../database-type/apatite-serial-data-type.js');
var ApatiteVarCharDataType = require('../database-type/apatite-var-char-data-type.js');
var ApatiteSelectSQLBuilder = require('../sql-builder/apatite-select-sql-builder.js');
var ApatiteDeleteSQLBuilder = require('../sql-builder/apatite-delete-sql-builder.js');
var ApatiteInsertSQLBuilder = require('../sql-builder/apatite-insert-sql-builder.js');
var ApatiteUpdateSQLBuilder = require('../sql-builder/apatite-update-sql-builder.js');
var ApatiteSubclassResponsibilityError = require('../error/apatite-subclass-responsibility-error.js');

class ApatiteDialect
{
    constructor(connectionOptions) {
        this.connectionOptions = connectionOptions;
        this.apatite = null;
    }

    buildBindVariable(sqlBuilder) {
        return '?';
    }

    buildBindingsForReturningID(bindings, columnName) {
        return bindings;
    }

    buildReturningSerialIDStr(columnName) {
        return ` RETURNING ${columnName} AS "${columnName}"`;
    }

    buildExpressionForColumnInSelectStmt(sqlExpr) {
        return sqlExpr;
    }

    newConnection() {
        throw new ApatiteSubclassResponsibilityError();
    }

    connect(onConnected) {
        var connection = this.newConnection();
        connection.connect(this.connectionOptions, function (err) {
            if (err)
                onConnected(err);
            else
                onConnected(null, connection);
        });
    }

    getSelectSQLBuilder(query) {
        return new ApatiteSelectSQLBuilder(query);
    }

    getDeleteSQLBuilder(session, object) {
        return new ApatiteDeleteSQLBuilder(session, object);
    }

    getInsertSQLBuilder(session, object) {
        return new ApatiteInsertSQLBuilder(session, object);
    }

    getUpdateSQLBuilder(session, object, updatedAttrNames) {
        return new ApatiteUpdateSQLBuilder(session, object, updatedAttrNames);
    }

    getApatiteResultSet(dbCursor) {
        throw new ApatiteSubclassResponsibilityError();
    }

    newIntegerType(length) {
        return new ApatiteIntegerDataType(length);
    }

    newSerialType() {
        return new ApatiteSerialDataType();
    }

    newVarCharType(length) {
        return new ApatiteVarCharDataType(length);
    }
}

module.exports = ApatiteDialect;