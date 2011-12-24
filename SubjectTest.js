(typeof define === "undefined" ? function ($) { $(require, exports, module); } : define)(
function (require, exports, module, undefined) {
	'use strict';

	var assert = require('assert'),
		compose = require('compose'),
		Cell = require('./Cell'),
		Subject = require('./Subject'),
		testCase = require('./test/promiseTestCase');

	module.exports = testCase({
		'test Subject has a watch function': function () {
			var subject = compose.create(Subject);

			assert.equal(typeof subject.watch, 'function', 'must have a watch function');
		},

		'test watchers for a property are called when the property is set': function () {
			var subject = compose.create(Subject),
				watch = this.spy(),
				prop = 'foo',
				value = 'bar',
				old = subject[prop];

			subject.watch(prop, watch);
			subject.set(prop, value);

			assert.ok(watch.calledWithExactly(prop, old, value), 'watcher called when property set');
			assert.ok(watch.calledOn(subject), 'watcher called in context of subject');
		},

		'test calling watch returns an `unwatch` handle': function () {
			var subject = compose.create(Subject),
				watch = this.spy(),
				prop = 'foo',
				value = 'bar',
				handle = subject.watch(prop, watch);

			assert.ok(handle, 'watch returns a handle');
			assert.equal(typeof handle.unwatch, 'function', 'remove handle returned from watch');

			handle.unwatch();
			subject.set(prop, value);
			assert.ok(!watch.called, 'unwatch should stop callbacks');
		},

		'test getting a property causes it to depend on what it `get`s': function () {
			var Box = Subject.extend({
					volume: Cell.defineProperty({
						get: function () {
							return this.get('height') * this.get('width') * this.get('length');
						}
					})
				}),
				height = 20,
				width = 20,
				length = 3,
				initialVolume = height * width * length,
				box = new Box({
					height: height,
					width: width,
					length: length
				}),
				watch = this.spy(),
				handle;

			assert.equal(box.get('volume'), initialVolume, 'initial volume of box');
			handle = box.watch('volume', watch);

			height = 10;
			box.set('height', height);
			assert.ok(watch.calledWith('volume', initialVolume, height * width * length), 'dependent changed');
			assert.equal(1, watch.callCount, 'computed watch should only be called once');

			box.set('height', 50);
			assert.equal(2, watch.callCount, 'computed watch should still be active');

			handle.unwatch();
			box.set('height', 20);
			assert.equal(2, watch.callCount, 'computed watch should be removed');
		}
	});

	if (module == require.main) require('test').run(module.exports);
});