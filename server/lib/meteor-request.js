// Get our NPM stuff.
request = Npm.require("request");

// Wrap request with something that can be `Meteor.wrapAsync`ed.
//
// @param r
//   request object (either request itself or wrapper returned by
//   request.defaults).  Since this is a function, either uri or options must
//   be given or else Meteor.wrapAsync will perform strangely.
// @param options {Object}
//   Request options.  See https://github.com/request/request#requestoptions-callback
// @param callback {Function}
//   Meteor.wrapAsync's callback function.
var requestAsync = function(r, options, callback) {
    r(options, function(error, response, body) {
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

// Check if a uri looks like a parsed URL object.
var uriLooksLikeURL = function(uri) {
    if (!uri || typeof uri !== "object") {
        return false;
    }

    if (typeof uri.path !== "string") {
        return false;
    }

    if (typeof uri.href !== "string") {
        return false;
    }

    return true;
}

var constructOptions = function(uri, options) {
    if (typeof options === "object") {
        _.extend(options, { uri: uri });
    } else if (typeof uri === "string" || uriLooksLikeURL(uri)) {
        options = { uri: uri };
    } else if (typeof uri === "object") {
        options = uri;
    }

    return options || uri || { };
};

// Add sync methods to a request-like object (`request` itself or anything
// returned by `request.defaults`).
var copySyncMethods = function(r) {
    _.extend(r, {
        putSync: function(uri, options) {
            options = constructOptions(uri, options);
            options.method = "PUT";
            return requestSync(r, options);
        },
        patchSync: function(uri, options) {
            options = constructOptions(uri, options);
            options.method = "PATCH";
            return requestSync(r, options);
        },
        postSync: function(uri, options) {
            options = constructOptions(uri, options);
            options.method = "POST";
            return requestSync(r, options);
        },
        headSync: function(uri, options) {
            options = constructOptions(uri, options);
            options.method = "HEAD";
            return requestSync(r, options);
        },
        delSync: function(uri, options) {
            options = constructOptions(uri, options);
            options.method = "DELETE";
            return requestSync(r, options);
        },
        getSync: function(uri, options) {
            options = constructOptions(uri, options);
            return requestSync(r, options);
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

