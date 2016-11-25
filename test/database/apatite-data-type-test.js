'use strict';

var assert = require('assert');
var should = require('chai').should();
var expect = require('chai').expect;

var Table = require('../../lib/database/apatite-table');
var Column = require('../../lib/database/apatite-column');
var ApatiteTestDialect = require('../database/apatite-test-dialect.js');
var testTable = new Table('TESTTABLE', new ApatiteTestDialect({ userName: 'apatite', password: 'test' }));

describe('ApatiteDataTypeTest', function () {
    it('Decimal Data Type Validity', function () {
        var ApatiteDecimalDataType = require('../../lib/database-type/apatite-decimal-data-type');
        var dataType = new ApatiteDecimalDataType(null);
        var testColumn;
        (function () {
            testColumn = new Column('TESTDECCOLUMN', testTable, dataType);
        }).should.Throw('Invalid length specified for column: TESTDECCOLUMN in table TESTTABLE.');
        
        dataType = new ApatiteDecimalDataType(0);
        (function () {
            testColumn = new Column('TESTDECCOLUMN', testTable, dataType);
        }).should.Throw('Invalid length specified for column: TESTDECCOLUMN in table TESTTABLE.');
        var dataType = new ApatiteDecimalDataType(1,null);
        var testColumn;
        (function () {
            testColumn = new Column('TESTDECCOLUMN', testTable, dataType);
        }).should.Throw('Invalid precision specified for column: TESTDECCOLUMN in table TESTTABLE.');
        
        dataType = new ApatiteDecimalDataType(2, 0);
        (function () {
            testColumn = new Column('TESTDECCOLUMN', testTable, dataType);
        }).should.Throw('Invalid precision specified for column: TESTDECCOLUMN in table TESTTABLE.');
    });
    it('String Data Type Validity', function () {
        var StringDataType = require('../../lib/database-type/apatite-string-data-type');
        var dataType = new StringDataType(null);
        var testColumn;
        (function () {
            testColumn = new Column('TESTSTRINGCOLUMN', testTable, dataType);
        }).should.Throw('Invalid length specified for column: TESTSTRINGCOLUMN in table TESTTABLE.');
        
        dataType = new StringDataType(0);
        (function () {
            testColumn = new Column('TESTSTRINGCOLUMN', testTable, dataType);
        }).should.Throw('Invalid length specified for column: TESTSTRINGCOLUMN in table TESTTABLE.');
    });
    it('Date Data Type Validity', function () {
        var DateDataType = require('../../lib/database-type/apatite-date-data-type');
        var dataType = new DateDataType();
        (function () {
            var testColumn = new Column('TESTDATECOLUMN', testTable, dataType);
        }).should.not.Throw();
    });
})
