(typeof define === "undefined" ? function ($) { $(require, exports, module); } : define)(
function (require, exports, module, undefined) {
	'use strict';

	function notify(handlers, key, old, value, context) {
		handlers.iterate(function (handler) {
			handler.call(context, key, old, value);
		});
	}
	var compose = require('compose'),
		Cell = require('./Cell'),
		List = require('./List'),
		frame,
		Subject;

	module.exports = Subject = Cell.extend({
		get: compose.around(function (get) {
			return function (key) {
				var subject = this._subject || (this._subject = {}),
					// list of observers for this property
					handlers = subject[key] || (subject[key] = new List()),
					// a list of watches for properties we have as dependents
					deps = handlers.deps,
					self = this,
					// remember previous frame so we can restore it
					prev = frame,
					// the value to return from get
					value;

				// add this property as a dependent to the existing frame
				if (frame) {
					frame.push({
						context: this,
						key: key
					});
				}

				if (deps) {
					// remove watches from previous list of dependents
					deps.iterate(function (handle) {
						handle.unwatch();
					});
				}

				// create a new list of dependents for this frame
				frame = new List();

				// do the actual get
				value = get.call(this, key);

				// watch the properties we depend on
				deps = handlers.deps = new List();
				frame.iterate(function (dependent) {
					// remember each handle so we can reset before the next get
					deps.push(dependent.context.watch(dependent.key, function () {
						// notify our observers when one of our dependents change
						notify(handlers, key, value, get.call(self, key), self);
					}));
				});

				// put the frame back to what it was
				frame = prev;

				// return the value for get
				return value;
			};
		}),

		set: compose.around(function (set) {
			return function (key) {
				var subject = this._subject || {},
					handlers = subject[key],
					// current is needed to be consistent with dojo/Stateful's notify
					current = this.get(key),
					value = set.apply(this, arguments);

				if (handlers) {
					notify(handlers, key, current, value, this);
				}

				return value;
			};
		}),

		watch: function (prop, handler) {
			var subject = this._subject || (this._subject = {}),
				handlers = subject[prop] || (subject[prop] = new List());
			return {
				unwatch: handlers.push(handler)
			};
		}
	});
});