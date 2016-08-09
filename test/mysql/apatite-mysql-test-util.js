'use strict';

var Apatite = require('../../lib/apatite');
var ApatiteTestUtil = require('../apatite-test-util.js');
var ApatiteMysqlDialect = require('../../lib/database/mysql/apatite-mysql-dialect.js');
var ApatiteUtil = require('../../lib/util.js');
var ApatiteSQLStatement = require('../../lib/database-statement/apatite-sql-statement.js');

class ApatiteMysqlTestUtil extends ApatiteTestUtil {
    constructor() {
        super();
    }

    getCreateTableStatements() {
        return [
            new ApatiteSQLStatement(null, "CREATE TABLE `apatite`.`dept` (`oid` INT NOT NULL AUTO_INCREMENT, `name` VARCHAR(50) NULL, PRIMARY KEY (`oid`), UNIQUE INDEX `oid_UNIQUE` (`oid` ASC))", []),
            new ApatiteSQLStatement(null, "CREATE TABLE `apatite`.`emp` (`oid` INT NOT NULL AUTO_INCREMENT,`name` VARCHAR(100) NULL, `deptoid` INT NULL, PRIMARY KEY (`oid`), UNIQUE INDEX `oid_UNIQUE` (`oid` ASC))", [])
        ];
    }

    getDropTableStatements() {
        return [
            new ApatiteSQLStatement(null, 'DROP TABLE `apatite`.`dept`', []),
            new ApatiteSQLStatement(null, 'DROP TABLE `apatite`.`emp`', [])
        ];
    }

    getCreateTableStatementsForPool() {
        return [
            new ApatiteSQLStatement(null, 'CREATE TABLE `apatite`.`temppool` (`oid` INT NOT NULL AUTO_INCREMENT, PRIMARY KEY (`oid`), UNIQUE INDEX `oid_UNIQUE` (`oid` ASC))', [])
        ];
    }

    getDropTableStatementsForPool() {
        return [
            new ApatiteSQLStatement(null, 'DROP TABLE `apatite`.`temppool`', [])
        ];
    }

    newApatite() {
        return new Apatite(new ApatiteMysqlDialect({ userName: 'apatite', password: 'apatite', connectionInfo: 'localhost/apatite' }));
    }

    existsModule() {
        return ApatiteUtil.existsModule(ApatiteMysqlDialect.getModuleName());
    }
}

module.exports = ApatiteMysqlTestUtil;