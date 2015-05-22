Creates a new insection instance.

Signature:

```js#evaluate:false
new Insection(); => new Insection(defaultValueComparer);
new Insection(valueComparer);
```

where `defaultValueComparer` is:

```js
function defaultValueComparer(x, y) {
    if (x < y) { return -1; }
    if (x > y) { return 1; }
    return 0;
}
```

Values is required to have a total order, if you values does not
support the comparison operators you can specify a valueComparer.
