var express = require('express');
var router = express.Router();
var async = require('async');
var bodyParser = require('body-parser');
// var promise = require('bluebird');
var app = express();
var clients = [];
var mysql = require('mysql');
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'u_nodejs',
	password: 'asd123\!\@\#',
	database: 'nodejs'
});

app.use(bodyParser.urlencoded({extended: false}));

// var getColumns = function() {
// 	return new promise(function(resolve, reject) {
// 		connection.query('select * from columns', function(err, result) {
// 			if (err) reject(err);
//
// 			resolve(result);
// 		});
// 	});
// }
//
// var getRows = function(columnId) {
// 	console.log('getting rows for column ' + columnId);
// 	return new promise(function(resolve, reject) {
// 		connection.query('select * from rows where column_id=?', columnId, function(err, result) {
// 			if (err) reject(new Error('Failed getting rows: ' + err.message));
//
// 			resolve(result);
// 		});
// 	});
// }
//
// #<{(| GET home page. |)}>#
// router.get('/', function(req, res, next) {
// 	getColumns()
// 	.then(function(result) {
// 		result.forEach(function(column) {
// 			getRows(column.id)
// 			.then(function(columnRows) {
// 				console.log('setting child nodes for column ' + column.id, columnRows);
// 				column.rows = columnRows;
// 			});
// 		});
// 	})
// 	.catch(function(err) {
// 		return err;
// 	})
// 	.done(function(result) {
// 		console.log('rendering started');
// 		res.render('index', {columns: result});
// 	});
// });

router.get('/', function(req, res, next) {
	async.waterfall([
		function(callback) {
			connection.query('select * from columns', function(err, result) {
				if (err) callback(new Error('Failed getting columns: ' + err.message));

				callback(null, result);
			});
		},
		function(columns, callback) {
			async.map(columns, function(column, callback2) {
				connection.query('select * from rows where column_id=?', column.id, function(err,rows) {
					if (err) callback2(new Error('Failed getting rows: ' + err.message));

					column.rows = rows;
					callback2();
				});
			}, function(err) {
				if (err) callback(new Error('Failed getting rows: ' + err.message));
				callback(null, columns);
			});
		}
	], function (err, result) {
		if (err) return next(err);
		res.render('index', {columns: result});
	});
});

router.get('/subscribe', function(req, res, next) {
	clients.push(res);
	res.on('close', function() {
		clients.splice(clients.indexOf(res), 1);
	});
});

router.post('/publish', function(req, res, next) {
	async.waterfall([
		function(callback) {
			connection.query('INSERT INTO rows SET ?', req.body, function(err, result) {
				if (err) callback(new Error('Failed inserting row: ' + err.message));

				callback(null, result);
			});
		},
		function(inserted, callback) {
			connection.query('select * from columns', function(err, result) {
				if (err) callback(new Error('Failed getting columns: ' + err.message));

				callback(null, result);
			});
		},
		function(columns, callback) {
			async.map(columns, function(column, callback2) {
				connection.query('select * from rows where column_id=?', column.id, function(err,rows) {
					if (err) callback2(new Error('Failed getting rows: ' + err.message));

					column.rows = rows;
					callback2();
				});
			}, function(err) {
				if (err) callback(new Error('Failed getting rows: ' + err.message));
				callback(null, columns);
			});
		}
	], function (err, result) {
		if (err) return next(err);
		clients.forEach(function(res) {
			res.render('notes', {columns: result});
		});
		clients = [];
	});
});

module.exports = router;
