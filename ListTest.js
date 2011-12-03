(typeof define === "undefined" ? function ($) { $(require, exports, module); } : define)(
function (require, exports, module, undefined) {
	'use strict';

	var assert = require('assert'),
		List = require('./List'),
		testCase = require('./test/promiseTestCase');

	module.exports = testCase({
		'test List has a push function': function () {
			var list = new List();

			assert.equal(typeof list.push, 'function');
		},

		'test List has an iterate function': function () {
			var list = new List();

			assert.equal(typeof list.iterate, 'function');
		},

		'test push adds a node to the list': function () {
			var list = new List(),
				data = {};

			list.push(data);
			assert.equal(list.next.data, data);
			assert.equal(list.prev.data, data);
		},

		'test push returns a handle to remove the node': function () {
			var list = new List(),
				data = {},
				remove = list.push(data);

			assert.equal(typeof remove, 'function');

			remove();
			assert.equal(list.next, list.prev);
			assert.notEqual(list.next.data, data);
		},

		'test iterate calls iterator with each node in the list': function () {
			var list = new List(),
				foo = 'foo',
				bar = 'bar',
				iterator = this.spy(),
				context = {};

			list.push(foo);
			list.push(bar);

			list.iterate(iterator, context);

			assert.ok(iterator.calledTwice);
			assert.equal(iterator.getCall(0).args[0], foo);
			assert.equal(iterator.getCall(1).args[0], bar);
			assert.ok(iterator.alwaysCalledOn(context));
		}
	});

	if (module == require.main) require('test').run(module.exports);
});