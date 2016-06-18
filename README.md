﻿# Apatite

Object persistence framework for Node.js.

## Prerequisites

  * Node version >=6.1.0. ES6 classes are required.
  * [oracledb](https://github.com/oracle/node-oracledb) if you plan to use Oracle
  * [pg](https://github.com/brianc/node-postgres) if you plan to use Postgres

## Installation

```bash
$ npm install apatite
```

## Quick Start

1. Install the prerequisites.

2. Create your class and define a static method getModelDescriptor which takes apatite as an argument.

	```js
	class Department {
		constructor() {
			this.oid = 0;
			this.name = '';
		}

		printName() {
			console.log(this.name);
		}

		static getModelDescriptor(apatite) {
			var table = apatite.newTable('DEPT');
			var modelDescriptor = apatite.newModelDescriptor(this, table);

			var column = table.addNewColumn('OID', apatite.dialect.newSerialType());
			column.bePrimaryKey();
			modelDescriptor.newSimpleMapping('oid', column);

			column = table.addNewColumn('NAME', apatite.dialect.newVarCharType(100));
			modelDescriptor.newSimpleMapping('name', column);

			return modelDescriptor;
		}
	}
	```

3. Register your models.

	```js
	// Oracle
	var connOptions = { userName: 'apatite', password: 'apatite', connectionInfo: 'localhost/apatite' };
	var apatite = require('apatite').forOracle(connOptions);
	```

	```js
	// Postgres
	var connOptions = { userName: 'apatite', password: 'apatite', connectionInfo: 'localhost/apatite' };
	var apatite = require('apatite').forPostgres(connOptions);
	```

	```js
	apatite.registerModel(Department);
	```

4. Create session and start querying your objects.

	```js
	// Creates a new session and database connection
	apatite.newSession(function (err, session) {
		if (err) {
			console.error(err.message);
			return;
		}
		var query = session.newQuery(Department);
		query.execute(function(err, departments) {
			if (err) {
				console.error(err.message);
				return;
			}
			console.log(JSON.stringify(departments));
			if (departments.length)
				departments[0].printName();
			endSession(session);
		});
	});

	//closes the database connection
	function endSession(session) {
		session.end(function(err) {
			if (err)
				console.error(err.message);
		})
	}
	```

5. Do changes to your objects and save.

	```js
	...
		// Create new department and register it to session
		var changesToDo = function (changesDone) {
			var department = new Department();
			department.name = 'Sales';
			session.registerNew(department);
			changesDone(); // must be called when you are done with all changes
		}

		session.doChangesAndSave(changesToDo, function (saveErr) {
			if (saveErr)
				console.error(saveErr.message);
		});
	...
	```

	```js
	...
		// Change an existing department
		var changesToDo = function (changesDone) {
			var query = session.newQuery(Department);
			query.attr('name').eq('Sales');
			query.execute(function(err, departments) {
				if (err) {
					changesDone(err);
					return;
				}
				departments[0].name = 'Pre-Sales';
				changesDone(); // must be called when you are done with all changes
			});
		}

		session.doChangesAndSave(changesToDo, function (saveErr) {
			if (saveErr)
				console.error(saveErr.message);
		});
	...
	```

	```js
	...
		// Delete an existing department
		var changesToDo = function (changesDone) {
			var query = session.newQuery(Department);
			query.attr('name').eq('Pre-Sales');
			query.execute(function(err, departments) {
				if (err) {
					changesDone(err);
					return;
				}
				session.registerDelete(departments[0]);
				changesDone(); // must be called when you are done with all changes
			});
		}

		session.doChangesAndSave(changesToDo, function (saveErr) {
			if (saveErr)
				console.error(saveErr.message);
		});
	...
	```

## Links

  - [Documentation](https://github.com/apatitejs/doc/blob/master/doc.md)
  - [Example App](https://github.com/apatitejs/apatite-example-app)

## Tests

To run the tests, install [mocha](https://github.com/mochajs/mocha), [chai](https://github.com/chaijs/chai) and then run:

```bash
$ npm test
```

## License

  [MIT](LICENSE)