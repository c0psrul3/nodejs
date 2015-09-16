var express = require('express');
var router = express.Router();
var async = require('async');
var bodyParser = require('body-parser');
var app = express();
// var extend = require('extend');
var clients = [];
var mysql = require('mysql');
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'u_nodejs',
	password: 'asd123\!\@\#',
	database: 'nodejs'
});

app.use(bodyParser.urlencoded({extended: false}));

/* GET home page. */
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
