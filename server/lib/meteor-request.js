// Get our NPM stuff.
request = Npm.require("request");

// Wrap request with something that can be `Meteor.wrapAsync`ed.
//
// @param r {Function}
//   request-like function (request itself or request.defaults result).
// @param key {String}
//   Name of request function to call, like "get" to call request.get.  If
//   null, then call request itself.
// @param args {...}
//   These args are forwarded to request.
// @param callback {Function}
//   Callback provided by Meteor.wrapAsync.
var callAsync = function(r, key /*, ...args, callback */) {
    var allArgs = new Array(arguments.length);
    for (var i = 0; i < allArgs.length; i++) {
        allArgs[i] = arguments[i];
    }

    // What to pass to request.
    var args = allArgs.slice(2, -1);

    // Meteor.wrapAync callback.
    var callback = allArgs[allArgs.length - 1];

    // Call either r itself or e.g. r.get
    var f = key ? r[key] : r;

    args.push(function(error, response, body) {
        if (error) {
            callback(error);
        } else {
            callback(null, {
                response: response,
                body: body
            });
        }
    });

    f.apply(r, args);
};

// Make a sync function out of callAsync..
var callSync;
if (typeof Meteor.wrapAsync === "function") {
    callSync = Meteor.wrapAsync(callAsync);
} else {
    callSync = Meteor._wrapAsync(callAsync);
}

// Copy sync versions of these methods to request in copySyncMethods.
var methods = ["put", "patch", "post", "head", "del", "get", null];

// Add sync methods to a request-like object (`request` itself or anything
// returned by `request.defaults`).
var copySyncMethods = function(r) {
    methods.forEach(function(method) {
        var fullName = method ? method + "Sync" : "sync";
        r[fullName] = function(/* args */) {
            var args = new Array(2 + arguments.length);
            args[0] = r;
            args[1] = method;
            for (var j = 0; j < arguments.length; j++) {
                args[2 + j] = arguments[j];
            }

            return callSync.apply(this, args);
        };
    });
};

// Add sync methods to global request object.
copySyncMethods(request);

// request.defaults returns a wrapper around the normal request API that
// defaults to whatever options you pass to it.  It doesn't have getSync and
// friends.  So replace request.defaults with a shim wrapper makes sure that
// getSync and friends are added to the returned request wrapper.
var originalDefaults = request.defaults;
request.defaults = function(options) {
    var defaultedRequest = originalDefaults.call(request, options);
    copySyncMethods(defaultedRequest);
    return defaultedRequest;
};

