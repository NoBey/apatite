'use strict';

var should = require('chai').should();
var expect = require('chai').expect;

describe('ApatiteSQLScriptCreatorTest', function () {

    var ApatitePostgresTestUtil = require('../postgres/apatite-postgres-test-util');
    var postgresUtil = new ApatitePostgresTestUtil();
    if (postgresUtil.existsModule()) {
        it('Postgres Dialect SQL Creation Validity', function (done) {
            postgresUtil.newSession(function (err, session) {
                var script = session.createSQLScriptForModel('Pet');
                expect(script).to.equal('CREATE TABLE PET (OID SERIAL PRIMARY KEY, NAME VARCHAR (100));');

                script = session.createSQLScriptForModel('Order');
                expect(script).to.equal('CREATE TABLE ORDER (OID SERIAL PRIMARY KEY, ORDERDATE TIMESTAMP);');

                script = session.createSQLScriptForModel('Product');
                expect(script).to.equal('CREATE TABLE PRODUCT (OID SERIAL PRIMARY KEY, NAME VARCHAR (50), QUANTITY NUMERIC (11, 2) NOT NULL);');

                script = session.createSQLScriptForAttribute('Pet', 'name');
                expect(script).to.equal('ALTER TABLE PET ADD (NAME VARCHAR (100));');
                session.end(function (endErr) {
                    expect(endErr).to.not.exist;
                    done();
                });
            });
        });
    }

    var ApatiteMysqlTestUtil = require('../mysql/apatite-mysql-test-util');
    var mysqlUtil = new ApatiteMysqlTestUtil();
    if (mysqlUtil.existsModule()) {
        it('Mysql Dialect SQL Creation Validity', function (done) {
            mysqlUtil.newSession(function (err, session) {
                var script = session.createSQLScriptForModel('Pet');
                expect(script).to.equal('CREATE TABLE PET (OID INT AUTO_INCREMENT PRIMARY KEY, NAME VARCHAR (100));');

                script = session.createSQLScriptForModel('Order');
                expect(script).to.equal('CREATE TABLE ORDER (OID INT AUTO_INCREMENT PRIMARY KEY, ORDERDATE DATETIME);');

                script = session.createSQLScriptForModel('Product');
                expect(script).to.equal('CREATE TABLE PRODUCT (OID INT AUTO_INCREMENT PRIMARY KEY, NAME VARCHAR (50), QUANTITY DECIMAL (11, 2) NOT NULL);');

                script = session.createSQLScriptForAttribute('Pet', 'name');
                expect(script).to.equal('ALTER TABLE PET ADD (NAME VARCHAR (100));');
                session.end(function (endErr) {
                    expect(endErr).to.not.exist;
                    done();
                });
            });
        });
    }

    var ApatiteMssqlTestUtil = require('../mssql/apatite-mssql-test-util');
    var mssqlUtil = new ApatiteMssqlTestUtil();
    if (mssqlUtil.existsModule()) {
        it('Mssql Dialect SQL Creation Validity', function (done) {
            mssqlUtil.newSession(function (err, session) {
                var script = session.createSQLScriptForModel('Pet');
                expect(script).to.equal('CREATE TABLE PET (OID INT IDENTITY(1, 1) PRIMARY KEY, NAME VARCHAR (100));');

                script = session.createSQLScriptForModel('Order');
                expect(script).to.equal('CREATE TABLE ORDER (OID INT IDENTITY(1, 1) PRIMARY KEY, ORDERDATE DATETIME);');

                script = session.createSQLScriptForModel('Product');
                expect(script).to.equal('CREATE TABLE PRODUCT (OID INT IDENTITY(1, 1) PRIMARY KEY, NAME VARCHAR (50), QUANTITY DECIMAL (11, 2) NOT NULL);');

                script = session.createSQLScriptForAttribute('Pet', 'name');
                expect(script).to.equal('ALTER TABLE PET ADD (NAME VARCHAR (100));');
                session.end(function (endErr) {
                    expect(endErr).to.not.exist;
                    done();
                });
            });
        });
    }

    var ApatiteOracleTestUtil = require('../oracle/apatite-oracle-test-util');
    var oracleUtil = new ApatiteOracleTestUtil();
    if (oracleUtil.existsModule()) {
        it('Oracle Dialect SQL Creation Validity', function (done) {
            oracleUtil.newSession(function (err, session) {
                var script = session.createSQLScriptForModel('Pet');
                var expectedScript = 'CREATE TABLE PET (OID NUMBER PRIMARY KEY, NAME VARCHAR2 (100));\r\n';
                expectedScript += 'CREATE SEQUENCE PET_seq START WITH 1;\r\n';
                expectedScript += 'CREATE OR REPLACE TRIGGER PET_trg BEFORE INSERT ON PET FOR EACH ROW BEGIN SELECT PET_seq.NEXTVAL INTO :new.OID FROM dual; END;';
                expect(script).to.equal(expectedScript);

                script = session.createSQLScriptForModel('Order');
                expectedScript = 'CREATE TABLE ORDER (OID NUMBER PRIMARY KEY, ORDERDATE DATE);\r\n';
                expectedScript += 'CREATE SEQUENCE ORDER_seq START WITH 1;\r\n';
                expectedScript += 'CREATE OR REPLACE TRIGGER ORDER_trg BEFORE INSERT ON ORDER FOR EACH ROW BEGIN SELECT ORDER_seq.NEXTVAL INTO :new.OID FROM dual; END;';
                expect(script).to.equal(expectedScript);

                script = session.createSQLScriptForModel('Product');
                expectedScript = 'CREATE TABLE PRODUCT (OID NUMBER PRIMARY KEY, NAME VARCHAR2 (50), QUANTITY NUMBER (11, 2) NOT NULL);\r\n';
                expectedScript += 'CREATE SEQUENCE PRODUCT_seq START WITH 1;\r\n';
                expectedScript += 'CREATE OR REPLACE TRIGGER PRODUCT_trg BEFORE INSERT ON PRODUCT FOR EACH ROW BEGIN SELECT PRODUCT_seq.NEXTVAL INTO :new.OID FROM dual; END;';

                script = session.createSQLScriptForAttribute('Pet', 'name');
                expect(script).to.equal('ALTER TABLE PET ADD (NAME VARCHAR2 (100));');
                session.end(function (endErr) {
                    expect(endErr).to.not.exist;
                    done();
                });
            });
        });
    }

    it('Test Dialect SQL Creation Validity', function (done) {
        var ApatiteTestUtil = require('../apatite-test-util.js');
        var util = new ApatiteTestUtil();
        util.newSession(function (sessionErr, session) {
            (function () {
                session.createSQLScriptForModel('fooandbar');
            }).should.Throw('Descriptor for model "fooandbar" not found.');
            (function () {
                session.createSQLScriptForModel(ApatiteTestUtil);
            }).should.Throw('Descriptor for model "ApatiteTestUtil" not found.');
            (function () {
                session.createSQLScriptForAttribute('fooandbar', 'abc');
            }).should.Throw('Descriptor for model "fooandbar" not found.');
            (function () {
                session.createSQLScriptForAttribute('Pet', 'abc');
            }).should.Throw('Mapping for attribute: abc not found in model: Pet.');

            var script = session.createSQLScriptForModel('Pet');
            expect(script).to.equal('CREATE TABLE PET (OID INT PRIMARY KEY, NAME VARCHAR (100));');

            script = session.createSQLScriptForModel('Order');
            expect(script).to.equal('CREATE TABLE ORDER (OID INT PRIMARY KEY, ORDERDATE DATE);');

            script = session.createSQLScriptForModel('Product');
            expect(script).to.equal('CREATE TABLE PRODUCT (OID INT PRIMARY KEY, NAME VARCHAR (50), QUANTITY DECIMAL (11, 2) NOT NULL);');

            script = session.createSQLScriptForAttribute('Pet', 'name');
            expect(script).to.equal('ALTER TABLE PET ADD (NAME VARCHAR (100));');

            var expectedScript = 'CREATE TABLE EMP (OID INT PRIMARY KEY, NAME VARCHAR (100), DEPTOID INT (10));\r\n';
            expectedScript += 'CREATE TABLE DEPT (OID INT PRIMARY KEY, NAME VARCHAR (100));\r\n';
            expectedScript += 'CREATE TABLE PET (OID INT PRIMARY KEY, NAME VARCHAR (100));\r\n';
            expectedScript += 'CREATE TABLE PERSON (OID INT (10) PRIMARY KEY, NAME VARCHAR (100), PETOID INT (10));\r\n';
            expectedScript += 'CREATE TABLE SHAPE (OID INT (10) PRIMARY KEY, NAME VARCHAR (100), SHAPETYPE INT (1), NOOFVERTICES INT (2), TESTATTR VARCHAR (2));\r\n';
            expectedScript += 'CREATE TABLE SHAPE (OID INT (10) PRIMARY KEY, NAME VARCHAR (100), SHAPETYPE INT (1), NOOFVERTICES INT (2), TESTATTR VARCHAR (2));\r\n';
            expectedScript += 'CREATE TABLE SHAPE (OID INT (10) PRIMARY KEY, NAME VARCHAR (100), SHAPETYPE INT (1), NOOFVERTICES INT (2), TESTATTR VARCHAR (2));\r\n';
            expectedScript += 'CREATE TABLE SHAPE (OID INT (10) PRIMARY KEY, NAME VARCHAR (100), SHAPETYPE INT (1), NOOFVERTICES INT (2), TESTATTR VARCHAR (2));\r\n';
            expectedScript += 'CREATE TABLE PRODUCT (OID INT PRIMARY KEY, NAME VARCHAR (50), QUANTITY DECIMAL (11, 2) NOT NULL);\r\n';
            expectedScript += 'CREATE TABLE BOOK (OID INT PRIMARY KEY, NAME VARCHAR (100), NUMBEROFPAGES INT (4));\r\n';
            expectedScript += 'CREATE TABLE ORDER (OID INT PRIMARY KEY, ORDERDATE DATE);\r\n';
            expectedScript += 'CREATE TABLE NONEXISTENT (OID INT PRIMARY KEY);';

            script = session.createSQLScriptForAllModels();
            expect(script).to.equal(expectedScript);

            session.createDBTablesForAllModels(function(err, result) {
                expect(err).to.not.exist;
            })
            session.createDBTableForModel('Pet', function(err, result) {
                expect(err).to.not.exist;
            })
            session.createDBColumnForAttribute('Pet', 'name', function(err, result) {
                expect(err).to.not.exist;
            })

            var promise
            session.connection.isDDLSqlPromiseTest = true;
            promise = session.createDBTablesForAllModels();
            promise
            .then(function(result){return session.createDBTableForModel('Pet');}, function(promiseErr){expect(promiseErr).to.not.exist;})
            .then(function(result){return session.createDBColumnForAttribute('Pet', 'oid')}, function(promiseErr){expect(promiseErr).to.not.exist;})
            .then(function(result){return session.createDBColumnForAttribute('Pet', 'name');}, function(promiseErr){expect(promiseErr).to.not.exist;})
            .then(function(result){throw new Error('Not expected to reach here.')}, function(promiseErr){expect(promiseErr.message).to.equal('SQL execution failed.'); done()});
        });
    });
});