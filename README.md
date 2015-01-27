A simplified HTTP client, packaged for Meteor (from npm)

Meteor's HTTP package is great, but it doesn't support retrieving binary data
(useful, for example, when downlading an image).

Example
=======

```javascript
var result = request.getSync("https://meteor.com/meteor-logo.png", {
    encoding: null
});

var buffer = result.body;
```

This Buffer can be stored in the database or written to a file.

Setup
=====
* Install `meteor install froatsnook:request`

API
===
```javascript
var res1 = request.putSync(uri, options);
var res2 = request.patchSync(uri, options);
var res3 = request.postSync(uri, options);
var res4 = request.headSync(uri, options);
var res5 = request.delSync(uri, options);
var res5 = request.getSync(uri, options);
```

The `uri` is required.  `options` are optional, and are passed on to
`request`.

```javascript
try {
    var res = request.getSync(urlThatHangs, {
        timeout: 1000
    });
} catch (err) {
    console.assert(err.code === "ETIMEDOUT");
}
```

Why forked from czbaker:request?
================================
I added tests, removed the native dependency on `fibers` (by using
`Meteor.wrapAsync`), and updated to the latest `request`.

License
=======
MIT

