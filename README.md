npm's top HTTP client, [request](https://github.com/request/request), packaged for Meteor

Meteor's `http` package is great, but it doesn't support retrieving binary data
(useful, for example, when downlading an image).  There are no plans to add
this feature since that the `http` package should behave the same on the client
as on the server.

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
* Install `meteor add froatsnook:request`

API
===
```javascript
var res1 = request.putSync(uri, options);
var res2 = request.patchSync(uri, options);
var res3 = request.postSync(uri, options);
var res4 = request.headSync(uri, options);
var res5 = request.delSync(uri, options);
var res6 = request.getSync(uri, options);
```

Params
------
The `uri` (which should be a fully qualified uri or a parsed url object from
`url.parse()`) is required.  The `options` are optional, and are passed on to
`request`.  See
[here](https://github.com/request/request#requestoptions-callback) for
supported options.

Errors
------
```javascript
try {
    var res = request.getSync(urlThatHangs, {
        timeout: 1000
    });
} catch (err) {
    console.assert(err.code === "ETIMEDOUT");
}
```

Example with Buffer POST body and response
------------------------------------------
```javascript
var buffer = new Buffer([0, 1]);
var res = request.postSync("http://example.com/echoPostBody", {
    body: buffer,
    encoding: null
});

console.assert(res.body instanceof Buffer);
console.assert(res.body.length === 2);
console.assert(res.body[0] === 0);
console.assert(res.body[1] === 1);
```

Why forked from czbaker:request?
================================
I added tests, removed the native dependency on `fibers` (by using
`Meteor.wrapAsync`), and updated to the latest `request`.

License
=======
MIT

