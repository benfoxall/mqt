# mqt
Like mqtt, but more succinct

```js
const mqt = new MQT('config')

mqt.on('foo/*/baz', m => {
  console.log(`hello ${m}`)
})

mqt.publish('/foo/bar/baz', 'world')
```

Currently this is just a wrapper around the [Paho JavaScript client](http://www.eclipse.org/paho/clients/js/) giving a slightly nicer api.
