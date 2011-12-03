# Subject
 * dependent
 * target
 * object

## Description
[composable](https://github.com/kriszyp/compose) property descriptors.
defers to native [`Object.defineProperty`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/defineProperty) when suitable.
by calling `set` and `get`, much of what is provided by `Object.defineProperty` can be achieved.

## Examples

### support for data descriptors.
`value` and `writable` can be set.

```js
var value = 'value',
	it = compose.create(Subject, {
		foo: Subject.defineProperty({
			value: value,
			writable: false
		})
	});

it.set('foo', 'abc'); // throws a TypeError
```

### support for accessor descriptors
calling `set` for a property without a setter throws an Error.

```js
var it = compose.create(Subject, {
		foo: Subject.defineProperty({
			get: function (key) {
				// ...
			}
		})
	});

it.set('foo', 'abc'); // throws a TypeError
```

`get` and `set` from the property descriptor are used as the getter and setter

```js
var it = compose.create(Subject, {
		foo: Subject.defineProperty({
			get: function (key) {
				// called when get('foo') is called
			},
			set: function (key, value) {
				// called when set('foo', value) is called
			}
		})
	});

it.set('foo', 'abc'); // calls set from the property descriptor
```

**NOTE:* `configurable` and `enumerable` are not supported when not deferring to `Object.defineProperty`

## LICENSE
[BSD](http://www.opensource.org/licenses/bsd-license.php)
Copyright (c) 2011, Ben Hockey
