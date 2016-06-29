'use strict';

class Pet {
    constructor() {
        this.oid = 0;
        this.name = '';
    }

    static getModelDescriptor(apatite) {
        var table = apatite.newTable('PET');
        var modelDescriptor = apatite.newModelDescriptor(Pet, table);

        var column = table.addNewPrimaryKeyColumn('OID', apatite.dialect.newSerialType());
        modelDescriptor.newSimpleMapping('oid', column);

        column = table.addNewColumn('NAME', apatite.dialect.newVarCharType(100));
        modelDescriptor.newSimpleMapping('name', column);

        return modelDescriptor;
    }
}


module.exports = Pet;