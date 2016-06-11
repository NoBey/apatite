'use strict';

var assert = require('assert');
var should = require('chai').should();
var expect = require('chai').expect;

var Table = require('../../lib/database/apatite-table');
var Column = require('../../lib/database/apatite-column');
var testTable = new Table('TESTTABLE');

describe('ApatiteDataTypeTest', function () {
    it('Integer Data Type Validity', function () {
        var IntegerDataType = require('../../lib/database-type/apatite-integer-data-type');
        var dataType = new IntegerDataType(null);
        var testColumn;
        (function () {
            testColumn = new Column('TESTCOLUMN', testTable, dataType);
        }).should.Throw('Invalid length specified for column: TESTCOLUMN in table TESTTABLE.');
        
        dataType = new IntegerDataType(0);
        (function () {
            testColumn = new Column('TESTCOLUMN', testTable, dataType);
        }).should.Throw('Invalid length specified for column: TESTCOLUMN in table TESTTABLE.');
    });
    it('String Data Type Validity', function () {
        var StringDataType = require('../../lib/database-type/apatite-string-data-type');
        var dataType = new StringDataType(null);
        var testColumn;
        (function () {
            testColumn = new Column('TESTCOLUMN', testTable, dataType);
        }).should.Throw('Invalid length specified for column: TESTCOLUMN in table TESTTABLE.');
        
        dataType = new StringDataType(0);
        (function () {
            testColumn = new Column('TESTCOLUMN', testTable, dataType);
        }).should.Throw('Invalid length specified for column: TESTCOLUMN in table TESTTABLE.');
    });
    it('Date Data Type Validity', function () {
        var DateDataType = require('../../lib/database-type/apatite-date-data-type');
        var dataType = new DateDataType();
        (function () {
            var testColumn = new Column('TESTCOLUMN', testTable, dataType);
        }).should.not.Throw();
    });
})
