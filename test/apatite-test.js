'use strict';

var assert = require('assert');
var should = require('chai').should();
var expect = require('chai').expect;

var ApatiteTestUtil = require('./apatite-test-util.js');
var util = new ApatiteTestUtil();
util.autoRegisterModels = false;
var apatite = util.apatite;

describe('ApatiteTest', function() {
    it('Model Validity', function () {
        (function () {
            apatite.registerModel(null);
        }).should.Throw('Model provided to register is invalid. Please provide a valid model.');

        (function () {
            apatite.registerModel({});
        }).should.Throw('Model provided is not a valid ES6 class.');
        
        var UserModel = function () { };
        
        (function () {
            apatite.registerModel(UserModel);
        }).should.Throw('Model provided is not a valid ES6 class.');
        
        class User {
        }
        
        (function () {
            apatite.registerModel(User);
        }).should.Throw('getModelDescriptor not defined in model: User. Define a static function named getModelDescriptor to register model.');
        
        
        User.getModelDescriptor = function () {
            return apatite.newModelDescriptor(User, apatite.newTable('USERS'));
        };
        
        (function () {
            apatite.registerModel(User);
            apatite.registerModel(User);
        }).should.Throw('Model User already registered.');
        
        
        expect(apatite.registeredDescriptors['User'].model).to.equal(User);
    });
    it('Descriptor Validity', function () {
        apatite = util.newApatite();
        (function () {
            apatite.registerModelDescriptor(null);
        }).should.Throw('Model descriptor provided to register is invalid. Please provide a valid model descriptor.');

        apatite = util.newApatite();
        (function () {
            apatite.registerModelDescriptor(apatite.newModelDescriptor({}, apatite.newTable('USERS')));
        }).should.Throw('Model provided is not a valid ES6 class.');
        
        var UserModel = function () { };

        apatite = util.newApatite();
        (function () {
            apatite.registerModelDescriptor(apatite.newModelDescriptor(UserModel, apatite.newTable('USERS')));
        }).should.Throw('Model provided is not a valid ES6 class.');

        class User {
        }

        apatite = util.newApatite();
        (function () {
            apatite.registerModelDescriptor(apatite.newModelDescriptor(User, apatite.newTable('USERS')));
            apatite.registerModelDescriptor(apatite.newModelDescriptor(User, apatite.newTable('USERS')));
        }).should.Throw('Model User already registered.');
        
        
        expect(apatite.registeredDescriptors['User'].model).to.equal(User);
    });
})
