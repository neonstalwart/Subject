(typeof define === "undefined" ? function ($) { $(require, exports, module); } : define)(
function (require, exports, module, undefined) {
	'use strict';

	var Subject = require('./Subject'),
		args = process.argv.slice(2);

	while (args.length) {
		if (args.shift().match(/^--useNative/)) Subject.useNative = true;
	}

	// force a value regardless of the environment
	Subject.useNative = !!Subject.useNative;

	exports['test Subject'] = require('./SubjectTest');

	if (module == require.main) require('test').run(module.exports);
});