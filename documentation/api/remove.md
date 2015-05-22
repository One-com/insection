Removes the association between the given value and the specified interval.

Signature:

```js#evaluate:false
insection.remove(p, value) => insection.remove('[', p, p, ']', value);
insection.remove(start, end, value) => insection.remove('[', start, end, ']', value);
insection.remove('[', start, end, ']', value) =>
  insection.remove(Insection.interval('[', start, end, ']'), value);
insection.remove('[', start, end, ')', value) =>
  insection.remove(Insection.interval('[', start, end, ')'), value);
insection.remove('(', start, end, ']', value) =>
  insection.remove(Insection.interval('(', start, end, ']'), value);
insection.remove('(', start, end, ')', value) =>
  insection.remove(Insection.interval('(', start, end, ')'), value);
insection.remove(interval, value);
```

Time complexity: `O(log(n))` where `n` is the number of intervals in the
data structure.

Example:

```js
var insection = new Insection();
insection.add('(', 4, 7, ']', 'foo');
insection.add('[', 4, 7, ']', 'bar');
insection.remove('(', 4, 7, ']', 'foo');
expect(insection.contains('(', 4, 7, ']'), 'to be false');
expect(insection.contains('[', 4, 7, ']'), 'to be true');
```
