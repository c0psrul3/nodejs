var express = require('express');
var path = require('path');
var router = express.Router();
var async = require('async');
var bodyParser = require('body-parser');
// var promise = require('bluebird');
var app = express();
var clients = [];

var nconf = require('nconf');
nconf.argv().env().file({file: 'config.json'});
var db = require('./db').db;
var columns = require('./db').columns;
var rows = require('./db').rows;

var mysql = require('mysql');
var connection = mysql.createConnection({
	host: nconf.get('db:host'),
	user: nconf.get('db:user'),
	password: nconf.get('db:password'),
	database: nconf.get('db:database')
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

var getAllRows = function(callback) {
	async.waterfall([
		function(callback) {
			columns.findAll({raw: true})
			.then(function(result) {
				callback(null, result);
			})
			.catch(function(err){
				callback(new Error('Failed getting columns: ' + err.message));
			});
		},
		function(columns, callback) {
			async.map(columns, function(column, callback2) {
				rows.findAll({
					where: {columnId: column.id},
					raw: true
				})
				.then(function(result) {
					column.rows = result;
					callback2();
				})
				.catch(function(err) {
					callback2(new Error('Failed getting rows: ' + err.message));
				});
			}, function(err) {
				if (err) callback(new Error('Failed getting rows: ' + err.message));
				callback(null, columns);
			});
		}
	], function(err, result) {
		callback (err, result)
	});
}

router.get('/', function(req, res, next) {
	getAllRows(function(err, result) {
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

router.post('/delete', function(req, res, next) {
	console.log(req.body.id);
	rows.destroy({
		where: {id: req.body.id}
	})
	.then(function(result) {
		res.end(result == 1 ? 'success' : 'fail');
	})
	.then(function(result) {
		getAllRows(function(err, result) {
			if (err) return next(err);

			clients.forEach(function(res) {
				res.render('index', {columns: result});
			});
		});
	});
});

module.exports = router;
