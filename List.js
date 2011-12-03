(typeof define === "undefined" ? function ($) { $(require, exports, module); } : define)(
function (require, exports, module, undefined) {
	'use strict';

	function remove(node) {
		node.next.prev = node.prev;
		node.prev.next = node.next;
		node.prev = node.next = null;
	}

	function Node(next, prev, data) {
		this.next = next || this;
		this.prev = prev || this;
		this.data = data;

		if (next) next.prev = this;
		if (prev) prev.next = this;
	}

	var compose = require('compose');

	module.exports = compose(Node, {
		push: function (it) {
			var node = new Node(this, this.prev, it);

			this.prev = node;

			return function () {
				remove(node);
			};
		},

		iterate: function (iterator, context) {
			context = context || null;

			var node = this;

			while((node = node.next) !== this) {
				iterator.call(context, node.data);
			}
		}
	});
});