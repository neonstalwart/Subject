/**
 * Test case with promises, sandboxes all test functions
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @author Ben Hockey (neonstalwart@gmail.com)
 * @license BSD
 *
 * Copyright (c) 2010-2011 Christian Johansen
 */

/*jshint
	asi: false, bitwise: false, boss: false, curly: true, eqeqeq: true, eqnull: false, es5: true,
	evil: false, expr: true, forin: true, globalstrict: false, immed: true, indent: 4, latedef: true,
	laxbreak: false, loopfunc: true, maxlen: 100, newcap: true, noarg: true, noempty: true,
	nonew: true, nomen: false, onevar: true, passfail: false, plusplus: false, shadow: false,
	strict: false, sub: false, trailing: true, undef: true, white: true
*/
/*global define: false, require: false*/

(typeof define === "undefined" ? function ($) { $(require, exports, module) } : define)(function (require, exports, module, undefined) {
	'use strict';

	var sinon = require('sinon');

	// dojo.when
	function when(promiseOrValue, callback, errback, progressHandler) {
		if (promiseOrValue && typeof promiseOrValue.then === 'function') {
			return promiseOrValue.then(callback, errback, progressHandler);
		}
		return callback ? callback(promiseOrValue) : promiseOrValue;
	}

	function makeTest(test, setUp, tearDown) {
		return function () {
			var exception,
				context = this,
				args = arguments,
				setUpResult,
				result;

			function tDown() {
				tearDown.apply(context, args);
			}

			if (typeof setUp === 'function') {
				setUpResult = setUp.apply(context, args);
			}

			try {
				result = when(setUpResult, function () {
					return test.apply(context, args);
				});
			}
			catch (e) {
				exception = e;
			}

			if (typeof tearDown === 'function') {
				when(result, tDown, tDown);
			}

			if (exception) {
				throw exception;
			}

			return result;
		};
	}

	module.exports = function testCase(tests) {
		if (!tests || typeof tests !== "object") {
			throw new TypeError("promise test case needs an object with test functions");
		}

		var methods = {},
			rPrefix = /^test/,
			setUp = tests.setUp,
			tearDown = tests.tearDown;

		Object.keys(tests).forEach(function (testName) {
			var test = tests[testName];

			if (rPrefix.test(testName) && typeof test === 'function') {
				if (setUp || tearDown) {
					test = makeTest(test, setUp, tearDown);
				}
				methods[testName] = sinon.test(test);
			}
			else if (!/^(setUp|tearDown)$/.test(testName)) {
				methods[testName] = test;
			}
		});
		return methods;
	};

});
