'use strict';

var should = require('chai').should();
var expect = require('chai').expect;

var ApatiteTestUtil = require('../apatite-test-util.js');
var util = new ApatiteTestUtil();
var ApatiteOneToOneProxy = require('../../lib/model/apatite-one-to-one-proxy.js');

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
        var mapping = modelDescriptor.newSimpleMapping('name', column);
        var value = mapping.getAttrValueFromObject(undefined, 'foo');
        expect(value).to.equal(null);
        var proxy = new ApatiteOneToOneProxy(null);
        value = mapping.getAttrValueFromObject({'foo': proxy}, 'foo');
        expect(value).to.equal(null);
        proxy.setValue('test');
        value = mapping.getAttrValueFromObject({'foo': proxy}, 'foo');
        expect(value).to.equal('test');

        column = table.addNewColumn('FOO', apatite.dialect.newVarCharType(100));
        
        (function () {
            modelDescriptor.newSimpleMapping(null, column);
        }).should.Throw('Invalid attribute name.');
    })
})
