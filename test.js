(typeof define === "undefined" ? function ($) { $(require, exports, module); } : define)(
function (require, exports, module, undefined) {
	'use strict';

	var Cell = require('./Cell'),
		args = process.argv.slice(2);

	while (args.length) {
		if (args.shift().match(/^--useNative/)) Cell.useNative = true;
	}

	// force a value regardless of the environment
	Cell.useNative = !!Cell.useNative;

	exports['test Cell'] = require('./CellTest');
	exports['test Subject'] = require('./SubjectTest');
	exports['test List'] = require('./ListTest');

	if (module == require.main) require('test').run(module.exports);
});