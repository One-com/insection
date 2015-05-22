Associate the given value with the specified interval.

Signature:

```js#evaluate:false
insection.add(p, value) => insection.add('[', p, p, ']', value);
insection.add(start, end, value) => insection.add('[', start, end, ']', value);
insection.add('[', start, end, ']', value) =>
  insection.add(Insection.interval('[', start, end, ']'), value);
insection.add('[', start, end, ')', value) =>
  insection.add(Insection.interval('[', start, end, ')'), value);
insection.add('(', start, end, ']', value) =>
  insection.add(Insection.interval('(', start, end, ']'), value);
insection.add('(', start, end, ')', value) =>
  insection.add(Insection.interval('(', start, end, ')'), value);
insection.add(interval, value);
```

Time complexity: `O(log(n))` where `n` is the number of intervals in the
data structure.

Example:

```js
var insection = new Insection();
insection.add('(', 4, 7, ']', 'foo');
expect(insection.contains('(', 4, 7, ']'), 'to be true');
```
