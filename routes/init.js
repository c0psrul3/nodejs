var mysql = require('mysql');
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'u_nodejs',
	password: 'asd123\!\@\#',
	database: 'nodejs'
});

connection.query(
	'CREATE TABLE columns ('+
	'	id  int PRIMARY KEY AUTO_INCREMENT,'+
	'	name  VARCHAR(50) NOT NULL'+
	');', function(err, result) {
		if (err) {
			console.log(err);
		} else {
			console.log(result);
		}
	}
);

connection.query(
	'CREATE TABLE rows ('+
	'	id  int PRIMARY KEY AUTO_INCREMENT,'+
	'	text  VARCHAR(100) NOT NULL,'+
	'	column_id int NOT NULL'+
	');', function(err, result) {
		if (err) {
			console.log(err);
		} else {
			console.log(result);
		}
	}
);

connection.query(
	'ALTER TABLE rows '+
	'	ADD FOREIGN KEY (column_id)' +
	' REFERENCES columns(id)'+
	';', function(err, result) {
		if (err) {
			console.log(err);
		} else {
			console.log(result);
		}
	}
);
