'use strict';

var should = require('chai').should();
var expect = require('chai').expect;

describe('ApatiteSQLScriptCreatorTest', function () {
    var ApatiteTestUtil = require('../apatite-test-util.js');
    var util = new ApatiteTestUtil();

    it('Test Dialect SQL Creation Validity', function () {
        util.newSession(function (err, session) {
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
            expectedScript += 'CREATE TABLE ORDER (OID INT PRIMARY KEY, ORDERDATE DATE);';

            script = session.createSQLScriptForAllModels();
            expect(script).to.equal(expectedScript);
        });
    });

});