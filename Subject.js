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

	var compose = require('compose'),
		Subject,
		hasOwn = Object.prototype.hasOwnProperty,
		useNative;

	module.exports = Subject = compose(function () {
		var subject = this._subject || {},
			descriptors = subject.descriptors;

		if (useNative && descriptors) {
			Object.defineProperties(this, descriptors);
		}
	},
	{
		get: function (key) {
			var subject = this._subject || {},
				descriptors = subject.descriptors || {},
				descriptor = descriptors[key] || {},
				get = descriptor.get;

			if (useNative || !(key in descriptors)) {
				return this[key];
			}

			if (!get) {
				if (descriptor._accessor) {
					return;
				}
				return this[key];
			}

			return get.call(this);
		},

		set: function (key, value) {
			console.log('setting', key, value);
			var subject = this._subject || {},
				descriptors = subject.descriptors || {},
				descriptor = descriptors[key] || {},
				set = descriptor.set;

			if (useNative || !(key in descriptors)) {
				return (this[key] = value);
			}

			if (!set) {
				if (descriptor._accessor) {
					throw new TypeError('Cannot set property ' + key + ' of ' + this + ' which has only a getter');
				}

				if (!descriptor.writable) {
					throw new TypeError('Cannot assign to read only property \'' + key + '\' of ' + this);
				}

				// TODO: is there a way to emulate enumerable with a "hidden" object
				return (this[key] = value);
			}

			return set.call(this, value);
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
				subject = this._subject || (this._subject = {}),
				descriptors = subject.descriptors || (subject.descriptors = {}),
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

			if (!useNative) {
				// XXX: configurable and enumerable are unsupported in this branch
				d._accessor = ('get' in d || 'set' in d);
				if ('value' in d) {
					this[key] = d.value;
				}
			}
			descriptors[key] = d;
		});
	};
});