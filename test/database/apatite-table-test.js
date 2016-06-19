'use strict';

var assert = require('assert');
var should = require('chai').should();
var expect = require('chai').expect;

var Table = require('../../lib/database/apatite-table');
var Column = require('../../lib/database/apatite-column');
var IntegerDataType = require('../../lib/database-type/apatite-integer-data-type');

describe('ApatiteTableTest', function () {
    it('Table / Column Validity', function () {
        var testTable = new Table(null);

        (function () {
            testTable.validate();
        }).should.Throw('Invalid table name.');

        testTable = new Table('TESTTABLE');
        
        (function () {
            testTable.validate();
        }).should.Throw('No columns defined for table: TESTTABLE.');
        
        var dataType = new IntegerDataType(10);
        var testColumn = new Column('TESTCOLUMN', testTable, dataType);

        (function () {
            testTable.validate();
        }).should.Throw('No primary key columns defined for table: TESTTABLE.');
        
        testColumn.bePrimaryKey();
        (function () {
            testColumn.bePrimaryKey();
        }).should.Throw('Column: TESTCOLUMN already defined as primary key in table: TESTTABLE.');

        (function () {
            new Column('TESTCOLUMN', testTable, dataType);
        }).should.Throw('Column: TESTCOLUMN already exists in table: TESTTABLE.');

        (function () {
            new Column('', testTable, dataType);
        }).should.Throw('Column name invalid.');

        (function () {
            new Column(null, testTable, dataType);
        }).should.Throw('Column name invalid.');

        (function () {
            new Column('TESTCOLUMN2', testTable, null);
        }).should.Throw('Column: TESTCOLUMN2 data type invalid.');
    })
})
