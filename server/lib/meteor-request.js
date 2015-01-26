// Get our NPM stuff.
request = Npm.require("request");

// Wrap request with something that can be `Meteor.wrapAsync`ed.
var requestAsync = function(uri, options, callback) {
	if (typeof uri === "function") {
		callback = uri;
		uri = undefined;
		options = undefined;
	}

	if (typeof options === "function") {
		callback = options;
		options = undefined;
	}

	request(uri, options, function(error, response, body) {
		if (error) {
			console.log(error);
			callback(error);
		} else {
			callback(null, {
				response: response,
				body: body
			});
		}
	});
};

// Make a sync function out of it.
var requestSync;
if (typeof Meteor.wrapAsync === "function") {
	requestSync = Meteor.wrapAsync(requestAsync);
} else {
	requestSync = Meteor._wrapAsync(requestAsync);
}

// Use this to extend the prototype
_.extend(request, {

	putSync: function(uri, options) {
		options.method = "PUT";
		return requestSync(uri, options);
	},

	patchSync: function(uri, options) {
		options.method = "PATCH";
		return requestSync(uri, options);
	},

	postSync: function(uri, options) {
		options.method = "POST";
		return requestSync(uri, options);
	},

	headSync: function(uri, options) {
		options.method = "HEAD";
		return requestSync(uri, options);
	},

	delSync: function(uri, options) {
		options.method = "DELETE";
		return requestSync(uri, options);
	},

	getSync: requestSync

});