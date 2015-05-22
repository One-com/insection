Returns `true` if the insection contains the given interval; otherwise `false`.

Signature:

```js#evaluate:false
insection.contains(p) => insection.contains('[', p, p, ']');
insection.contains(start, end) => insection.contains('[', start, end, ']');
insection.contains('[', start, end, ']') =>
  insection.contains(Insection.interval('[', start, end, ']'));
insection.contains('[', start, end, ')') =>
  insection.contains(Insection.interval('[', start, end, ')'));
insection.contains('(', start, end, ']') =>
  insection.contains(Insection.interval('(', start, end, ']'));
insection.contains('(', start, end, ')') =>
  insection.contains(Insection.interval('(', start, end, ')'));
insection.contains(interval);
```

Time complexity: `O(log(n))` where `n` is the number of intervals in the
data structure.

Example:

```js
var insection = new Insection();
insection.add(0, 4, 'foo');
insection.add('(', 2, 6, ']', 'bar');
expect(insection.contains(0, 4), 'to be true');
expect(insection.contains('(', 0, 4, ']'), 'to be false');
expect(insection.contains('[', 0, 4, ']'), 'to be true');
expect(insection.contains(0, 5), 'to be false');
```
