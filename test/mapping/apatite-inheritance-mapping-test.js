'use strict';

var should = require('chai').should();
var expect = require('chai').expect;

var ApatiteTestUtil = require('../apatite-test-util.js');
var util = new ApatiteTestUtil();
var apatite = util.apatite;

describe('ApatiteInheritanceMappingTest', function () {
    it('Inheritance Mapping Validity', function () {
        class Shape {
            constructor(){
                this.oid = 0;
                this.name = '';
                this.shapeType = 0;
            }
        }

        var table = apatite.newTable('SHAPE');
        var shapeDescriptor = apatite.newModelDescriptor(Shape, table);
        
        var column = table.addNewColumn('OID', apatite.dialect.newIntegerType(10));
        column.bePrimaryKey();
        shapeDescriptor.newSimpleMapping('oid', column);
        
        column = table.addNewColumn('NAME', apatite.dialect.newVarCharType(100));
        shapeDescriptor.newSimpleMapping('name', column);
        
        column = table.addNewColumn('SHAPETYPE', apatite.dialect.newIntegerType(1));
        shapeDescriptor.newSimpleMapping('shapeType', column);

        class Circle extends Shape {
            constructor() {
                super();
                this.shapeType = 1;
            }
        }
                
        var circleDescriptor = apatite.newModelDescriptor(Circle, table);
        
        (function () {
            circleDescriptor.inheritFrom(circleDescriptor, apatite.newTypeFilterQuery().attr('shapeType').eq(1));
        }).should.Throw('Invalid inheritance mapping for model: Circle. Recursive inheritance detected.');
        
        (function () {
            circleDescriptor.inheritFrom(shapeDescriptor, null);
        }).should.Throw('Invalid inheritance mapping for model: Circle. Type filter query is required.');

        (function () {
            circleDescriptor.inheritFrom(shapeDescriptor, apatite.newTypeFilterQuery().attr('parent.shapeType').eq(1));
        }).should.Throw('Only simple attributes are supported at the moment for type filter queries.');

        circleDescriptor.inheritFrom(shapeDescriptor, apatite.newTypeFilterQuery().attr('shapeType').eq(1));
        
        (function () {
            shapeDescriptor.inheritFrom(circleDescriptor, apatite.newTypeFilterQuery().attr('shapeType').eq(1));
        }).should.Throw('Invalid inheritance mapping for model: Shape. Recursive inheritance detected.');

    });
})
