(typeof define === "undefined" ? function ($) { $(require, exports, module); } : define)(
function (require, exports, module, undefined) {
	'use strict';

	var assert = require('assert'),
		compose = require('compose'),
		Cell = require('./Cell'),
		testCase = require('./test/promiseTestCase');

	module.exports = testCase({
		'test Cell has a defineProperty function': function () {
			assert.equal(typeof Cell.defineProperty, 'function', 'define property is a function');
		},

		'test defineProperty': testCase({
			'test a valid descriptor does not throw': function () {
				assert.doesNotThrow(function () {
					Cell.extend({
						foo: Cell.defineProperty({
							value: 'foo'
						})
					});
				});
			},

			'test a bad descriptor throws a TypeError': function () {
				assert.throws(function () {
					Cell.extend({
						foo: Cell.defineProperty('abc')
					});
				}, TypeError, 'bad descriptor throws TypeError');
			},

			'test a bad getter throws a TypeError': function () {
				assert.throws(function () {
					Cell.extend({
						foo: Cell.defineProperty({
							get: 'abc'
						})
					});
				}, TypeError, 'bad getter throws TypeError');
			},

			'test a bad setter throws a TypeError': function () {
				assert.throws(function () {
					Cell.extend({
						foo: Cell.defineProperty({
							set: 'abc'
						})
					});
				}, TypeError, 'bad setter throws TypeError');
			},

			'test a confused descriptor throws a TypeError': function () {
				var spy = this.spy();

				assert.throws(function () {
					Cell.extend({
						foo: Cell.defineProperty({
							set: spy,
							value: 'a'
						})
					});
				}, TypeError, 'set and value');
				assert.throws(function () {
					Cell.extend({
						foo: Cell.defineProperty({
							set: spy,
							writable: true
						})
					});
				}, TypeError, 'set and writable');
				assert.throws(function () {
					Cell.extend({
						foo: Cell.defineProperty({
							get: spy,
							value: 'a'
						})
					});
				}, TypeError, 'get and value');
				assert.throws(function () {
					Cell.extend({
						foo: Cell.defineProperty({
							get: spy,
							writable: true
						})
					});
				}, TypeError, 'get and writable');
			},

			'test an empty descriptor observes default behavior': function () {
				var test = compose.create(Cell, {
						foo: Cell.defineProperty({})
					});

				assert.equal(test.get('foo'), undefined, 'value should be undefined');
				assert.throws(function () {
					test.set('foo', 'value');
				});
				assert.equal(test.get('foo'), undefined, 'writable should be false');
			},

			'test value is assigned': function () {
				var value = 'value',
					test = compose.create(Cell.extend({
						foo: Cell.defineProperty({
							value: value
						})
					}));

				assert.equal(test.get('foo'), value, 'value should be assigned');
				assert.throws(function () {
					test.set('foo', 'new');
				}, TypeError, 'setting non-writable should throw');
				assert.equal(test.get('foo'), value, 'writable should be false');
			},

			'test writable is observed': function () {
				var value = 'value',
					test = compose.create(Cell.extend({
						foo: Cell.defineProperty({
							value: value,
							writable: true
						})
					}));

				assert.equal(test.get('foo'), value, '`writable: true` can be get');
				test.set('foo', 'abcd');
				assert.equal(test.get('foo'), 'abcd', '`writable: true` can be set');
			},

			'test calling get': function () {
				var foo = 'foo',
					get = this.stub().returns(foo),
					test = compose.create(Cell.extend({
						foo: Cell.defineProperty({
							get: get
						})
					}));

				assert.equal(test.get('foo'), foo, 'returns value');
				assert.ok(get.alwaysCalledOn(test), 'expected context');
			},

			'test calling set is called with value': function () {
				var foo = 'foo',
					set = this.stub().returns(foo),
					test = compose.create(Cell.extend({
						foo: Cell.defineProperty({
							set: set
						})
					}));

				assert.equal(test.set('foo', foo), foo, 'returns value');
				assert.ok(set.alwaysCalledWithExactly(foo), 'expected args');
				assert.ok(set.alwaysCalledOn(test), 'expected context');
			},

			'test setting value without setter throws TypeError': function () {
				var foo = 'foo',
					get = this.spy(),
					test = compose.create(Cell.extend({
						foo: Cell.defineProperty({
							get: get
						})
					}));

				assert.throws(function () {
					test.set('foo', foo);
				}, TypeError, 'setting without setter throws TypeError');
			},

			'test getting value without getter returns undefined': function () {
				var foo = 'foo',
					set = this.stub().returns(foo),
					test = compose.create(Cell.extend({
						foo: Cell.defineProperty({
							set: set
						})
					}));

				assert.equal(test.get('foo'), undefined, 'return undefined without getter');
			},

			'test properties without descriptors can be set and get': function () {
				var foo = 'foo',
					bar = 'bar',
					test = compose.create(Cell.extend({
						foo: foo
					}));

				assert.equal(test.get('foo'), foo, 'getting without descriptor');
				assert.equal(test.set('bar', bar), bar, 'setting without descriptor');
			},

			'test constructor calls set for each property in mixin': function () {
				var mixin = {
						a: 'a',
						b: 'b'
					},
					Ctor = Cell.extend({
						set: this.spy()
					}),
					cell = new Ctor(mixin);

				Object.keys(mixin).forEach(function (key) {
					assert.ok(cell.set.calledWith(key, mixin[key]), 'constructor called set for ' + key);
				});
			}
		})
	});

	if (module == require.main) require('test').run(module.exports);
});