Creates an interval for the given arguments.

Signature:

```js#evaluate:false
Insection.interval(p) => Insection.interval('[', p, p, ']');
Insection.interval(start, end) => Insection.interval('[', start, end, ']');
Insection.interval(startType, start, end, endType);
```

`startType` can be either `[` or `(`.
`endType` can be either `]` or `)`.

Example:

```js
expect(Insection.interval(4).toString(), 'to be', '[4;4]');
expect(Insection.interval(4, 5).toString(), 'to be', '[4;5]');
expect(Insection.interval('[', 4, 5, ']').toString(), 'to be', '[4;5]');
expect(Insection.interval('[', 4, 5, ')').toString(), 'to be', '[4;5)');
expect(Insection.interval('(', 4, 5, ']').toString(), 'to be', '(4;5]');
expect(Insection.interval('(', 4, 5, ')').toString(), 'to be', '(4;5)');
```
