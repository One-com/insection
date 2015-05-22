Retrieves the intervals that intersect the given interval.

Signature:

```js#evaluate:false
insection.getIntervals() => insection.getIntervals('(', min, max, ')');
insection.getIntervals(p) => insection.getIntervals('[', p, p, ']');
insection.getIntervals(start, end) => insection.getIntervals('[', start, end, ']');
insection.getIntervals('[', start, end, ']') =>
  insection.getIntervals(Insection.interval('[', start, end, ']'));
insection.getIntervals('[', start, end, ')') =>
  insection.getIntervals(Insection.interval('[', start, end, ')'));
insection.getIntervals('(', start, end, ']') =>
  insection.getIntervals(Insection.interval('(', start, end, ']'));
insection.getIntervals('(', start, end, ')') =>
  insection.getIntervals(Insection.interval('(', start, end, ')'));
insection.getIntervals(interval);
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
expect(insection.getIntervals(1, 5).map(String).sort(), 'to equal', [
  '(2;6]',
  '[0;4]',
  '[2;Infinity)',
  '[2;Infinity)'
]);
expect(insection.getIntervals(0, 2).map(String).sort(), 'to equal', [
  '[0;4]',
  '[2;Infinity)',
  '[2;Infinity)'
]);
expect(insection.getIntervals('(', -Infinity, 2, ')').map(String).sort(), 'to equal', ['[0;4]']);
expect(insection.getIntervals(2).map(String).sort(), 'to equal', [
  '[0;4]',
  '[2;Infinity)',
  '[2;Infinity)'
]);
expect(insection.getIntervals().map(String).sort(), 'to equal', [
  '(2;6]',
  '[0;4]',
  '[2;Infinity)',
  '[2;Infinity)'
]);
```
