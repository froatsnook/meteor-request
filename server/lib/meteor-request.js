// Get our NPM stuff.
request = Npm.require("request");

// Wrap request with something that can be `Meteor.wrapAsync`ed.
//
// @param r
//   request object (either request itself or wrapper returned by
//   request.defaults).  Since this is a function, either uri or options must
//   be given or else Meteor.wrapAsync will perform strangely.
// @param uri
//   Fully qualified uri or a parsed url object from url.parse()
// @param [options] {Object}
//   Request options.  See https://github.com/request/request#requestoptions-callback
// @param callback {Function}
//   Meteor.wrapAsync's callback function.
var requestAsync = function(r, uri, options, callback) {
    if (typeof uri === "function") {
        callback = uri;
        uri = undefined;
        options = undefined;
    }

    if (typeof options === "function") {
        callback = options;
        options = undefined;
    }

    r(uri, options, function(error, response, body) {
        if (error) {
            callback(error);
        } else {
            callback(null, {
                response: response,
                body: body
            });
        }
    });
};

// Make a sync function out of requestAsync.
var requestSync;
if (typeof Meteor.wrapAsync === "function") {
    requestSync = Meteor.wrapAsync(requestAsync);
} else {
    requestSync = Meteor._wrapAsync(requestAsync);
}

// Add sync methods to a request-like object (`request` itself or anything
// returned by `request.defaults`).
var copySyncMethods = function(r) {
    _.extend(r, {
        putSync: function(uri, options) {
            if (!options) {
                options = { };
            }
            options.method = "PUT";
            return requestSync(r, uri, options);
        },
        patchSync: function(uri, options) {
            if (!options) {
                options = { };
            }
            options.method = "PATCH";
            return requestSync(r, uri, options);
        },
        postSync: function(uri, options) {
            if (!options) {
                options = { };
            }
            options.method = "POST";
            return requestSync(r, uri, options);
        },
        headSync: function(uri, options) {
            if (!options) {
                options = { };
            }
            options.method = "HEAD";
            return requestSync(r, uri, options);
        },
        delSync: function(uri, options) {
            if (!options) {
                options = { };
            }
            options.method = "DELETE";
            return requestSync(r, uri, options);
        },
        getSync: function(uri, options) {
            if (!options) {
                options = { };
            }
            return requestSync(r, uri, options);
        }
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

