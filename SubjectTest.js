(typeof define === "undefined" ? function ($) { $(require, exports, module); } : define)(
function (require, exports, module, undefined) {
	'use strict';

	var assert = require('assert'),
		compose = require('compose'),
		Subject = require('./Subject'),
		testCase = require('./test/promiseTestCase');

	module.exports = testCase({
		'test Subject has a defineProperty function': function () {
			assert.equal(typeof Subject.defineProperty, 'function');
		},

		'test defineProperty': testCase({
			'test a valid descriptor does not throw': function () {
				assert.doesNotThrow(function () {
					compose(Subject, {
						foo: Subject.defineProperty({
							value: 'foo'
						})
					});
				});
			},

			'test a bad descriptor throws a TypeError': function () {
				assert.throws(function () {
					compose(Subject, {
						foo: Subject.defineProperty('abc')
					});
				}, TypeError);
			},

			'test a bad getter throws a TypeError': function () {
				assert.throws(function () {
					compose(Subject, {
						foo: Subject.defineProperty({
							get: 'abc'
						})
					});
				}, TypeError);
			},

			'test a bad setter throws a TypeError': function () {
				assert.throws(function () {
					compose(Subject, {
						foo: Subject.defineProperty({
							set: 'abc'
						})
					});
				}, TypeError);
			},

			'test a confused descriptor throws a TypeError': function () {
				var spy = this.spy();

				assert.throws(function () {
					compose(Subject, {
						foo: Subject.defineProperty({
							set: spy,
							value: 'a'
						})
					});
				}, TypeError, 'set and value');
				assert.throws(function () {
					compose(Subject, {
						foo: Subject.defineProperty({
							set: spy,
							writable: true
						})
					});
				}, TypeError, 'set and writable');
				assert.throws(function () {
					compose(Subject, {
						foo: Subject.defineProperty({
							get: spy,
							value: 'a'
						})
					});
				}, TypeError, 'get and value');
				assert.throws(function () {
					compose(Subject, {
						foo: Subject.defineProperty({
							get: spy,
							writable: true
						})
					});
				}, TypeError, 'get and writable');
			},

			'test an empty descriptor observes default behavior': function () {
				var test = compose.create(Subject, {
						foo: Subject.defineProperty({})
					});

				assert.equal(test.get('foo'), undefined, 'value should be undefined');
				assert.throws(function () {
					test.set('foo', 'value');
				});
				assert.equal(test.get('foo'), undefined, 'writable should be false');
			},

			'test value is assigned': function () {
				var value = 'value',
					test = compose.create(Subject, {
						foo: Subject.defineProperty({
							value: value
						})
					});

				assert.equal(test.get('foo'), value, 'value should be assigned');
				assert.throws(function () {
					test.set('foo', 'value');
				});
				assert.equal(test.get('foo'), value, 'writable should be false');
			},

			'test writable is observed': function () {
				var value = 'value',
					test = compose.create(Subject, {
						foo: Subject.defineProperty({
							value: value,
							writable: true
						})
					});

				assert.equal(test.get('foo'), value);
				test.set('foo', 'abcd');
				assert.equal(test.get('foo'), 'abcd', 'writable should be observed');
			},

			'test get is called with key': function () {
				var foo = 'foo',
					get = this.stub().returns(foo),
					test = compose.create(Subject, {
						foo: Subject.defineProperty({
							get: get
						})
					});

				assert.equal(test.get('foo'), foo, 'returns value');

				assert.ok(get.alwaysCalledWithExactly('foo'), 'expected args');
				assert.ok(get.alwaysCalledOn(test), 'expected context');
			},

			'test set is called with key and value': function () {
				var foo = 'foo',
					set = this.stub().returns(foo),
					test = compose.create(Subject, {
						foo: Subject.defineProperty({
							set: set
						})
					});

				assert.equal(test.set('foo', foo), foo);

				assert.ok(set.alwaysCalledWithExactly('foo', foo));
				assert.ok(set.alwaysCalledOn(test));
			},

			'test setting value without setter throws TypeError': function () {
				var foo = 'foo',
					get = this.spy(),
					test = compose.create(Subject, {
						foo: Subject.defineProperty({
							get: get
						})
					});

				assert.throws(function () {
					test.set('foo', foo);
				}, TypeError);
			},

			'test getting value without getter returns undefined': function () {
				var foo = 'foo',
					set = this.stub().returns(foo),
					test = compose.create(Subject, {
						foo: Subject.defineProperty({
							set: set
						})
					});

				assert.equal(test.get('foo'), undefined, 'return undefined without getter');
			}
		})
	});

	if (module == require.main) require('test').run(module.exports);
});