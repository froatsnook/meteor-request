npm's top HTTP client, [request](https://github.com/request/request), packaged for Meteor

Motivation
==========
Meteor's `http` package is great, but it doesn't support retrieving binary data (useful, for example, when downlading an image).  There are no plans to add this feature since the `http` package should behave the same on the client as on the server.

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
* Don't forget to import if using meteor 1.3 or later

```javascript
import { request } from "meteor/froatsnook:request";
```

API
===
```javascript
var res0 = request.sync(uri, options);      // sync version of calling request directly
var res1 = request.putSync(uri, options);   // sync version of calling request.put
var res2 = request.patchSync(uri, options); // sync version of calling request.patch
var res3 = request.postSync(uri, options);  // sync version of calling request.post
var res4 = request.headSync(uri, options);  // sync version of calling request.head
var res5 = request.delSync(uri, options);   // sync version of calling request.del
var res6 = request.getSync(uri, options);   // sync version of calling request.get
```

Response object
---------------
Callbacks passed to `request` are called with 3 parameters.  The `error`, the `response`, and the `body`.  The `response` and `body` are returned as an object: `{ response, body }`.  And `error` is thrown (see below).

```javascript
// request.js
request("http://www.google.com", function(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body) // Show the HTML for the Google homepage.
    }
})

// meteor-request
try {
    var res = request.sync("http://google.com");
    if (res.response.statusCode == 200) {
        console.log(res.body);
    }
} catch (error) {
    // See below for info on errors
}
```

Errors
------
Normal errors generate non-2XX status codes.

```javascript
var res = request.getSync(urlThatDoesNotExist);
console.assert(res.response.statusCode === 404);
```

Other errors (mostly from [`http.ClientRequest`](http://nodejs.org/api/http.html#http_class_http_clientrequest)) are thrown.  This happens when `request` gives an error in its first callback parameter.

```javascript
try {
    var res = request.getSync(urlThatHangs, {
        timeout: 1000
    });
} catch (err) {
    console.assert(err.code === "ETIMEDOUT");
}
```

Params
------
The `uri` and `options` are both optional, but either `uri` or `options.uri` (or alias `options.url`) should be set as a fully qualified uri or a parsed URL object from `url.parse`.  The `options` are passed on to `request`.  See [here](https://github.com/request/request#requestoptions-callback) for supported options.

request.defaults
----------------
`request.defaults` returns a wrapper around the normal request API that defaults to whatever options you pass to it.  As of `meteor-request` 2.53.1, the returned wrapper includes `getSync` and friends.

```javascript
var requestWithToken = request.defaults({
    headers: { "X-TOKEN": "d0d0309d-69cb-4435-bd43-8f3ac9266039" }
});

// Both of these requests send the X-TOKEN header.
var res1 = requestWithToken.getSync(url1);
var res2 = requestWithToken.getSync(url2);
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
I added tests, removed the native dependency on `fibers` (by using `Meteor.wrapAsync`), updated to the latest `request`, and added new features like `request.defaults` support.

Versioning
==========
This project doesn't use semver since it tracks request's version numbers.  Sorry for the inconvenience.

License
=======
MIT

