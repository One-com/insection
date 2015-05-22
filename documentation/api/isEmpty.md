Returns `true` if the insection does not contain any intervals; otherwise `false`.

Time complexity: `O(1)`.

Example:

```js
var insection = new Insection();
expect(insection.isEmpty(), 'to be true');
insection.add('(', 4, 7, ']', 'foo');
expect(insection.isEmpty(), 'to be false');
```
