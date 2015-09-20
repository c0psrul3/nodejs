var sequelize = require('sequelize');
var nconf = require('nconf');
nconf.argv().env().file({file: 'config.json'});

var db = new sequelize(nconf.get('db:database'), nconf.get('db:user'), nconf.get('db:password'), {
	host: nconf.get('db:host'),
	dialect: 'mysql'
});

var columns = db.define('columns', {
	id: {
		type: sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	name: {
		type: sequelize.STRING,
		length: 50
	}
},
{timestamps: false});

var rows = db.define('rows', {
	id: {
		type: sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	text: {
		type: sequelize.STRING,
		length: 100
	},
	columnId: {
		field: 'column_id',
		type: sequelize.INTEGER,
		references: {
			model: columns,
			key: 'id'
		}
	}
},
{timestamps: false});

module.exports = {
	db: db,
	columns: columns,
	rows: rows
};
