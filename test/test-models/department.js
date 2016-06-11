'use strict';

class Department {
    constructor() {
        this.oid = 0;
        this.name = '';
        this.employees = [];
    }

    static getModelDescriptor(apatite) {
        var table = apatite.newTable('DEPT');
        var modelDescriptor = apatite.newModelDescriptor(Department, table);

        var column = table.addNewColumn('OID', apatite.dialect.newSerialType());
        column.bePrimaryKey();
        modelDescriptor.newSimpleMapping('oid', column);

        column = table.addNewColumn('NAME', apatite.dialect.newVarCharType(100));
        modelDescriptor.newSimpleMapping('name', column);

        modelDescriptor.newOneToManyMapping('employees', 'Employee', 'department');

        return modelDescriptor;
    }
}


module.exports = Department;