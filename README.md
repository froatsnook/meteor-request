# meteor-request

A simplified HTTP client, packaged for Meteor (from npm)

This code is courtesy of saimeunt on StackOverflow, it was given to me [here](http://stackoverflow.com/questions/25654965/downloading-remote-images-using-meteor-cfs/25655326#25655326), as
part of a solution to a question I asked.

It was needed to address the lack of ability to deal with binary data over
Meteor's HTTP package, until they give us support for such.

Example use to grab something like an image is as follows:

```javascript
var result = request.getSync(url, {
	encoding: null
});

var buffer = result.body;
```

At which point, `buffer` contains unaltered image data that you can pass to
something like CollectionFS for storage, which can take a `Buffer` as input.

Why forked?
===========
Wasn't working on Mac OS X because native component bundled.
