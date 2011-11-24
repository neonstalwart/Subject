(typeof define === "undefined" ? function ($) { $(require, exports, module); } : define)(
function (require, exports, module, undefined) {
	'use strict';

	function hasNative() {
		// TODO: write test to avoid faulty implementation in IE8
		return typeof Object.defineProperty === 'function';
	}

	function shouldUseNative() {
		if ('useNative' in module.exports) {
			return module.exports.useNative;
		}
		return hasNative();
	}

	function getter(key) {
		// TODO: is there a way to emulate enumerable with a "hidden" object
		return this[key];
	}

	function setter(key, value) {
		var descriptor = this.constructor._descriptors[key],
			writable = descriptor._accessor || descriptor.writable;

		if (!writable) {
			throw new TypeError("Cannot assign to read only property '" + key + "' of " + this);
		}

		// TODO: is there a way to emulate enumerable with a "hidden" object
		return (this[key] = value);
	}

	var compose = require('compose'),
		Subject,
		hasOwn = Object.prototype.hasOwnProperty,
		useNative;

	module.exports = Subject = compose({
		get: function (key) {
			var descriptors = this.constructor._descriptors,
				descriptor = descriptors[key] || {},
				get = descriptor.get;

			if (useNative || !(key in descriptors)) {
				return this[key];
			}

			if (get === getter && descriptor._accessor) {
				return;
			}

			return descriptors[key].get.call(this, key);
		},

		set: function (key, value) {
			var descriptors = this.constructor._descriptors,
				descriptor = descriptors[key] || {},
				set = descriptor.set;

			if (useNative || !(key in descriptors)) {
				return (this[key] = value);
			}

			if (set === setter && descriptor._accessor) {
				throw new TypeError('Cannot set property ' + key + ' of ' + this + ' which has only a getter');
			}

			return set.call(this, key, value);
		}
	});

	Subject.defineProperty = function (descriptor) {
		if (!descriptor || typeof descriptor !== 'object') {
			throw new TypeError('Property description must be an object: ' + descriptor);
		}

		if (typeof useNative === 'undefined') {
			useNative = shouldUseNative();
		}

		return new compose.Decorator(function (key) {
			// adapted from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/defineProperties
			var d = {},
				descriptors = this.constructor._descriptors || (this.constructor._descriptors = {}),
				get,
				set;

			if (hasOwn.call(descriptor, 'enumerable')) d.enumerable = !!descriptor.enumerable;
			if (hasOwn.call(descriptor, 'configurable')) d.configurable = !!descriptor.configurable;
			if (hasOwn.call(descriptor, 'value')) d.value = descriptor.value;
			if (hasOwn.call(descriptor, 'writable')) d.writable = !!descriptor.writable;
			if (hasOwn.call(descriptor, 'get')) {
				get = descriptor.get;
				if (typeof get !== 'function') throw new TypeError('Getter must be a function: ' + get);
				d.get = get;
			}
			if (hasOwn.call(descriptor, 'set')) {
				set = descriptor.set;
				if (typeof set !== 'function') throw new TypeError('Setter must be a function: ' + get);
				d.set = set;
			}

			if (('get' in d || 'set' in d) && ('value' in d || 'writable' in d)) {
				throw new TypeError('Invalid property. A property cannot both have accessors and be writable or have a value, ' + descriptor);
			}

			if (useNative) {
				// curry the key if using native
				if (get) {
					d.get = function () {
						return get.call(this, key);
					};
				}
				if (set) {
					d.set = function (value) {
						return set.call(this, key, value);
					};
				}
				Object.defineProperty(this, key, d);
			}
			else {
				// XXX: configurable and enumerable are unsupported in this branch
				d._accessor = ('get' in d || 'set' in d);
				d.get || (d.get = getter);
				d.set || (d.set = setter);
				descriptors[key] = d;
				if ('value' in d) {
					this[key] = d.value;
				}
			}
		});
	};
});