'use strict';

var should = require('chai').should();
var expect = require('chai').expect;

var ApatiteTestUtil = require('../apatite-test-util.js');
var util = new ApatiteTestUtil();
util.autoRegisterModels = false;
var apatite = util.apatite;

describe('ApatiteModelDescriptorTest', function() {
    it('Descriptor from object Validity', function () {

        var Department = require('../test-models/department.js')
        expect(apatite.getModelDescriptor(Department)).to.not.exist
        var object = {
            table: 'DEPT',
            model: Department,
            mappings: [
                {attr: 'oid', col: 'OID', pk: true, type: 'serial'},
                {attr: 'name', col: 'NAME', type: 'varchar', length: 100},
                {attr: 'employees', toMany: {modelName: 'Employee', toOneName: 'department', cascadeOnDelete: true, orderBy: [{attr: 'name', desc: true}]}}
            ]
        }
        var descriptor = apatite.newDescriptorFromObject(object)
        expect(apatite.getModelDescriptor(Department)).to.exist
        expect(descriptor.table.tableName).to.eq(object.table)
        expect(descriptor.getMappings().length).to.eq(3)
        expect(descriptor.getMappingForAttribute('oid').column.isPrimaryKey).to.eq(true)
        expect(descriptor.getMappingForAttribute('name').column.dataType.length).to.eq(100);
        var mapping = descriptor.getMappingForAttribute('employees')
        expect(mapping.toModelName).to.eq('Employee');
        expect(mapping.toOneToOneAttrName).to.eq('department');
        expect(mapping.shouldCascadeOnDelete).to.eq(true);
        expect(mapping.orderByQuery.orderByExpressions[0].expressionValue.expressionValue).to.eq('name');
        expect(mapping.orderByQuery.orderByExpressions[0].descending).to.eq(true);
        
        (function () {
            descriptor.createColumnFromObject({col: 'foo'});
        }).should.Throw('Could not read data type of column: foo.');

        (function () {
            descriptor.createColumnFromObject({col: 'foo', type: 'fooinvalidtype'});
        }).should.Throw('Could not read data type of column: foo.');

        apatite = util.newApatite();
        var Employee = require('../test-models/employee.js')
        expect(apatite.getModelDescriptor(Employee)).to.not.exist
        var object = {
            table: 'EMP',
            model: Employee,
            mappings: [
                {attr: 'oid', col: 'OID', pk: true, type: 'serial'},
                {attr: 'name', col: 'NAME', type: 'varchar', length: 100},
                {attr: 'salary', col: 'SALARY', type: 'decimal', notNull: true, length: 12, precision: 2},
                {attr: 'joinedOn', col: 'JOINEDON', type: 'date'},
                {attr: 'department', toOne: {modelName: 'Department', isLeftOuterJoin: true, fromCols: [{col: 'DEPTOID', type: 'int', length: 10}], toCols: [{table: 'DEPT', col: 'OID', pk: true, type: 'serial'}]}}
            ]
        }
        descriptor = apatite.newDescriptorFromObject(object)
        expect(apatite.getModelDescriptor(Employee)).to.exist
        mapping = descriptor.getMappingForAttribute('department')
        expect(mapping.toModelName).to.eq('Department')
        expect(mapping.isLeftOuterJoin).to.eq(true)
        expect(mapping.columns.length).to.eq(1)
        expect(mapping.columns[0].isOneToOneColumn).to.eq(true)
        expect(mapping.toColumns.length).to.eq(1)
        expect(mapping.toColumns[0].table.tableName).to.eq('DEPT')
        var column = descriptor.getMappingForAttribute('salary').column
        expect(column.dataType.length).to.eq(12)
        expect(column.dataType.precision).to.eq(2)
        expect(descriptor.getMappingForAttribute('joinedOn').column.dataType.constructor.name).to.eq('ApatiteDateDataType');
    })
})
