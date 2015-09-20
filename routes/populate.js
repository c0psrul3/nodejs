var sequelize = require('sequelize');
var columns = require('./db').columns;
var rows = require('./db').rows;

columns.sync().then(function() {
	var columnList = [
		{name: 'TODO'},
		{name: 'Shopping list'},
		{name: 'Contact list'}
	];

	columnList.forEach(function(columnItem) {
		columns.findOrCreate({where: columnItem, defaults: columnItem});
	});
});

rows.sync().then(function() {
	var rowList = [
		{text: 'Cucumbers', columnId: 1},
		{text: 'Tomatos', columnId: 1},
		{text: 'Pencils', columnId: 1},
		{text: 'Honey', columnId: 1},
		{text: 'Buy groccery', columnId: 2},
		{text: 'Food consultant', columnId: 3}
	];

	rowList.forEach(function(rowItem) {
		rows.findOrCreate({where: rowItem, defaults: rowItem});
	});
});
