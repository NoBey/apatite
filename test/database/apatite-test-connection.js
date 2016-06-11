'use strict';

var ApatiteConnection = require('../../lib/database/apatite-connection.js');
var ApatiteError = require('../../lib/error/apatite-error');

class ApatiteTestConnection extends ApatiteConnection {
    constructor(dialect) {
        super(dialect);
        this.petRecords = [{ 'T1.OID': 1, 'T1.NAME': 'Dog' }, { 'T1.OID': 2, 'T1.NAME': 'Cat' }, { 'T1.OID': 3, 'T1.NAME': 'Mouse' }, { 'T1.OID': 4, 'T1.NAME': 'Donkey' }];
        this.petRecords2 = [{ 'T1.OID': 1, 'T1.NAME': 'Dog', 'T1.AGE': 11 }, { 'T1.OID': 2, 'T1.NAME': 'Cat', 'T1.AGE': 5 }, { 'T1.OID': 3, 'T1.NAME': 'Mouse', 'T1.AGE': 3 }, { 'T1.OID': 4, 'T1.NAME': 'Donkey', 'T1.AGE': 7 }];
        this.personRecords = [{ 'T1.OID': 1, 'T1.NAME': 'Madhu', 'T1.PETOID': null }, { 'T1.OID': 2, 'T1.NAME': 'Sam', 'T1.PETOID': 1 }, { 'T1.OID': 3, 'T1.NAME': 'Peter', 'T1.PETOID': 2 }];
        this.shapeRecords = [
            { 'T1.OID': 1, 'T1.NAME': 'Circle', 'T1.SHAPETYPE': 1, 'T1.TESTATTR': 'ci', 'T1.NOOFVERTICES': null },
            { 'T1.OID': 2, 'T1.NAME': 'Square', 'T1.SHAPETYPE': 2, 'T1.TESTATTR': 'sq', 'T1.NOOFVERTICES': 4 },
            { 'T1.OID': 3, 'T1.NAME': 'Rectangle', 'T1.SHAPETYPE': 2, 'T1.TESTATTR': 're', 'T1.NOOFVERTICES': 4 },
            { 'T1.OID': 4, 'T1.NAME': 'SemiCircle', 'T1.SHAPETYPE': 3, 'T1.TESTATTR': 'se', 'T1.NOOFVERTICES': null }
        ];
        this.departmentRecords = [
            { 'T1.OID': 1, 'T1.NAME': 'Development' },
            { 'T1.OID': 2, 'T1.NAME': 'HR' },
            { 'T1.OID': 3, 'T1.NAME': 'Sales' }
        ];
        this.employeeRecords = [
            { 'T1.OID': 1, 'T1.NAME': 'Madhu', 'T1.DEPTOID': 1 },
            { 'T1.OID': 2, 'T1.NAME': 'Peter', 'T1.DEPTOID': 2 },
            { 'T1.OID': 3, 'T1.NAME': 'Sam', 'T1.DEPTOID': 3 },
            { 'T1.OID': 4, 'T1.NAME': 'Scot', 'T1.DEPTOID': 1 },
        ];
        this.sqlResults = {
            'SELECT T1.OID, T1.NAME FROM PET T1': this.petRecords,
            'SELECT T1.OID, T1.NAME, T1.AGE FROM PET T1': this.petRecords2,
            'SELECT T1.OID, T1.NAME, T1.PETOID FROM PERSON T1': this.personRecords,
            'SELECT T1.OID, T1.NAME FROM PET T1 WHERE T1.OID = ?': [],
            'SELECT T1.OID, T1.NAME FROM PET T1 WHERE T1.OID = ?1': [this.petRecords[0]],
            'SELECT T1.OID, T1.NAME FROM PET T1 WHERE T1.OID = ?2': [this.petRecords[1]],
            'SELECT T1.OID, T1.NAME FROM PET T1 WHERE T1.OID = ?3': [this.petRecords[2]],
            'SELECT T1.OID, T1.NAME, T1.AGE FROM PET T1 WHERE T1.OID = ?': [],
            'SELECT T1.OID, T1.NAME, T1.AGE FROM PET T1 WHERE T1.OID = ?1': [this.petRecords2[0]],
            'SELECT T1.OID, T1.NAME, T1.AGE FROM PET T1 WHERE T1.OID = ?2': [this.petRecords2[1]],
            'SELECT T1.OID, T1.NAME, T1.AGE FROM PET T1 WHERE T1.OID = ?3': [this.petRecords2[2]],
            'SELECT T1.OID, T1.NAME, T1.AGE FROM PET T1 WHERE T1.OID = ?4': [this.petRecords2[4]],
            'SELECT T1.OID, T1.NAME FROM PET T1 WHERE T1.NAME = ?Dog': [this.petRecords[0]],
            'SELECT T1.OID, T1.NAME FROM PET T1 WHERE T1.NAME = ?Donkey': [this.petRecords[3]],
            'SELECT T1.OID, T1.NAME, T1.SHAPETYPE, T1.TESTATTR, T1.NOOFVERTICES FROM SHAPE T1': this.shapeRecords,
            'SELECT T1.OID, T1.NAME, T1.SHAPETYPE, T1.NOOFVERTICES, T1.TESTATTR FROM SHAPE T1': this.shapeRecords,
            'SELECT T1.OID, T1.NAME, T1.SHAPETYPE, T1.TESTATTR FROM SHAPE T1 WHERE ( T1.SHAPETYPE = ? )1': [this.shapeRecords[0]],
            'SELECT T1.NOOFVERTICES, T1.OID, T1.NAME, T1.SHAPETYPE FROM SHAPE T1 WHERE ( T1.SHAPETYPE = ? )2': [this.shapeRecords[1], this.shapeRecords[2]],
            'SELECT T1.TESTATTR, T1.OID, T1.NAME, T1.SHAPETYPE FROM SHAPE T1 WHERE ( T1.SHAPETYPE = ? )3': [this.shapeRecords[3]],
            'SELECT T1.OID, T1.NAME FROM DEPT T1': this.departmentRecords,
            'SELECT T1.OID, T1.NAME, T1.DEPTOID FROM EMP T1': this.employeeRecords,
            'SELECT T1.OID, T1.NAME FROM DEPT T1 WHERE T1.OID = ?1': [this.departmentRecords[0]],
            'SELECT T1.OID, T1.NAME FROM DEPT T1 WHERE T1.OID = ?2': [this.departmentRecords[1]],
            'SELECT T1.OID, T1.NAME FROM DEPT T1 WHERE T1.OID = ?3': [this.departmentRecords[2]],
            'SELECT T1.OID, T1.NAME, T1.DEPTOID FROM EMP T1 WHERE T1.DEPTOID = ?1': [this.employeeRecords[0], this.employeeRecords[3]],
            'SELECT T1.OID, T1.NAME, T1.DEPTOID FROM EMP T1 WHERE T1.DEPTOID = ?2': [this.employeeRecords[1]],
            'SELECT T1.OID, T1.NAME, T1.DEPTOID FROM EMP T1 WHERE T1.DEPTOID = ?3': [this.employeeRecords[2]]
        };
    }

    beginTransaction(onTransactionBegan) {
        onTransactionBegan(null);
    }

    commitTransaction(onTransactionCommitted) {
        onTransactionCommitted(null);
    }

    rollbackTransaction(onTransactionRollbacked) {
        onTransactionRollbacked(null);
    }

    basicConnect(connectionOptions, onConnected) {
        if (connectionOptions.userName !== 'apatite') {
            onConnected(new ApatiteError('User name invalid.'));
            return;
        }

        if (connectionOptions.password !== 'test')
            onConnected(new ApatiteError('Password invalid.'));
        else
            onConnected(null);
    }

    basicExecuteSQLString(sqlStr, bindings, onExecuted) {
        //console.log(sqlStr);
        //console.log(bindings);
        //if (bindings.length && (bindings[0] === 6))
        //    console.log('');
        onExecuted(null, this.sqlResults[sqlStr + bindings.join('')]);
    }
}

module.exports = ApatiteTestConnection;