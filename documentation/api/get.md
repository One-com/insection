Retrieves the values for all intervals that intersect the given interval.

Signature:

```js#evaluate:false
insection.get() => insection.get('(', min, max, ')');
insection.get(p) => insection.get('[', p, p, ']');
insection.get(start, end) => insection.get('[', start, end, ']');
insection.get('[', start, end, ']') => insection.get(Insection.interval('[', start, end, ']'));
insection.get('[', start, end, ')') => insection.get(Insection.interval('[', start, end, ')'));
insection.get('(', start, end, ']') => insection.get(Insection.interval('(', start, end, ']'));
insection.get('(', start, end, ')') => insection.get(Insection.interval('(', start, end, ')'));
insection.get(interval);
```

Time complexity: `O(log(n*m))` where `n` is the number of intervals in
the data structure and `m` is the number of found intervals.

Example:

```js
var insection = new Insection();
insection.add(0, 4, 'foo');
insection.add('(', 2, 6, ']', 'bar');
insection.add('[', 2, Infinity, ')', 'baz');
insection.add('[', 2, Infinity, ')', 'qux');
expect(insection.get(1, 5).sort(), 'to equal', ['bar', 'baz', 'foo', 'qux']);
expect(insection.get(0, 2).sort(), 'to equal', ['baz', 'foo', 'qux']);
expect(insection.get('(', -Infinity, 2, ')').sort(), 'to equal', ['foo']);
expect(insection.get(2).sort(), 'to equal', ['baz', 'foo', 'qux']);
expect(insection.get().sort(), 'to equal', ['bar', 'baz', 'foo', 'qux']);
```
