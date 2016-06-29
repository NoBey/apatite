'use strict';

var should = require('chai').should();
var expect = require('chai').expect;

var ApatiteTestUtil = require('../apatite-test-util.js');
var util = new ApatiteTestUtil();

describe('ApatiteSimpleMappingTest', function() {
    it('Simple Mapping Validity', function () {
        var apatite = util.apatite;
        class User
        {
            constructor() {
                this.oid = 0;
                this.id = '';
                this.name = '';
            }
        }

        var table = apatite.newTable('USERS');
        var column = table.addNewColumn('OID', apatite.dialect.newIntegerType(10));
        var modelDescriptor = apatite.newModelDescriptor(User, table);

        modelDescriptor.newSimpleMapping('oid', column);
        (function () {
            modelDescriptor.newSimpleMapping('oid', column);
        }).should.Throw('Mapping for attribute: oid already exists.');
        
        column = table.addNewColumn('ID', apatite.dialect.newVarCharType(15));
        modelDescriptor.newSimpleMapping('id', column);
        
        column = table.addNewColumn('NAME', apatite.dialect.newVarCharType(100));
        modelDescriptor.newSimpleMapping('name', column);

        column = table.addNewColumn('FOO', apatite.dialect.newVarCharType(100));
        
        (function () {
            modelDescriptor.newSimpleMapping(null, column);
        }).should.Throw('Invalid attribute name.');
    })
})
